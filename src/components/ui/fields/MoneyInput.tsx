// MoneyInput component
// A specialized input for currency values with auto-formatting

import React, { useState, useEffect, forwardRef } from 'react';
import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: number | string;
  onChange?: (value: number) => void;
  onValueChange?: (formattedValue: string, numericValue: number) => void;
  showDollarSign?: boolean;
  allowNegative?: boolean;
  maxValue?: number;
  minValue?: number;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({
    value = '',
    onChange,
    onValueChange,
    showDollarSign = true,
    allowNegative = false,
    maxValue,
    minValue = 0,
    className,
    placeholder = '0.00',
    disabled,
    ...props
  }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Format number to currency display
    const formatCurrency = (num: number): string => {
      if (isNaN(num)) return '';
      
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Math.abs(num));
    };

    // Parse display value to number
    const parseValue = (str: string): number => {
      if (!str) return 0;
      
      // Remove all non-digit characters except decimal point and minus
      const cleaned = str.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      
      return isNaN(parsed) ? 0 : parsed;
    };

    // Update display value when prop value changes
    useEffect(() => {
      const numValue = typeof value === 'string' ? parseValue(value) : (value || 0);
      
      if (!isFocused) {
        setDisplayValue(numValue === 0 ? '' : formatCurrency(numValue));
      }
    }, [value, isFocused]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Allow empty input
      if (inputValue === '') {
        setDisplayValue('');
        onChange?.(0);
        onValueChange?.('', 0);
        return;
      }

      // Only allow digits, decimal point, comma, and optionally minus sign
      const allowedChars = allowNegative ? /[0-9.,\-]/ : /[0-9.,]/;
      const filteredValue = inputValue
        .split('')
        .filter(char => allowedChars.test(char))
        .join('');

      // Parse the numeric value
      const numericValue = parseValue(filteredValue);

      // Apply min/max constraints
      let constrainedValue = numericValue;
      if (maxValue !== undefined && constrainedValue > maxValue) {
        constrainedValue = maxValue;
      }
      if (minValue !== undefined && constrainedValue < minValue) {
        constrainedValue = minValue;
      }

      // Handle negative values
      if (!allowNegative && constrainedValue < 0) {
        constrainedValue = Math.abs(constrainedValue);
      }

      // Update display value during typing (less formatted)
      if (isFocused) {
        // During focus, show a cleaner version but still allow typing
        const cleanForTyping = filteredValue.replace(/[^\d.-]/g, '');
        setDisplayValue(cleanForTyping);
      } else {
        setDisplayValue(constrainedValue === 0 ? '' : formatCurrency(constrainedValue));
      }

      // Call callbacks
      onChange?.(constrainedValue);
      onValueChange?.(formatCurrency(constrainedValue), constrainedValue);
    };

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      
      // Convert to unformatted number for easier editing
      const numValue = parseValue(displayValue);
      if (numValue !== 0) {
        setDisplayValue(numValue.toString());
      }
      
      props.onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Format the final value
      const numValue = parseValue(displayValue);
      setDisplayValue(numValue === 0 ? '' : formatCurrency(numValue));
      
      props.onBlur?.(e);
    };

    // Handle key press for additional validation
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const char = e.key;
      const currentValue = displayValue;
      
      // Allow control keys
      if (e.ctrlKey || e.metaKey || ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(char)) {
        props.onKeyDown?.(e);
        return;
      }

      // Allow digits
      if (/\d/.test(char)) {
        props.onKeyDown?.(e);
        return;
      }

      // Allow decimal point (only one)
      if (char === '.' && !currentValue.includes('.')) {
        props.onKeyDown?.(e);
        return;
      }

      // Allow minus sign (only at start and if negative allowed)
      if (char === '-' && allowNegative && currentValue.length === 0) {
        props.onKeyDown?.(e);
        return;
      }

      // Block all other characters
      e.preventDefault();
    };

    return (
      <div className="relative">
        {showDollarSign && (
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
        )}
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            showDollarSign && 'pl-10',
            'text-right',
            className
          )}
        />
      </div>
    );
  }
);

MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;
