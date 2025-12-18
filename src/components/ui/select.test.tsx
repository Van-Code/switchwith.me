import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

// Mock Radix UI Select
jest.mock('@radix-ui/react-select', () => ({
  Root: ({ children, onValueChange, value, defaultValue }: any) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    return (
      <div data-testid="select-root" data-value={currentValue}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            value: currentValue,
            onValueChange: (val: string) => {
              setInternalValue(val);
              onValueChange?.(val);
            },
          })
        )}
      </div>
    );
  },
  Group: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Value: ({ placeholder, ...props }: any) => (
    <span {...props}>{placeholder}</span>
  ),
  Trigger: ({ children, onClick, ...props }: any) => (
    <button {...props} onClick={onClick}>
      {children}
    </button>
  ),
  Icon: ({ children, asChild, ...props }: any) => (
    <span {...props}>{asChild ? children : null}</span>
  ),
  Portal: ({ children }: any) => <>{children}</>,
  Content: ({ children, ...props }: any) => (
    <div role="listbox" {...props}>
      {children}
    </div>
  ),
  Viewport: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Item: ({ children, value, onSelect, ...props }: any) => (
    <div role="option" data-value={value} onClick={() => onSelect?.(value)} {...props}>
      {children}
    </div>
  ),
  ItemText: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  ItemIndicator: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Label: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Separator: (props: any) => <hr {...props} />,
  ScrollUpButton: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  ScrollDownButton: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: (props: any) => <svg data-testid="check-icon" {...props} />,
  ChevronDown: (props: any) => <svg data-testid="chevron-down-icon" {...props} />,
  ChevronUp: (props: any) => <svg data-testid="chevron-up-icon" {...props} />,
}));

describe('Select Components', () => {
  describe('SelectTrigger', () => {
    it('renders select trigger', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByText('Select option')).toBeInTheDocument();
    });

    it('renders chevron down icon', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('applies trigger styles', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      const trigger = container.querySelector('button');
      expect(trigger).toHaveClass('flex', 'h-10', 'w-full', 'items-center', 'rounded-md', 'border');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      const trigger = container.querySelector('button');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Select>
          <SelectTrigger ref={ref}>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      expect(ref.current).toBeTruthy();
    });
  });

  describe('SelectContent', () => {
    it('renders select content', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('applies content styles', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const content = screen.getByRole('listbox');
      expect(content).toHaveClass('relative', 'z-50', 'max-h-96', 'rounded-md', 'border');
    });

    it('renders scroll buttons', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('chevron-down-icon').length).toBeGreaterThan(0);
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Select>
          <SelectContent ref={ref}>
            <SelectItem value="1">Option</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(ref.current).toBeTruthy();
    });
  });

  describe('SelectItem', () => {
    it('renders select item', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('option')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('has correct data-value attribute', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="test-value">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const item = screen.getByRole('option');
      expect(item).toHaveAttribute('data-value', 'test-value');
    });

    it('renders check icon indicator', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('applies item styles', () => {
      const { container } = render(
        <Select>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const item = container.querySelector('[role="option"]');
      expect(item).toHaveClass('relative', 'flex', 'w-full', 'rounded-sm');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Select>
          <SelectContent>
            <SelectItem ref={ref} value="1">
              Option
            </SelectItem>
          </SelectContent>
        </Select>
      );

      expect(ref.current).toBeTruthy();
    });
  });

  describe('SelectLabel', () => {
    it('renders select label', () => {
      render(
        <Select>
          <SelectContent>
            <SelectLabel>Group Label</SelectLabel>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Group Label')).toBeInTheDocument();
    });

    it('applies label styles', () => {
      const { container } = render(
        <Select>
          <SelectContent>
            <SelectLabel>Label</SelectLabel>
          </SelectContent>
        </Select>
      );

      const label = screen.getByText('Label');
      expect(label).toHaveClass('py-1.5', 'pl-8', 'pr-2', 'text-sm', 'font-semibold');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Select>
          <SelectContent>
            <SelectLabel ref={ref}>Label</SelectLabel>
          </SelectContent>
        </Select>
      );

      expect(ref.current).toBeTruthy();
    });
  });

  describe('SelectSeparator', () => {
    it('renders separator', () => {
      const { container } = render(
        <Select>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectSeparator />
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(container.querySelector('hr')).toBeInTheDocument();
    });

    it('applies separator styles', () => {
      const { container } = render(
        <Select>
          <SelectContent>
            <SelectSeparator />
          </SelectContent>
        </Select>
      );

      const separator = container.querySelector('hr');
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Select>
          <SelectContent>
            <SelectSeparator ref={ref} />
          </SelectContent>
        </Select>
      );

      expect(ref.current).toBeTruthy();
    });
  });

  describe('Select Composition', () => {
    it('renders complete select with groups', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Choose fruit')).toBeInTheDocument();
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });
  });

  describe('Scroll Buttons', () => {
    it('renders scroll up button', () => {
      render(<SelectScrollUpButton />);
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('renders scroll down button', () => {
      render(<SelectScrollDownButton />);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('applies scroll button styles', () => {
      const { container: upContainer } = render(<SelectScrollUpButton />);
      const upButton = upContainer.querySelector('button');
      expect(upButton).toHaveClass('flex', 'cursor-default', 'items-center', 'justify-center');

      const { container: downContainer } = render(<SelectScrollDownButton />);
      const downButton = downContainer.querySelector('button');
      expect(downButton).toHaveClass('flex', 'cursor-default', 'items-center', 'justify-center');
    });

    it('forwards ref correctly for scroll up button', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<SelectScrollUpButton ref={ref} />);
      expect(ref.current).toBeTruthy();
    });

    it('forwards ref correctly for scroll down button', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<SelectScrollDownButton ref={ref} />);
      expect(ref.current).toBeTruthy();
    });
  });
});
