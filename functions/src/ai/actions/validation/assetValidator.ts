/**
 * Validation for asset-related actions
 */

import type { ValidationResult } from './types';

export function validateAssetAction(action: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const updates = action.params?.updates || {};
  
  if (updates.amount !== undefined && updates.amount < 0) {
    errors.push('Asset amount cannot be negative');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}


