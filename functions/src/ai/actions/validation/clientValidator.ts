/**
 * Validation for client-related actions
 */

import { validatePhoneNumber, validateEmail, validateSSN, validateDate } from './validators';
import type { ValidationResult } from './types';

export function validateClientAction(action: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const updates = action.params?.updates || action.params || {};
  
  if (updates.phone && !validatePhoneNumber(updates.phone)) {
    errors.push(`Invalid phone number format: ${updates.phone}`);
  }
  
  if (updates.email && !validateEmail(updates.email)) {
    errors.push(`Invalid email format: ${updates.email}`);
  }
  
  if (updates.ssn && !validateSSN(updates.ssn)) {
    errors.push(`Invalid SSN format: ${updates.ssn}`);
  }
  
  if (updates.dob && !validateDate(updates.dob)) {
    errors.push(`Invalid date of birth format: ${updates.dob}`);
  }
  
  // Check for required fields in addClient
  if (action.action === 'addClient' && !updates.firstName && !updates.lastName) {
    warnings.push('Client should have at least firstName or lastName');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

