/**
 * Centralized Data Validation and Formatting Service
 * Re-exports from modular validators
 */
export { validateClientData, type ValidatedClientData } from './dataValidator/client';
export { validateEmploymentRecord, type ValidatedEmploymentRecord } from './dataValidator/employment';
export { validatePhoneNumber, validateEmailAddress, logValidationResults } from './dataValidator/utils';
export type { ValidationResult } from './dataValidator/types';
