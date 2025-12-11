/**
 * Validation for address-related actions
 */

import { validateDate, validateDateRange } from './validators';
import type { ValidationResult } from './types';

export function validateAddressAction(action: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (action.action === 'updateAddressData') {
    const addr = action.params?.data?.addr;
    if (addr && addr.address1 && addr.address1.trim().length === 0) {
      errors.push('Address1 cannot be empty');
    }
  }
  
  if (action.action === 'addFormerAddress') {
    const address = action.params?.address;
    if (address) {
      if (address.fromDate && !validateDate(address.fromDate)) {
        errors.push(`Invalid from date format: ${address.fromDate}`);
      }
      
      if (address.toDate && !validateDate(address.toDate)) {
        errors.push(`Invalid to date format: ${address.toDate}`);
      }
      
      if (address.fromDate && address.toDate && !validateDateRange(address.fromDate, address.toDate)) {
        errors.push('To date cannot be before from date');
      }
      
      if (address.addr?.address1 && address.addr.address1.trim().length === 0) {
        errors.push('Address1 cannot be empty');
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}


