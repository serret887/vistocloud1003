// Client data validation
import { validateUSPhone, formatUSPhone, validateEmail } from '$lib/validators';
import type { ClientData } from '$lib/types/client-data';
import type { ValidationResult } from './types';

export interface ValidatedClientData extends Partial<ClientData> {
  phone?: string;
  email?: string;
}

export function validateClientData(data: Partial<ClientData>): ValidationResult<ValidatedClientData> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validatedData: ValidatedClientData = { ...data };

  if (data.phone) {
    if (validateUSPhone(data.phone)) {
      validatedData.phone = formatUSPhone(data.phone);
      console.log('✅ Validated client phone:', data.phone, '→', validatedData.phone);
    } else {
      errors.push(`Invalid phone number format: ${data.phone}`);
      console.warn('❌ Invalid client phone number:', data.phone);
      delete validatedData.phone;
    }
  }

  if (data.email) {
    if (validateEmail(data.email)) {
      validatedData.email = data.email.toLowerCase().trim();
      console.log('✅ Validated client email:', data.email, '→', validatedData.email);
    } else {
      errors.push(`Invalid email format: ${data.email}`);
      console.warn('❌ Invalid client email:', data.email);
      delete validatedData.email;
    }
  }

  if (data.ssn) {
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    if (ssnRegex.test(data.ssn)) {
      const digits = data.ssn.replace(/\D/g, '');
      if (digits.length === 9) {
        const areaNumber = digits.slice(0, 3);
        const groupNumber = digits.slice(3, 5);
        const serialNumber = digits.slice(5);
        
        const invalidAreaNumbers = ['000', '666'];
        const invalidGroupNumbers = ['00'];
        const invalidSerialNumbers = ['0000'];
        
        if (invalidAreaNumbers.includes(areaNumber) || 
            areaNumber.startsWith('9') ||
            invalidGroupNumbers.includes(groupNumber) || 
            invalidSerialNumbers.includes(serialNumber)) {
          errors.push(`Invalid SSN: ${data.ssn} contains unassigned number patterns`);
          console.warn('❌ Invalid client SSN pattern:', data.ssn);
          delete validatedData.ssn;
        } else {
          validatedData.ssn = `${areaNumber}-${groupNumber}-${serialNumber}`;
          console.log('✅ Validated client SSN:', data.ssn, '→', validatedData.ssn);
        }
      } else {
        errors.push(`Invalid SSN: must be 9 digits`);
        console.warn('❌ Invalid client SSN length:', data.ssn);
        delete validatedData.ssn;
      }
    } else {
      errors.push(`Invalid SSN format: ${data.ssn}`);
      console.warn('❌ Invalid client SSN format:', data.ssn);
      delete validatedData.ssn;
    }
  }

  if (data.firstName && typeof data.firstName === 'string') {
    const cleanName = data.firstName.trim();
    if (cleanName.length > 0) {
      validatedData.firstName = cleanName;
    } else {
      warnings.push('Empty first name provided');
    }
  }

  if (data.lastName && typeof data.lastName === 'string') {
    const cleanName = data.lastName.trim();
    if (cleanName.length > 0) {
      validatedData.lastName = cleanName;
    } else {
      warnings.push('Empty last name provided');
    }
  }

  return {
    isValid: errors.length === 0,
    data: validatedData,
    errors,
    warnings
  };
}

