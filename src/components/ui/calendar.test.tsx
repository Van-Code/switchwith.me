import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Calendar } from './calendar';

// Mock react-day-picker
jest.mock('react-day-picker', () => ({
  DayPicker: ({ selected, onSelect, mode, disabled, ...props }: any) => {
    const today = new Date(2024, 0, 15); // Jan 15, 2024
    const dates = Array.from({ length: 31 }, (_, i) => new Date(2024, 0, i + 1));

    return (
      <div data-testid="day-picker" {...props}>
        <div data-testid="calendar-month">January 2024</div>
        <div data-testid="calendar-grid">
          {dates.map((date) => {
            const day = date.getDate();
            const isSelected =
              selected &&
              (Array.isArray(selected)
                ? selected.some((d: Date) => d?.getDate() === day)
                : selected?.getDate() === day);
            const isDisabled =
              typeof disabled === 'function' ? disabled(date) : false;

            return (
              <button
                key={day}
                type="button"
                data-testid={`day-${day}`}
                data-selected={isSelected}
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelect?.(date)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
}));

describe('Calendar', () => {
  describe('Rendering', () => {
    it('renders calendar component', () => {
      render(<Calendar />);
      expect(screen.getByTestId('day-picker')).toBeInTheDocument();
    });

    it('renders month display', () => {
      render(<Calendar />);
      expect(screen.getByTestId('calendar-month')).toBeInTheDocument();
      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('renders calendar grid with days', () => {
      render(<Calendar />);
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
      expect(screen.getByTestId('day-1')).toBeInTheDocument();
      expect(screen.getByTestId('day-31')).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('handles single date selection', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();

      render(<Calendar mode="single" onSelect={handleSelect} />);

      const day15 = screen.getByTestId('day-15');
      await user.click(day15);

      expect(handleSelect).toHaveBeenCalledWith(expect.any(Date));
      expect(handleSelect.mock.calls[0][0].getDate()).toBe(15);
    });

    it('displays selected date', () => {
      const selectedDate = new Date(2024, 0, 20);

      render(<Calendar selected={selectedDate} mode="single" />);

      const day20 = screen.getByTestId('day-20');
      expect(day20).toHaveAttribute('data-selected', 'true');
    });

    it('handles multiple date selections', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();

      render(<Calendar mode="multiple" onSelect={handleSelect} />);

      await user.click(screen.getByTestId('day-5'));
      await user.click(screen.getByTestId('day-10'));

      expect(handleSelect).toHaveBeenCalledTimes(2);
    });

    it('displays multiple selected dates', () => {
      const selectedDates = [new Date(2024, 0, 5), new Date(2024, 0, 10), new Date(2024, 0, 15)];

      render(<Calendar selected={selectedDates} mode="multiple" />);

      expect(screen.getByTestId('day-5')).toHaveAttribute('data-selected', 'true');
      expect(screen.getByTestId('day-10')).toHaveAttribute('data-selected', 'true');
      expect(screen.getByTestId('day-15')).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Disabled Dates', () => {
    it('disables specific dates', () => {
      const disabledMatcher = (date: Date) => date.getDate() === 15;

      render(<Calendar disabled={disabledMatcher} />);

      const day15 = screen.getByTestId('day-15');
      const day16 = screen.getByTestId('day-16');

      expect(day15).toBeDisabled();
      expect(day16).not.toBeDisabled();
    });

    it('does not select disabled dates', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();
      const disabledMatcher = (date: Date) => date.getDate() === 10;

      render(<Calendar disabled={disabledMatcher} onSelect={handleSelect} />);

      const day10 = screen.getByTestId('day-10');
      await user.click(day10);

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it('disables past dates', () => {
      const today = new Date(2024, 0, 15);
      const disabledMatcher = (date: Date) => date < today;

      render(<Calendar disabled={disabledMatcher} />);

      expect(screen.getByTestId('day-14')).toBeDisabled();
      expect(screen.getByTestId('day-15')).not.toBeDisabled();
      expect(screen.getByTestId('day-16')).not.toBeDisabled();
    });

    it('disables future dates', () => {
      const today = new Date(2024, 0, 15);
      const disabledMatcher = (date: Date) => date > today;

      render(<Calendar disabled={disabledMatcher} />);

      expect(screen.getByTestId('day-14')).not.toBeDisabled();
      expect(screen.getByTestId('day-15')).not.toBeDisabled();
      expect(screen.getByTestId('day-16')).toBeDisabled();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards mode prop to DayPicker', () => {
      const { container } = render(<Calendar mode="range" />);
      expect(container.querySelector('[data-testid="day-picker"]')).toHaveAttribute('mode', 'range');
    });

    it('forwards custom props to DayPicker', () => {
      render(<Calendar numberOfMonths={2} showOutsideDays />);

      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('numberOfMonths', '2');
      expect(dayPicker).toHaveAttribute('showOutsideDays');
    });

    it('forwards className to DayPicker', () => {
      render(<Calendar className="custom-calendar" />);
      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('className', 'custom-calendar');
    });
  });

  describe('Controlled Component', () => {
    it('works as controlled component', async () => {
      const user = userEvent.setup();
      const ControlledCalendar = () => {
        const [date, setDate] = React.useState<Date | undefined>();
        return <Calendar mode="single" selected={date} onSelect={setDate} />;
      };

      render(<ControlledCalendar />);

      expect(screen.getByTestId('day-15')).toHaveAttribute('data-selected', 'false');

      await user.click(screen.getByTestId('day-15'));
      expect(screen.getByTestId('day-15')).toHaveAttribute('data-selected', 'true');
    });

    it('updates when selected prop changes', () => {
      const { rerender } = render(<Calendar selected={new Date(2024, 0, 10)} mode="single" />);
      expect(screen.getByTestId('day-10')).toHaveAttribute('data-selected', 'true');

      rerender(<Calendar selected={new Date(2024, 0, 20)} mode="single" />);
      expect(screen.getByTestId('day-10')).toHaveAttribute('data-selected', 'false');
      expect(screen.getByTestId('day-20')).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Range Selection', () => {
    it('handles range selection mode', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();

      render(<Calendar mode="range" onSelect={handleSelect} />);

      await user.click(screen.getByTestId('day-10'));
      expect(handleSelect).toHaveBeenCalled();

      await user.click(screen.getByTestId('day-15'));
      expect(handleSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('calendar days are keyboard accessible', () => {
      render(<Calendar />);
      const day1 = screen.getByTestId('day-1');
      expect(day1.tagName).toBe('BUTTON');
    });

    it('disabled days are not interactive', () => {
      const disabledMatcher = (date: Date) => date.getDate() === 5;
      render(<Calendar disabled={disabledMatcher} />);

      const day5 = screen.getByTestId('day-5');
      expect(day5).toBeDisabled();
      expect(day5).toHaveAttribute('disabled');
    });
  });
});
