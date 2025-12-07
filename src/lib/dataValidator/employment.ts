// Employment record validation
import { validateUSPhone, formatUSPhone } from '$lib/validators';
import type { EmploymentRecord } from '$lib/types/employment';
import type { ValidationResult } from './types';

export interface ValidatedEmploymentRecord extends Partial<EmploymentRecord> {
  phoneNumber?: string;
}

export function validateEmploymentRecord(data: Partial<EmploymentRecord>): ValidationResult<ValidatedEmploymentRecord> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validatedData: ValidatedEmploymentRecord = { ...data };

  if (data.phoneNumber) {
    if (validateUSPhone(data.phoneNumber)) {
      validatedData.phoneNumber = formatUSPhone(data.phoneNumber);
      console.log('✅ Validated employment phone:', data.phoneNumber, '→', validatedData.phoneNumber);
    } else {
      errors.push(`Invalid employment phone number format: ${data.phoneNumber}`);
      console.warn('❌ Invalid employment phone number:', data.phoneNumber);
      delete validatedData.phoneNumber;
    }
  }

  if (data.employerName && typeof data.employerName === 'string') {
    const cleanName = data.employerName.trim();
    if (cleanName.length > 0) {
      validatedData.employerName = cleanName;
    } else {
      warnings.push('Empty employer name provided');
    }
  }

  if (data.jobTitle && typeof data.jobTitle === 'string') {
    const cleanTitle = data.jobTitle.trim();
    if (cleanTitle.length > 0) {
      validatedData.jobTitle = cleanTitle;
    } else {
      warnings.push('Empty job title provided');
    }
  }

  return {
    isValid: errors.length === 0,
    data: validatedData,
    errors,
    warnings
  };
}


