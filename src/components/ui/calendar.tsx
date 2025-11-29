"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar(props: CalendarProps) {
  // Keep it minimal. You can style later.
  return (
    <DayPicker
      {...props}
    />
  );
}
