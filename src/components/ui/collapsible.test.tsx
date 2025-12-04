import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';

// Mock Radix UI Collapsible
jest.mock('@radix-ui/react-collapsible', () => ({
  Root: ({ children, open, onOpenChange, defaultOpen, disabled }: any) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen || false);
    const currentOpen = open !== undefined ? open : isOpen;

    return (
      <div data-testid="collapsible-root" data-state={currentOpen ? 'open' : 'closed'}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            open: currentOpen,
            onOpenChange: (val: boolean) => {
              if (!disabled) {
                setIsOpen(val);
                onOpenChange?.(val);
              }
            },
            disabled,
          })
        )}
      </div>
    );
  },
  CollapsibleTrigger: ({ children, onClick, open, onOpenChange, disabled, ...props }: any) => (
    <button
      {...props}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        if (!disabled) {
          onOpenChange?.(!open);
        }
      }}
      aria-expanded={open}
      data-testid="collapsible-trigger"
    >
      {children}
    </button>
  ),
  CollapsibleContent: ({ children, open, ...props }: any) =>
    open ? (
      <div data-testid="collapsible-content" data-state="open" {...props}>
        {children}
      </div>
    ) : null,
}));

describe('Collapsible Components', () => {
  describe('Collapsible Root', () => {
    it('renders collapsible container', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByTestId('collapsible-root')).toBeInTheDocument();
    });

    it('is closed by default', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Hidden Content</CollapsibleContent>
        </Collapsible>
      );

      const root = screen.getByTestId('collapsible-root');
      expect(root).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });

    it('supports defaultOpen prop', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Visible Content</CollapsibleContent>
        </Collapsible>
      );

      const root = screen.getByTestId('collapsible-root');
      expect(root).toHaveAttribute('data-state', 'open');
      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });

    it('supports controlled mode with open prop', () => {
      const { rerender } = render(
        <Collapsible open={false}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(
        <Collapsible open={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles disabled state', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();

      render(
        <Collapsible disabled onOpenChange={handleOpenChange}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByTestId('collapsible-trigger');
      await user.click(trigger);

      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('CollapsibleTrigger', () => {
    it('renders trigger button', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Click to expand</CollapsibleTrigger>
        </Collapsible>
      );

      expect(screen.getByTestId('collapsible-trigger')).toBeInTheDocument();
      expect(screen.getByText('Click to expand')).toBeInTheDocument();
    });

    it('toggles collapsible on click', async () => {
      const user = userEvent.setup();

      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Expandable Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByTestId('collapsible-trigger');

      // Initially closed
      expect(screen.queryByText('Expandable Content')).not.toBeInTheDocument();

      // Click to open
      await user.click(trigger);
      expect(screen.getByText('Expandable Content')).toBeInTheDocument();

      // Click to close
      await user.click(trigger);
      expect(screen.queryByText('Expandable Content')).not.toBeInTheDocument();
    });

    it('has correct aria-expanded attribute', async () => {
      const user = userEvent.setup();

      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByTestId('collapsible-trigger');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('can be disabled', () => {
      render(
        <Collapsible disabled>
          <CollapsibleTrigger>Disabled Toggle</CollapsibleTrigger>
        </Collapsible>
      );

      const trigger = screen.getByTestId('collapsible-trigger');
      expect(trigger).toBeDisabled();
    });

    it('renders custom trigger content', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>
            <span>Custom Icon</span>
            <span>Expand Section</span>
          </CollapsibleTrigger>
        </Collapsible>
      );

      expect(screen.getByText('Custom Icon')).toBeInTheDocument();
      expect(screen.getByText('Expand Section')).toBeInTheDocument();
    });
  });

  describe('CollapsibleContent', () => {
    it('does not render when closed', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Hidden content</CollapsibleContent>
        </Collapsible>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('renders when open', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Visible content</CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByText('Visible content')).toBeInTheDocument();
    });

    it('has data-state attribute', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const content = screen.getByTestId('collapsible-content');
      expect(content).toHaveAttribute('data-state', 'open');
    });

    it('renders complex content', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>
            <h3>Section Title</h3>
            <p>Paragraph text</p>
            <button>Action Button</button>
          </CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph text')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });
  });

  describe('Collapsible Interactions', () => {
    it('calls onOpenChange callback', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();

      render(
        <Collapsible onOpenChange={handleOpenChange}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      await user.click(screen.getByTestId('collapsible-trigger'));
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      await user.click(screen.getByTestId('collapsible-trigger'));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('works as controlled component', async () => {
      const user = userEvent.setup();
      const ControlledCollapsible = () => {
        const [open, setOpen] = React.useState(false);
        return (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger>Toggle</CollapsibleTrigger>
            <CollapsibleContent>Controlled Content</CollapsibleContent>
          </Collapsible>
        );
      };

      render(<ControlledCollapsible />);

      expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('collapsible-trigger'));
      expect(screen.getByText('Controlled Content')).toBeInTheDocument();

      await user.click(screen.getByTestId('collapsible-trigger'));
      expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('trigger is keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByTestId('collapsible-trigger');
      trigger.focus();

      await user.keyboard('{Enter}');
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('maintains focus management', async () => {
      const user = userEvent.setup();

      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>
            <button>Focusable Button</button>
          </CollapsibleContent>
        </Collapsible>
      );

      await user.tab();
      expect(screen.getByTestId('collapsible-trigger')).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(screen.getByText('Focusable Button')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('works as FAQ accordion item', async () => {
      const user = userEvent.setup();

      render(
        <Collapsible>
          <CollapsibleTrigger>What is this component?</CollapsibleTrigger>
          <CollapsibleContent>
            This is a collapsible FAQ answer that can be expanded and collapsed.
          </CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByText('What is this component?')).toBeInTheDocument();
      expect(
        screen.queryByText('This is a collapsible FAQ answer')
      ).not.toBeInTheDocument();

      await user.click(screen.getByTestId('collapsible-trigger'));
      expect(screen.getByText(/This is a collapsible FAQ answer/)).toBeInTheDocument();
    });

    it('works for showing/hiding additional details', async () => {
      const user = userEvent.setup();

      render(
        <Collapsible>
          <CollapsibleTrigger>Show Details</CollapsibleTrigger>
          <CollapsibleContent>
            <div>Detail 1</div>
            <div>Detail 2</div>
            <div>Detail 3</div>
          </CollapsibleContent>
        </Collapsible>
      );

      await user.click(screen.getByText('Show Details'));

      expect(screen.getByText('Detail 1')).toBeInTheDocument();
      expect(screen.getByText('Detail 2')).toBeInTheDocument();
      expect(screen.getByText('Detail 3')).toBeInTheDocument();
    });
  });
});
