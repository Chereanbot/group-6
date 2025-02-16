"use client";

import { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholderText?: string;
  required?: boolean;
  disabled?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ 
    selected, 
    onChange, 
    className = "", 
    minDate, 
    maxDate,
    placeholderText = "Select date...",
    required = false,
    disabled = false
  }, ref) => {
    return (
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        className={`w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 ${className}`}
        dateFormat="yyyy-MM-dd"
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholderText}
        required={required}
        disabled={disabled}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker'; 