import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with default type text', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Input Types', () => {
    it('renders as email input', () => {
      render(<Input type="email" data-testid="email-input" />);
      expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email');
    });

    it('renders as password input', () => {
      render(<Input type="password" data-testid="password-input" />);
      expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'password');
    });

    it('renders as number input', () => {
      render(<Input type="number" data-testid="number-input" />);
      expect(screen.getByTestId('number-input')).toHaveAttribute('type', 'number');
    });

    it('renders as date input', () => {
      render(<Input type="date" data-testid="date-input" />);
      const input = screen.getByTestId('date-input');
      expect(input).toHaveAttribute('type', 'date');
    });

    it('renders as file input', () => {
      render(<Input type="file" data-testid="file-input" />);
      expect(screen.getByTestId('file-input')).toHaveAttribute('type', 'file');
    });
  });

  describe('Styling', () => {
    it('applies base input styles', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('h-10', 'w-full', 'rounded-md', 'border');
    });

    it('applies custom className', () => {
      const { container } = render(<Input className="custom-input" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('custom-input');
    });

    it('applies conditional flex class for non-date types', () => {
      const { container } = render(<Input type="text" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('flex');
    });

    it('does not apply flex class for date type', () => {
      const { container } = render(<Input type="date" />);
      const input = container.querySelector('input');
      expect(input).not.toHaveClass('flex');
    });
  });

  describe('Props & Attributes', () => {
    it('accepts placeholder text', () => {
      render(<Input placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('handles disabled state', () => {
      render(<Input disabled data-testid="disabled-input" />);
      const input = screen.getByTestId('disabled-input');
      expect(input).toBeDisabled();
    });

    it('handles readonly state', () => {
      render(<Input readOnly value="Read only" data-testid="readonly-input" />);
      const input = screen.getByTestId('readonly-input');
      expect(input).toHaveAttribute('readonly');
    });

    it('accepts required attribute', () => {
      render(<Input required data-testid="required-input" />);
      expect(screen.getByTestId('required-input')).toBeRequired();
    });

    it('accepts aria attributes', () => {
      render(<Input aria-label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('accepts name attribute', () => {
      render(<Input name="email" data-testid="email" />);
      expect(screen.getByTestId('email')).toHaveAttribute('name', 'email');
    });
  });

  describe('User Interactions', () => {
    it('accepts user input', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="text-input" />);
      const input = screen.getByTestId('text-input');

      await user.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });

    it('calls onChange handler when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} data-testid="input" />);

      await user.type(screen.getByTestId('input'), 'Test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('calls onFocus handler when focused', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} data-testid="input" />);

      await user.click(screen.getByTestId('input'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur handler when blurred', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('can be cleared', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'Test');
      expect(input.value).toBe('Test');

      await user.clear(input);
      expect(input.value).toBe('');
    });

    it('respects maxLength attribute', async () => {
      const user = userEvent.setup();
      render(<Input maxLength={5} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, '12345678');
      expect(input).toHaveValue('12345');
    });
  });

  describe('Controlled Component', () => {
    it('works as controlled component', async () => {
      const user = userEvent.setup();
      const ControlledInput = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        );
      };

      render(<ControlledInput />);
      const input = screen.getByTestId('controlled-input');

      await user.type(input, 'Controlled');
      expect(input).toHaveValue('Controlled');
    });
  });
});

// React import for controlled component test
import React from 'react';
