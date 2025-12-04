import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RadioGroup, RadioGroupItem } from './radio-group';

// Mock Radix UI RadioGroup
jest.mock('@radix-ui/react-radio-group', () => ({
  Root: React.forwardRef(({ children, value, onValueChange, defaultValue, disabled, ...props }: any, ref: any) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    return (
      <div ref={ref} role="radiogroup" data-testid="radio-group" {...props}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement, {
                checked: child.props.value === currentValue,
                onSelect: () => {
                  if (!disabled) {
                    setInternalValue(child.props.value);
                    onValueChange?.(child.props.value);
                  }
                },
                disabled: disabled || child.props.disabled,
              })
            : child
        )}
      </div>
    );
  }),
  Item: React.forwardRef(({ value, checked, onSelect, disabled, children, ...props }: any, ref: any) => (
    <button
      ref={ref}
      role="radio"
      type="button"
      aria-checked={checked}
      disabled={disabled}
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={onSelect}
      {...props}
    >
      {children}
    </button>
  )),
  Indicator: ({ children, ...props }: any) => (
    <span data-testid="radio-indicator" {...props}>
      {children}
    </span>
  ),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Circle: (props: any) => <svg data-testid="circle-icon" {...props} />,
}));

describe('RadioGroup Components', () => {
  describe('RadioGroup', () => {
    it('renders radio group container', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('applies base styles', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toHaveClass('grid', 'gap-2');
    });

    it('applies custom className', () => {
      render(
        <RadioGroup className="custom-radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toHaveClass('custom-radio-group');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(
        <RadioGroup ref={ref}>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('RadioGroupItem', () => {
    it('renders radio item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('applies item styles', () => {
      const { container } = render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const item = container.querySelector('[role="radio"]');
      expect(item).toHaveClass('aspect-square', 'h-4', 'w-4', 'rounded-full', 'border');
    });

    it('applies custom className', () => {
      const { container } = render(
        <RadioGroup>
          <RadioGroupItem value="option1" className="custom-item" />
        </RadioGroup>
      );

      const item = container.querySelector('[role="radio"]');
      expect(item).toHaveClass('custom-item');
    });

    it('renders indicator with circle icon', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(
        <RadioGroup>
          <RadioGroupItem ref={ref} value="option1" />
        </RadioGroup>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Radio Selection', () => {
    it('handles single selection', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();

      render(
        <RadioGroup onValueChange={handleValueChange}>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      await user.click(screen.getByTestId('radio-1'));
      expect(handleValueChange).toHaveBeenCalledWith('option1');
    });

    it('displays checked state correctly', () => {
      render(
        <RadioGroup value="option2">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByTestId('radio-2')).toHaveAttribute('aria-checked', 'true');
    });

    it('updates checked state when value changes', () => {
      const { rerender } = render(
        <RadioGroup value="option1">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByTestId('radio-2')).toHaveAttribute('aria-checked', 'false');

      rerender(
        <RadioGroup value="option2">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByTestId('radio-2')).toHaveAttribute('aria-checked', 'true');
    });

    it('supports defaultValue', () => {
      render(
        <RadioGroup defaultValue="option2">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-2')).toHaveAttribute('aria-checked', 'true');
    });

    it('changes selection between options', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
          <RadioGroupItem value="option3" data-testid="radio-3" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toHaveAttribute('aria-checked', 'true');

      await user.click(screen.getByTestId('radio-2'));
      expect(screen.getByTestId('radio-1')).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByTestId('radio-2')).toHaveAttribute('aria-checked', 'true');

      await user.click(screen.getByTestId('radio-3'));
      expect(screen.getByTestId('radio-2')).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByTestId('radio-3')).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Disabled State', () => {
    it('disables entire radio group', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();

      render(
        <RadioGroup disabled onValueChange={handleValueChange}>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toBeDisabled();
      expect(screen.getByTestId('radio-2')).toBeDisabled();

      await user.click(screen.getByTestId('radio-1'));
      expect(handleValueChange).not.toHaveBeenCalled();
    });

    it('disables individual radio item', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();

      render(
        <RadioGroup onValueChange={handleValueChange}>
          <RadioGroupItem value="option1" disabled data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toBeDisabled();
      expect(screen.getByTestId('radio-2')).not.toBeDisabled();

      await user.click(screen.getByTestId('radio-1'));
      expect(handleValueChange).not.toHaveBeenCalled();

      await user.click(screen.getByTestId('radio-2'));
      expect(handleValueChange).toHaveBeenCalledWith('option2');
    });

    it('applies disabled styles', () => {
      const { container } = render(
        <RadioGroup disabled>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const item = container.querySelector('[role="radio"]');
      expect(item).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Data States', () => {
    it('has data-state="unchecked" when not selected', () => {
      render(
        <RadioGroup value="option2">
          <RadioGroupItem value="option1" data-testid="radio-1" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toHaveAttribute('data-state', 'unchecked');
    });

    it('has data-state="checked" when selected', () => {
      render(
        <RadioGroup value="option1">
          <RadioGroupItem value="option1" data-testid="radio-1" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Controlled Component', () => {
    it('works as controlled component', async () => {
      const user = userEvent.setup();
      const ControlledRadioGroup = () => {
        const [value, setValue] = React.useState('option1');
        return (
          <RadioGroup value={value} onValueChange={setValue}>
            <RadioGroupItem value="option1" data-testid="radio-1" />
            <RadioGroupItem value="option2" data-testid="radio-2" />
            <RadioGroupItem value="option3" data-testid="radio-3" />
          </RadioGroup>
        );
      };

      render(<ControlledRadioGroup />);

      expect(screen.getByTestId('radio-1')).toHaveAttribute('aria-checked', 'true');

      await user.click(screen.getByTestId('radio-2'));
      expect(screen.getByTestId('radio-2')).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByTestId('radio-1')).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Accessibility', () => {
    it('has correct radiogroup role', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('radio items have correct role', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('has correct aria-checked attribute', () => {
      render(
        <RadioGroup value="option2">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByTestId('radio-2')).toHaveAttribute('aria-checked', 'true');
    });

    it('can be navigated with keyboard', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      await user.tab();
      expect(screen.getByTestId('radio-1')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('radio-2')).toHaveFocus();
    });
  });

  describe('Real-world Use Cases', () => {
    it('renders with labels', () => {
      render(
        <RadioGroup defaultValue="light">
          <div>
            <RadioGroupItem value="light" id="light" />
            <label htmlFor="light">Light Mode</label>
          </div>
          <div>
            <RadioGroupItem value="dark" id="dark" />
            <label htmlFor="dark">Dark Mode</label>
          </div>
        </RadioGroup>
      );

      expect(screen.getByText('Light Mode')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    });

    it('handles theme selection', async () => {
      const user = userEvent.setup();
      const handleThemeChange = jest.fn();

      render(
        <RadioGroup onValueChange={handleThemeChange}>
          <RadioGroupItem value="system" data-testid="system" />
          <RadioGroupItem value="light" data-testid="light" />
          <RadioGroupItem value="dark" data-testid="dark" />
        </RadioGroup>
      );

      await user.click(screen.getByTestId('dark'));
      expect(handleThemeChange).toHaveBeenCalledWith('dark');
    });

    it('handles form submission values', () => {
      render(
        <form data-testid="form">
          <RadioGroup name="size" value="medium">
            <RadioGroupItem value="small" />
            <RadioGroupItem value="medium" />
            <RadioGroupItem value="large" />
          </RadioGroup>
        </form>
      );

      const form = screen.getByTestId('form');
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('name', 'size');
    });
  });
});
