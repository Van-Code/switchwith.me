import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountDeletedMessage } from './AccountDeletedMessage';

// Mock next/navigation
const mockGet = jest.fn();
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle2: (props: any) => <svg data-testid="check-circle-icon" {...props} />,
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
}));

describe('AccountDeletedMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('does not render when deleted parameter is not present', () => {
      mockGet.mockReturnValue(null);
      render(<AccountDeletedMessage />);

      expect(screen.queryByText(/account deleted/i)).not.toBeInTheDocument();
    });

    it('does not render when deleted parameter is not "true"', () => {
      mockGet.mockReturnValue('false');
      render(<AccountDeletedMessage />);

      expect(screen.queryByText(/account deleted/i)).not.toBeInTheDocument();
    });

    it('renders when deleted parameter is "true"', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();
    });

    it('displays success message', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(
        screen.getByText(/your account and all associated data have been permanently deleted/i)
      ).toBeInTheDocument();
    });

    it('renders check circle icon', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('renders close button', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('renders X icon in close button', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies success styling classes', () => {
      mockGet.mockReturnValue('true');
      const { container } = render(<AccountDeletedMessage />);

      const messageContainer = container.querySelector('.bg-green-50');
      expect(messageContainer).toBeInTheDocument();
    });

    it('has fixed positioning', () => {
      mockGet.mockReturnValue('true');
      const { container } = render(<AccountDeletedMessage />);

      const outerContainer = container.querySelector('.fixed');
      expect(outerContainer).toBeInTheDocument();
    });
  });

  describe('Auto-Hide Behavior', () => {
    it('auto-hides after 10 seconds', async () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();

      // Fast-forward time by 10 seconds
      jest.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(screen.queryByText('Account Deleted')).not.toBeInTheDocument();
      });
    });

    it('does not hide before 10 seconds', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();

      // Fast-forward time by 9 seconds
      jest.advanceTimersByTime(9000);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();
    });

    it('cleans up timer on unmount', () => {
      mockGet.mockReturnValue('true');
      const { unmount } = render(<AccountDeletedMessage />);

      // Unmount before timer completes
      unmount();

      // Should not cause any errors
      jest.advanceTimersByTime(10000);
    });
  });

  describe('Manual Close', () => {
    it('closes when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Account Deleted')).not.toBeInTheDocument();
      });
    });

    it('cancels auto-hide timer when manually closed', async () => {
      const user = userEvent.setup({ delay: null });
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();

      // Close manually after 5 seconds
      jest.advanceTimersByTime(5000);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Account Deleted')).not.toBeInTheDocument();
      });

      // Advance remaining time - should not cause any issues
      jest.advanceTimersByTime(5000);
    });
  });

  describe('URL Parameter Integration', () => {
    it('checks for "deleted" query parameter', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(mockGet).toHaveBeenCalledWith('deleted');
    });

    it('requires exact value "true" to show message', () => {
      mockGet.mockReturnValue('1');
      render(<AccountDeletedMessage />);

      expect(screen.queryByText('Account Deleted')).not.toBeInTheDocument();
    });

    it('handles null parameter', () => {
      mockGet.mockReturnValue(null);
      render(<AccountDeletedMessage />);

      expect(screen.queryByText('Account Deleted')).not.toBeInTheDocument();
    });

    it('handles empty string parameter', () => {
      mockGet.mockReturnValue('');
      render(<AccountDeletedMessage />);

      expect(screen.queryByText('Account Deleted')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Renders', () => {
    it('handles component re-renders correctly', () => {
      mockGet.mockReturnValue('true');
      const { rerender } = render(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();

      rerender(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();
    });

    it('shows message again if parameter changes from false to true', () => {
      mockGet.mockReturnValue('false');
      const { rerender } = render(<AccountDeletedMessage />);

      expect(screen.queryByText('Account Deleted')).not.toBeInTheDocument();

      mockGet.mockReturnValue('true');
      rerender(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('close button has aria-label', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      expect(screen.getByRole('button', { name: /close/i })).toHaveAttribute(
        'aria-label',
        'Close'
      );
    });

    it('message is accessible to screen readers', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      const heading = screen.getByText('Account Deleted');
      expect(heading).toBeInTheDocument();

      const description = screen.getByText(
        /your account and all associated data have been permanently deleted/i
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('uses green color scheme for success', () => {
      mockGet.mockReturnValue('true');
      const { container } = render(<AccountDeletedMessage />);

      const message = container.querySelector('.text-green-900');
      expect(message).toBeInTheDocument();
    });

    it('displays success icon', () => {
      mockGet.mockReturnValue('true');
      render(<AccountDeletedMessage />);

      const icon = screen.getByTestId('check-circle-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid parameter changes', () => {
      mockGet.mockReturnValue('true');
      const { rerender } = render(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();

      mockGet.mockReturnValue('false');
      rerender(<AccountDeletedMessage />);

      expect(screen.queryByText('Account Deleted')).not.toBeInTheDocument();

      mockGet.mockReturnValue('true');
      rerender(<AccountDeletedMessage />);

      expect(screen.getByText('Account Deleted')).toBeInTheDocument();
    });

    it('handles component unmount during auto-hide countdown', () => {
      mockGet.mockReturnValue('true');
      const { unmount } = render(<AccountDeletedMessage />);

      jest.advanceTimersByTime(5000);

      unmount();

      // Should not cause errors
      expect(() => jest.advanceTimersByTime(5000)).not.toThrow();
    });
  });
});
