import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

// Mock Radix UI Popover
jest.mock('@radix-ui/react-popover', () => ({
  Root: ({ children, open, onOpenChange, defaultOpen }: any) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen || false);
    const currentOpen = open !== undefined ? open : isOpen;

    return (
      <div data-testid="popover-root">
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            open: currentOpen,
            onOpenChange: (val: boolean) => {
              setIsOpen(val);
              onOpenChange?.(val);
            },
          })
        )}
      </div>
    );
  },
  Trigger: React.forwardRef(({ children, onClick, open, onOpenChange, ...props }: any, ref: any) => (
    <button
      ref={ref}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange?.(!open);
      }}
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  )),
  Portal: ({ children }: any) => <div data-testid="popover-portal">{children}</div>,
  Content: React.forwardRef(({ children, open, ...props }: any, ref: any) =>
    open ? (
      <div ref={ref} role="dialog" data-testid="popover-content" {...props}>
        {children}
      </div>
    ) : null
  ),
}));

describe('Popover Components', () => {
  describe('Popover Root', () => {
    it('renders popover container', () => {
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
        </Popover>
      );

      expect(screen.getByTestId('popover-root')).toBeInTheDocument();
    });

    it('manages open state', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Toggle</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Toggle');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('supports controlled mode', () => {
      const { rerender } = render(
        <Popover open={false}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <Popover open={true}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('supports defaultOpen', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Default Open Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Default Open Content')).toBeInTheDocument();
    });
  });

  describe('PopoverTrigger', () => {
    it('renders trigger button', () => {
      render(
        <Popover>
          <PopoverTrigger>Click me</PopoverTrigger>
        </Popover>
      );

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('toggles popover on click', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Toggle</PopoverTrigger>
          <PopoverContent>Popover Content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();

      await user.click(screen.getByText('Toggle'));
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });

    it('has proper aria attributes', () => {
      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
        </Popover>
      );

      const trigger = screen.getByText('Trigger');
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    it('can render custom trigger content', () => {
      render(
        <Popover>
          <PopoverTrigger>
            <span>Custom Trigger</span>
          </PopoverTrigger>
        </Popover>
      );

      expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
    });
  });

  describe('PopoverContent', () => {
    it('renders popover content when open', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Content inside popover</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Content inside popover')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Hidden content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('applies content styles', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('z-50', 'rounded-md', 'border', 'bg-white', 'p-2', 'shadow-md');
    });

    it('applies custom className', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent className="custom-content">Content</PopoverContent>
        </Popover>
      );

      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('custom-content');
    });

    it('renders in portal', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Portal Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('popover-portal')).toBeInTheDocument();
    });

    it('supports align prop', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent align="start">Aligned Content</PopoverContent>
        </Popover>
      );

      const content = screen.getByRole('dialog');
      expect(content).toHaveAttribute('align', 'start');
    });

    it('supports sideOffset prop', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent sideOffset={10}>Content</PopoverContent>
        </Popover>
      );

      const content = screen.getByRole('dialog');
      expect(content).toHaveAttribute('sideOffset', '10');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent ref={ref}>Content</PopoverContent>
        </Popover>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Popover Interactions', () => {
    it('opens and closes popover', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Toggle Popover</PopoverTrigger>
          <PopoverContent>Dynamic Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Toggle Popover');

      // Initially closed
      expect(screen.queryByText('Dynamic Content')).not.toBeInTheDocument();

      // Open
      await user.click(trigger);
      expect(screen.getByText('Dynamic Content')).toBeInTheDocument();

      // Close
      await user.click(trigger);
      expect(screen.queryByText('Dynamic Content')).not.toBeInTheDocument();
    });

    it('calls onOpenChange callback', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();

      render(
        <Popover onOpenChange={handleOpenChange}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Trigger'));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Accessibility', () => {
    it('content has dialog role', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('trigger has aria-expanded attribute', () => {
      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
        </Popover>
      );

      expect(screen.getByText('Trigger')).toHaveAttribute('aria-expanded');
    });
  });
});
