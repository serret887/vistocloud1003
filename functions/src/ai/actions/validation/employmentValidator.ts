/**
 * Validation for employment-related actions
 */

import { validateDate, validateDateRange, validatePhoneNumber } from './validators';
import type { ValidationResult } from './types';

export function validateEmploymentAction(action: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const updates = action.params?.updates || {};
  
  if (updates.startDate && !validateDate(updates.startDate)) {
    errors.push(`Invalid start date format: ${updates.startDate}`);
  }
  
  if (updates.endDate && !validateDate(updates.endDate)) {
    errors.push(`Invalid end date format: ${updates.endDate}`);
  }
  
  if (updates.startDate && updates.endDate && !validateDateRange(updates.startDate, updates.endDate)) {
    errors.push('End date cannot be before start date');
  }
  
  if (updates.phoneNumber && !validatePhoneNumber(updates.phoneNumber)) {
    errors.push(`Invalid employer phone number format: ${updates.phoneNumber}`);
  }
  
  if (updates.grossMonthlyIncome !== undefined && updates.grossMonthlyIncome < 0) {
    errors.push('Gross monthly income cannot be negative');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

