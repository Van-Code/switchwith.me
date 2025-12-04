import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteAccountSection } from './DeleteAccountSection';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next-auth
const mockSignOut = jest.fn();
jest.mock('next-auth/react', () => ({
  signOut: mockSignOut,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: (props: any) => <svg data-testid="alert-triangle-icon" {...props} />,
  Loader2: (props: any) => <svg data-testid="loader-icon" {...props} />,
}));

// Mock fetch
global.fetch = jest.fn();

describe('DeleteAccountSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders danger zone card', () => {
      render(<DeleteAccountSection />);
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    });

    it('renders delete account button', () => {
      render(<DeleteAccountSection />);
      expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    });

    it('renders alert triangle icon', () => {
      render(<DeleteAccountSection />);
      expect(screen.getAllByTestId('alert-triangle-icon')).toHaveLength(1);
    });

    it('displays danger zone description', () => {
      render(<DeleteAccountSection />);
      expect(screen.getByText(/permanently delete your account/i)).toBeInTheDocument();
    });

    it('does not show dialog initially', () => {
      render(<DeleteAccountSection />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Opening Dialog', () => {
    it('opens dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      const deleteButton = screen.getByRole('button', { name: /^delete account$/i });
      await user.click(deleteButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('displays warning title in dialog', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      expect(screen.getByText(/delete your account/i)).toBeInTheDocument();
    });

    it('displays list of items that will be deleted', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      expect(screen.getByText(/your profile and account information/i)).toBeInTheDocument();
      expect(screen.getByText(/all your active and inactive listings/i)).toBeInTheDocument();
      expect(screen.getByText(/all your conversations and messages/i)).toBeInTheDocument();
      expect(screen.getByText(/all your notifications and matches/i)).toBeInTheDocument();
    });

    it('shows confirmation input field', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      expect(screen.getByPlaceholderText('DELETE')).toBeInTheDocument();
    });

    it('shows cancel and confirm buttons', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /yes, delete my account/i })).toBeInTheDocument();
    });
  });

  describe('Confirmation Input', () => {
    it('accepts user input in confirmation field', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      expect(confirmInput).toHaveValue('DELETE');
    });

    it('delete button is disabled until DELETE is typed', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const deleteButton = screen.getByRole('button', { name: /yes, delete my account/i });
      expect(deleteButton).toBeDisabled();

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      expect(deleteButton).not.toBeDisabled();
    });

    it('delete button is disabled with partial input', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DEL');

      const deleteButton = screen.getByRole('button', { name: /yes, delete my account/i });
      expect(deleteButton).toBeDisabled();
    });

    it('clears error message when typing in confirmation field', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      // Try to delete without typing DELETE
      const deleteButton = screen.getByRole('button', { name: /yes, delete my account/i });
      await user.click(deleteButton);

      expect(await screen.findByText(/please type "DELETE" to confirm/i)).toBeInTheDocument();

      // Start typing
      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'D');

      expect(screen.queryByText(/please type "DELETE" to confirm/i)).not.toBeInTheDocument();
    });
  });

  describe('Closing Dialog', () => {
    it('closes dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('resets confirmation text when dialog is closed', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'TEST');

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));
      const newConfirmInput = screen.getByPlaceholderText('DELETE');
      expect(newConfirmInput).toHaveValue('');
    });

    it('resets error message when dialog is closed', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));
      await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

      expect(await screen.findByText(/please type "DELETE" to confirm/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      expect(screen.queryByText(/please type "DELETE" to confirm/i)).not.toBeInTheDocument();
    });
  });

  describe('Account Deletion', () => {
    it('shows error if DELETE not typed correctly', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));
      const deleteButton = screen.getByRole('button', { name: /yes, delete my account/i });

      // Button is still enabled when we try to click it programmatically
      // But in real UI, it would be disabled. We're testing the validation logic.
      await user.click(deleteButton);

      expect(await screen.findByText(/please type "DELETE" to confirm/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('calls API to delete account when confirmed', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      mockSignOut.mockResolvedValueOnce(undefined);

      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      const deleteButton = screen.getByRole('button', { name: /yes, delete my account/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/account', {
          method: 'DELETE',
        });
      });
    });

    it('signs out user after successful deletion', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      mockSignOut.mockResolvedValueOnce(undefined);

      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('redirects to home with deleted parameter', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      mockSignOut.mockResolvedValueOnce(undefined);

      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/?deleted=true');
      });
    });

    it('shows loading state during deletion', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

      expect(await screen.findByText(/deleting\.\.\./i)).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('disables all buttons during deletion', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /deleting\.\.\./i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      });
    });

    it('disables confirmation input during deletion', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

      await waitFor(() => {
        expect(confirmInput).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message if API call fails', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Account deletion failed' }),
      });

      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

      expect(await screen.findByText(/account deletion failed/i)).toBeInTheDocument();
    });

    it('shows generic error for network failures', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

      expect(await screen.findByText(/network error/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('re-enables buttons after error', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      const confirmInput = screen.getByPlaceholderText('DELETE');
      await user.type(confirmInput, 'DELETE');

      await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /yes, delete my account/i })).not.toBeDisabled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<DeleteAccountSection />);
      expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    });

    it('confirmation input has proper label', async () => {
      const user = userEvent.setup();
      render(<DeleteAccountSection />);

      await user.click(screen.getByRole('button', { name: /^delete account$/i }));

      expect(screen.getByLabelText(/type delete to confirm/i)).toBeInTheDocument();
    });
  });
});
