// Income validation
import type { ApplicationState } from '$lib/stores/application/types';
import type { ValidationError, StepValidationResult } from './types';

export function isIncomeComplete(state: ApplicationState, clientId: string): boolean {
  const income = state.incomeData[clientId];
  if (!income) return false;
  
  // Only check income for currently employed positions
  const employment = state.employmentData[clientId];
  const currentEmploymentRecords = (employment?.records || []).filter(emp => emp.currentlyEmployed === true);
  
  // Check if we have income records for all currently employed positions
  const hasActiveIncomeForCurrent = currentEmploymentRecords.length > 0 && 
    currentEmploymentRecords.every(empRecord => {
      const incomeRecord = income.activeIncomeRecords?.find(r => r.employmentRecordId === empRecord.id);
      return incomeRecord && incomeRecord.monthlyAmount && incomeRecord.monthlyAmount > 0;
    });
  
  const hasPassiveIncome = (income.passiveIncomeRecords?.length || 0) > 0;
  
  return hasActiveIncomeForCurrent || hasPassiveIncome;
}

export function validateIncome(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const income = state.incomeData[clientId];
  
  if (!income) {
    return { isValid: false, errors: [{ field: 'income', message: 'Income data not found' }] };
  }
  
  const hasActiveIncome = (income.activeIncomeRecords?.length || 0) > 0;
  const hasPassiveIncome = (income.passiveIncomeRecords?.length || 0) > 0;
  
  if (!hasActiveIncome && !hasPassiveIncome) {
    errors.push({ field: 'income', message: 'At least one income source is required' });
  }
  
  // Validate only currently employed positions
  const employment = state.employmentData[clientId];
  const currentEmploymentRecords = (employment?.records || []).filter(emp => emp.currentlyEmployed === true);
  
  if (currentEmploymentRecords.length > 0) {
    currentEmploymentRecords.forEach((empRecord, empIndex) => {
      const incomeRecord = income.activeIncomeRecords?.find(r => r.employmentRecordId === empRecord.id);
      const companyName = empRecord.employerName?.trim() || 'Unknown Company';
      
      if (!incomeRecord || !incomeRecord.monthlyAmount || incomeRecord.monthlyAmount <= 0) {
        errors.push({ 
          field: `activeIncome.${empIndex}.monthlyAmount`, 
          message: `Base monthly income required for ${companyName}` 
        });
      }
    });
  }
  
  // Validate passive income records
  income.passiveIncomeRecords?.forEach((record, index) => {
    if (!record.sourceName?.trim()) {
      errors.push({ field: `passiveIncome.${index}.sourceName`, message: `Income source required for passive income ${index + 1}` });
    }
    if (!record.monthlyAmount || record.monthlyAmount <= 0) {
      errors.push({ field: `passiveIncome.${index}.monthlyAmount`, message: `Income amount required for passive income ${index + 1}` });
    }
  });
  
  return { isValid: errors.length === 0, errors };
}


