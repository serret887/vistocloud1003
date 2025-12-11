/**
 * Validation for income-related actions
 */

import type { ValidationResult } from './types';

export function validateIncomeAction(action: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const updates = action.params?.updates || {};
  
  if (updates.monthlyAmount !== undefined && updates.monthlyAmount < 0) {
    errors.push('Monthly amount cannot be negative');
  }
  
  if (updates.bonus !== undefined && updates.bonus < 0) {
    errors.push('Bonus cannot be negative');
  }
  
  if (updates.commissions !== undefined && updates.commissions < 0) {
    errors.push('Commissions cannot be negative');
  }
  
  if (updates.overtime !== undefined && updates.overtime < 0) {
    errors.push('Overtime cannot be negative');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}


