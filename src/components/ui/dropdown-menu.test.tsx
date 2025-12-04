import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu';

// Mock Radix UI Dropdown Menu
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, open, onOpenChange, defaultOpen }: any) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen || false);
    const currentOpen = open !== undefined ? open : isOpen;

    return (
      <div data-testid="dropdown-root">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement, {
                open: currentOpen,
                onOpenChange: (val: boolean) => {
                  setIsOpen(val);
                  onOpenChange?.(val);
                },
              })
            : child
        )}
      </div>
    );
  },
  Trigger: ({ children, onClick, open, onOpenChange, ...props }: any) => (
    <button
      {...props}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange?.(!open);
      }}
      aria-expanded={open}
      data-testid="dropdown-trigger"
    >
      {children}
    </button>
  ),
  Portal: ({ children, open }: any) =>
    open ? <div data-testid="dropdown-portal">{children}</div> : null,
  Content: ({ children, open, ...props }: any) =>
    open ? (
      <div role="menu" data-testid="dropdown-content" {...props}>
        {children}
      </div>
    ) : null,
  Item: ({ children, onSelect, disabled, ...props }: any) => (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect?.()}
      data-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  ),
  CheckboxItem: ({ children, checked, onCheckedChange, disabled, ...props }: any) => (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      data-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  ),
  ItemIndicator: ({ children, ...props }: any) => (
    <span data-testid="item-indicator" {...props}>
      {children}
    </span>
  ),
  RadioGroup: ({ children, value, onValueChange, ...props }: any) => (
    <div role="group" data-value={value} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, { value, onValueChange })
          : child
      )}
    </div>
  ),
  RadioItem: ({ children, value: itemValue, value: groupValue, onValueChange, ...props }: any) => (
    <div
      role="menuitemradio"
      aria-checked={itemValue === groupValue}
      onClick={() => onValueChange?.(itemValue)}
      {...props}
    >
      {children}
    </div>
  ),
  Label: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Separator: (props: any) => <hr data-testid="dropdown-separator" {...props} />,
  Group: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Sub: ({ children, open, onOpenChange, defaultOpen }: any) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen || false);
    const currentOpen = open !== undefined ? open : isOpen;

    return (
      <div data-testid="dropdown-sub">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement, {
                open: currentOpen,
                onOpenChange: (val: boolean) => {
                  setIsOpen(val);
                  onOpenChange?.(val);
                },
              })
            : child
        )}
      </div>
    );
  },
  SubTrigger: ({ children, open, onOpenChange, ...props }: any) => (
    <div
      data-testid="dropdown-sub-trigger"
      onClick={() => onOpenChange?.(!open)}
      {...props}
    >
      {children}
    </div>
  ),
  SubContent: ({ children, open, ...props }: any) =>
    open ? (
      <div data-testid="dropdown-sub-content" {...props}>
        {children}
      </div>
    ) : null,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Check: (props: any) => <svg data-testid="check-icon" {...props} />,
  ChevronRight: (props: any) => <svg data-testid="chevron-right-icon" {...props} />,
  Circle: (props: any) => <svg data-testid="circle-icon" {...props} />,
}));

describe('DropdownMenu Components', () => {
  describe('DropdownMenu Root', () => {
    it('renders dropdown container', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('is closed by default', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('supports defaultOpen', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuTrigger', () => {
    it('renders trigger button', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByText('Open Menu')).toBeInTheDocument();
    });

    it('toggles menu on click', async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('dropdown-trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('has aria-expanded attribute', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded');
    });
  });

  describe('DropdownMenuContent', () => {
    it('renders menu content when open', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Menu Content</DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('Menu Content')).toBeInTheDocument();
    });

    it('applies content styles', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
        </DropdownMenu>
      );

      const content = screen.getByRole('menu');
      expect(content).toHaveClass('z-50', 'min-w-[8rem]', 'rounded-md', 'border');
    });

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content">Content</DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menu')).toHaveClass('custom-content');
    });
  });

  describe('DropdownMenuItem', () => {
    it('renders menu item', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menuitem')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('calls onSelect when clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleSelect}>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('Settings'));
      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it('handles disabled state', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onSelect={handleSelect}>
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByText('Disabled Item');
      expect(item).toHaveAttribute('data-disabled', 'true');

      await user.click(item);
      expect(handleSelect).not.toHaveBeenCalled();
    });

    it('supports inset prop', () => {
      const { container } = render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByText('Inset Item');
      expect(item).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    it('renders checkbox item', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>Show Toolbar</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menuitemcheckbox')).toBeInTheDocument();
      expect(screen.getByText('Show Toolbar')).toBeInTheDocument();
    });

    it('toggles checked state', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={handleCheckedChange}>
              Option
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('Option'));
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('displays checked state', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={true}>Checked</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByRole('menuitemcheckbox');
      expect(item).toHaveAttribute('aria-checked', 'true');
    });

    it('renders check icon when checked', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={true}>Checked</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuRadioGroup & DropdownMenuRadioItem', () => {
    it('renders radio group with items', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getAllByRole('menuitemradio')).toHaveLength(2);
    });

    it('handles radio selection', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1" onValueChange={handleValueChange}>
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText('Option 2'));
      expect(handleValueChange).toHaveBeenCalledWith('option2');
    });

    it('renders circle indicator for radio items', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuLabel', () => {
    it('renders menu label', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('My Account')).toBeInTheDocument();
    });

    it('applies label styles', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const label = screen.getByText('Label');
      expect(label).toHaveClass('px-2', 'py-1.5', 'text-sm', 'font-semibold');
    });

    it('supports inset prop', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Inset Label')).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuSeparator', () => {
    it('renders separator', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
    });

    it('applies separator styles', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const separator = screen.getByTestId('dropdown-separator');
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
    });
  });

  describe('DropdownMenuShortcut', () => {
    it('renders keyboard shortcut', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Save
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('⌘S')).toBeInTheDocument();
    });

    it('applies shortcut styles', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const shortcut = screen.getByText('⌘C');
      expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'opacity-60');
    });
  });

  describe('DropdownMenuSub', () => {
    it('renders submenu trigger', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-sub-trigger')).toBeInTheDocument();
      expect(screen.getByText('More Options')).toBeInTheDocument();
    });

    it('renders chevron icon on submenu trigger', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('toggles submenu content', async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Submenu Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.queryByText('Submenu Item')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('dropdown-sub-trigger'));
      expect(screen.getByText('Submenu Item')).toBeInTheDocument();
    });
  });

  describe('Complete DropdownMenu', () => {
    it('renders complete dropdown with all components', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={true}>Show Toolbar</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value="dark">
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('My Account')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Show Toolbar')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('menu has correct role', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('menu items are keyboard accessible', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('tabIndex', '0');
    });

    it('disabled items are not focusable', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('tabIndex', '-1');
    });
  });
});
