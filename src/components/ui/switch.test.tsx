import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Switch } from './switch';

// Mock Radix UI Switch
jest.mock('@radix-ui/react-switch', () => ({
  Root: React.forwardRef(({ children, onCheckedChange, checked, defaultChecked, disabled, ...props }: any, ref: any) => (
    <button
      ref={ref}
      role="switch"
      aria-checked={checked ?? defaultChecked ?? false}
      disabled={disabled}
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      {...props}
    >
      {children}
    </button>
  )),
  Thumb: ({ ...props }: any) => <span data-testid="switch-thumb" {...props} />,
}));

describe('Switch', () => {
  describe('Rendering', () => {
    it('renders switch component', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders thumb element', () => {
      render(<Switch />);
      expect(screen.getByTestId('switch-thumb')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<Switch ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('renders unchecked by default', () => {
      render(<Switch />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('renders checked when checked prop is true', () => {
      render(<Switch checked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('renders with defaultChecked', () => {
      render(<Switch defaultChecked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('handles disabled state', () => {
      render(<Switch disabled />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });
  });

  describe('Styling', () => {
    it('applies base switch styles', () => {
      const { container } = render(<Switch />);
      const switchElement = container.querySelector('[role="switch"]');
      expect(switchElement).toHaveClass('peer', 'inline-flex', 'h-6', 'w-11');
    });

    it('applies custom className', () => {
      const { container } = render(<Switch className="custom-switch" />);
      const switchElement = container.querySelector('[role="switch"]');
      expect(switchElement).toHaveClass('custom-switch');
    });

    it('applies checked state styling class', () => {
      const { container } = render(<Switch checked />);
      const switchElement = container.querySelector('[data-state="checked"]');
      expect(switchElement).toBeInTheDocument();
    });

    it('applies unchecked state styling class', () => {
      const { container } = render(<Switch checked={false} />);
      const switchElement = container.querySelector('[data-state="unchecked"]');
      expect(switchElement).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Switch onCheckedChange={handleChange} checked={false} />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('toggles state when clicked (uncontrolled)', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Switch onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalled();
    });

    it('does not call onCheckedChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Switch onCheckedChange={handleChange} disabled />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('can be focused via keyboard', async () => {
      const user = userEvent.setup();
      render(<Switch />);

      await user.tab();
      expect(screen.getByRole('switch')).toHaveFocus();
    });

    it('can be toggled with Space key', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Switch onCheckedChange={handleChange} checked={false} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('can be toggled with Enter key', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Switch onCheckedChange={handleChange} checked={false} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();
      await user.keyboard('{Enter}');
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Controlled Component', () => {
    it('works as controlled component', async () => {
      const user = userEvent.setup();
      const ControlledSwitch = () => {
        const [checked, setChecked] = React.useState(false);
        return <Switch checked={checked} onCheckedChange={setChecked} />;
      };

      render(<ControlledSwitch />);
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'false');

      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('aria-checked', 'true');

      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('updates aria-checked on state change', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Switch checked={false} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

      rerender(<Switch checked={true} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('supports aria-label', () => {
      render(<Switch aria-label="Toggle notifications" />);
      expect(screen.getByLabelText('Toggle notifications')).toBeInTheDocument();
    });
  });
});
