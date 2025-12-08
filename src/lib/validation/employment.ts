// Employment validation
import type { ApplicationState } from '$lib/stores/application/types';
import type { ValidationError, StepValidationResult } from './types';
import { t } from '$lib/i18n';

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
    return { isValid: false, errors: [{ field: 'employment', message: t('errors.atLeastOneEmployment') }] };
  }
  
  const records = employment.records;
  
  records.forEach((record, index) => {
    const companyName = record.employerName?.trim() || 'Unknown Company';
    
    if (!record.employerName?.trim()) {
      errors.push({ field: `employment.${index}.employerName`, message: t('errors.employerNameRequired', { company: companyName }) });
    }
    if (!record.jobTitle?.trim()) {
      errors.push({ field: `employment.${index}.jobTitle`, message: t('errors.jobTitleRequired', { company: companyName }) });
    }
    if (!record.startDate) {
      errors.push({ field: `employment.${index}.startDate`, message: t('errors.startDateRequired', { company: companyName }) });
    }
    if (!record.currentlyEmployed && !record.hasOfferLetter && !record.endDate) {
      errors.push({ field: `employment.${index}.endDate`, message: t('errors.endDateRequired', { company: companyName }) });
    }
    if (!record.phoneNumber?.trim()) {
      errors.push({ field: `employment.${index}.phoneNumber`, message: t('errors.phoneNumberRequired', { company: companyName }) });
    }
    if (!record.employerAddress?.formattedAddress && !record.employerAddress?.address1) {
      errors.push({ field: `employment.${index}.employerAddress`, message: t('errors.employerAddressRequired', { company: companyName }) });
    }
    if (!record.incomeType?.trim()) {
      errors.push({ field: `employment.${index}.incomeType`, message: t('errors.incomeTypeRequired', { company: companyName }) });
    }
  });
  
  const totalMonths = calculateTotalMonths(records);
  if (totalMonths < 24 && !employment.employmentNote?.trim()) {
    errors.push({ field: 'employmentNote', message: t('errors.employmentNoteRequired') });
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



