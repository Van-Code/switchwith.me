/**
 * @jest-environment node
 */
import { POST } from './route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    conversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/features', () => ({
  isPayToChatEnabled: jest.fn(() => false),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('POST /api/conversations', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  const mockOtherUserId = 'user-456';
  const mockListingId = 'listing-789';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('Authentication', () => {
    it('returns 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ otherUserId: mockOtherUserId }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Validation', () => {
    it('returns 400 if otherUserId is missing', async () => {
      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing otherUserId');
    });
  });

  describe('Duplicate Prevention - Listing-specific', () => {
    it('returns existing conversation if one exists for the same listing', async () => {
      const existingConversation = {
        id: 'conv-123',
        listingId: mockListingId,
        participants: [
          {
            userId: mockSession.user.id,
            user: {
              id: mockSession.user.id,
              profile: { firstName: 'Test', lastInitial: 'U' },
            },
          },
          {
            userId: mockOtherUserId,
            user: {
              id: mockOtherUserId,
              profile: { firstName: 'Other', lastInitial: 'U' },
            },
          },
        ],
        messages: [],
        listing: { id: mockListingId },
      };

      (prisma.conversation.findFirst as jest.Mock).mockResolvedValueOnce(
        existingConversation
      );

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          otherUserId: mockOtherUserId,
          listingId: mockListingId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversation.id).toBe('conv-123');
      expect(data.conversation.listingId).toBe(mockListingId);

      // Verify that findFirst was called with correct listing filter
      expect(prisma.conversation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            listingId: mockListingId,
          }),
        })
      );
    });

    it('does not create duplicate conversation for same listing + user combo', async () => {
      const existingConversation = {
        id: 'conv-existing',
        listingId: mockListingId,
        participants: [],
        messages: [],
        listing: {},
      };

      (prisma.conversation.findFirst as jest.Mock).mockResolvedValueOnce(
        existingConversation
      );

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          otherUserId: mockOtherUserId,
          listingId: mockListingId,
        }),
      });

      await POST(request);

      // Verify create was NOT called
      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });
  });

  describe('Conversation Creation', () => {
    it('creates new conversation with listingId when provided', async () => {
      // No existing conversation
      (prisma.conversation.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // No listing-specific conversation
        .mockResolvedValueOnce(null); // No user-to-user conversation

      const newConversation = {
        id: 'conv-new',
        listingId: mockListingId,
        participants: [],
        messages: [],
        listing: {},
      };

      (prisma.conversation.create as jest.Mock).mockResolvedValue(newConversation);
      (prisma.creditTransaction.create as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          otherUserId: mockOtherUserId,
          listingId: mockListingId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversation.id).toBe('conv-new');
      expect(data.conversation.listingId).toBe(mockListingId);

      // Verify conversation was created with listingId
      expect(prisma.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            listingId: mockListingId,
          }),
        })
      );
    });

    it('creates new conversation without listingId when not provided', async () => {
      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(null);

      const newConversation = {
        id: 'conv-new',
        listingId: null,
        participants: [],
        messages: [],
        listing: null,
      };

      (prisma.conversation.create as jest.Mock).mockResolvedValue(newConversation);
      (prisma.creditTransaction.create as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          otherUserId: mockOtherUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversation.listingId).toBeNull();
    });
  });

  describe('Existing User Conversation Handling', () => {
    it('updates existing user conversation with listingId if missing', async () => {
      const existingUserConversation = {
        id: 'conv-existing',
        listingId: null,
        participants: [],
        messages: [],
        listing: null,
      };

      const updatedConversation = {
        ...existingUserConversation,
        listingId: mockListingId,
        listing: { id: mockListingId },
      };

      // First call for listing-specific check (returns null)
      // Second call for user-to-user check (returns existing)
      (prisma.conversation.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingUserConversation);

      (prisma.conversation.update as jest.Mock).mockResolvedValue(updatedConversation);

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          otherUserId: mockOtherUserId,
          listingId: mockListingId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversation.listingId).toBe(mockListingId);

      // Verify update was called
      expect(prisma.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-existing' },
          data: { listingId: mockListingId },
        })
      );
    });

    it('returns existing user conversation without updating if listingId already set', async () => {
      const existingUserConversation = {
        id: 'conv-existing',
        listingId: 'another-listing',
        participants: [],
        messages: [],
        listing: { id: 'another-listing' },
      };

      (prisma.conversation.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingUserConversation);

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          otherUserId: mockOtherUserId,
          listingId: mockListingId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversation.id).toBe('conv-existing');

      // Verify update was NOT called
      expect(prisma.conversation.update).not.toHaveBeenCalled();
    });
  });
});
