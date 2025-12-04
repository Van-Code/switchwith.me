"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar(props: CalendarProps) {
  return (
    <div className="calendar-enhanced">
      <DayPicker
        {...props}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-semibold text-slate-900",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-cyan-100 rounded-md transition-colors",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-slate-600 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-cyan-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-cyan-50 rounded-md transition-colors",
          day_selected: "bg-cyan-600 text-white hover:bg-cyan-700 hover:text-white focus:bg-cyan-600 focus:text-white font-semibold",
          day_today: "bg-slate-100 text-slate-900 font-bold border-2 border-cyan-400",
          day_outside: "text-slate-400 opacity-50",
          day_disabled: "text-slate-400 opacity-50 cursor-not-allowed",
          day_range_middle: "aria-selected:bg-cyan-100 aria-selected:text-slate-900",
          day_hidden: "invisible",
          ...props.classNames,
        }}
      />
    </div>
  );
}
