// Validation utilities
import { validateUSPhone, formatUSPhone, validateEmail } from '$lib/validators';
import type { ValidationResult } from './types';

export function validatePhoneNumber(phone: string, context: string = 'phone'): ValidationResult<string> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (validateUSPhone(phone)) {
    const formattedPhone = formatUSPhone(phone);
    console.log(`✅ Validated ${context}:`, phone, '→', formattedPhone);
    return {
      isValid: true,
      data: formattedPhone,
      errors: [],
      warnings: []
    };
  } else {
    errors.push(`Invalid ${context} number format: ${phone}`);
    console.warn(`❌ Invalid ${context} number:`, phone);
    return {
      isValid: false,
      data: '',
      errors,
      warnings
    };
  }
}

export function validateEmailAddress(email: string): ValidationResult<string> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (validateEmail(email)) {
    const formattedEmail = email.toLowerCase().trim();
    console.log('✅ Validated email:', email, '→', formattedEmail);
    return {
      isValid: true,
      data: formattedEmail,
      errors: [],
      warnings: []
    };
  } else {
    errors.push(`Invalid email format: ${email}`);
    console.warn('❌ Invalid email:', email);
    return {
      isValid: false,
      data: '',
      errors,
      warnings
    };
  }
}

export function logValidationResults<T>(
  context: string, 
  result: ValidationResult<T>
): void {
  if (result.errors.length > 0) {
    console.error(`❌ ${context} validation failed:`, result.errors);
  }
  if (result.warnings.length > 0) {
    console.warn(`⚠️ ${context} validation warnings:`, result.warnings);
  }
  if (result.isValid && result.errors.length === 0) {
    console.log(`✅ ${context} validation passed`);
  }
}



