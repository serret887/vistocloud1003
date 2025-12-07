// Employment validation
import type { ApplicationState } from '$lib/stores/application/types';
import type { ValidationError, StepValidationResult } from './types';

export function isEmploymentComplete(state: ApplicationState, clientId: string): boolean {
  const employment = state.employmentData[clientId];
  if (!employment?.records?.length) return false;
  
  const records = employment.records;
  const totalMonths = calculateTotalMonths(records);
  
  // If less than 24 months, need employment note
  if (totalMonths < 24) {
    return !!employment.employmentNote?.trim();
  }
  
  // Check that each record has ALL required fields
  return records.every(record => {
    const hasBasicInfo = !!(record.employerName?.trim() && record.jobTitle?.trim() && record.startDate);
    const hasPhone = !!record.phoneNumber?.trim();
    const hasAddress = !!(record.employerAddress?.formattedAddress || record.employerAddress?.address1);
    const hasIncomeType = !!record.incomeType?.trim();
    const hasEndDate = record.currentlyEmployed || record.hasOfferLetter || !!record.endDate;
    
    return hasBasicInfo && hasPhone && hasAddress && hasIncomeType && hasEndDate;
  });
}

export function validateEmployment(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const employment = state.employmentData[clientId];
  
  if (!employment?.records?.length) {
    return { isValid: false, errors: [{ field: 'employment', message: 'At least one employment record is required' }] };
  }
  
  const records = employment.records;
  
  records.forEach((record, index) => {
    const companyName = record.employerName?.trim() || 'Unknown Company';
    
    if (!record.employerName?.trim()) {
      errors.push({ field: `employment.${index}.employerName`, message: `Employer name required for ${companyName}` });
    }
    if (!record.jobTitle?.trim()) {
      errors.push({ field: `employment.${index}.jobTitle`, message: `Job title required for ${companyName}` });
    }
    if (!record.startDate) {
      errors.push({ field: `employment.${index}.startDate`, message: `Start date required for ${companyName}` });
    }
    if (!record.currentlyEmployed && !record.hasOfferLetter && !record.endDate) {
      errors.push({ field: `employment.${index}.endDate`, message: `End date required for ${companyName} (not currently employed)` });
    }
    if (!record.phoneNumber?.trim()) {
      errors.push({ field: `employment.${index}.phoneNumber`, message: `Phone number required for ${companyName}` });
    }
    if (!record.employerAddress?.formattedAddress && !record.employerAddress?.address1) {
      errors.push({ field: `employment.${index}.employerAddress`, message: `Employer address required for ${companyName}` });
    }
    if (!record.incomeType?.trim()) {
      errors.push({ field: `employment.${index}.incomeType`, message: `Income type required for ${companyName}` });
    }
  });
  
  const totalMonths = calculateTotalMonths(records);
  if (totalMonths < 24 && !employment.employmentNote?.trim()) {
    errors.push({ field: 'employmentNote', message: 'Employment history note required (less than 24 months of coverage)' });
  }
  
  return { isValid: errors.length === 0, errors };
}

function calculateTotalMonths(records: any[]): number {
  const now = new Date();
  let totalMonths = 0;
  
  for (const record of records) {
    if (record.startDate) {
      const start = new Date(record.startDate);
      const end = record.currentlyEmployed ? now : (record.endDate ? new Date(record.endDate) : now);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  }
  
  return totalMonths;
}



