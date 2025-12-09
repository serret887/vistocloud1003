/**
 * Validation for real estate-related actions
 */

import type { ValidationResult } from './types';

export function validateRealEstateAction(action: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const updates = action.params?.updates || {};
  
  if (updates.propertyValue !== undefined && updates.propertyValue < 0) {
    errors.push('Property value cannot be negative');
  }
  
  if (updates.monthlyTaxes !== undefined && updates.monthlyTaxes < 0) {
    errors.push('Monthly taxes cannot be negative');
  }
  
  if (updates.monthlyInsurance !== undefined && updates.monthlyInsurance < 0) {
    errors.push('Monthly insurance cannot be negative');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

