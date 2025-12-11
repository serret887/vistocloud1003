// Loan information validation
import type { ApplicationState } from '$lib/stores/application/types';
import type { StepValidationResult } from './types';
import { t } from '$lib/i18n';

export function isLoanInfoComplete(state: ApplicationState, clientId: string): boolean {
  const loanData = state.loanData[clientId];
  if (!loanData || !loanData.loanInfo) return false;
  
  const info = loanData.loanInfo;
  
  // Required fields
  if (!info.loanPurposeType) return false;
  if (!info.mortgageType) return false;
  if (!info.propertyUseType) return false;
  
  // If it's a refinance type, refinance property is required
  const isRefinanceType = info.loanPurposeType === 'Refinance' || info.loanPurposeType === 'CashOutRefinance';
  if (isRefinanceType && !info.refinancePropertyId) return false;
  
  // Loan amount is required
  if (!info.loanAmount || info.loanAmount <= 0) return false;
  
  // Purchase-specific requirements
  if (info.loanPurposeType === 'Purchase') {
    // Down payment is required
    if (!info.downPayment || info.downPayment < 0) return false;
    // Property address or TBD flag is required
    if (!info.purchasePropertyAddressTBD && !info.purchasePropertyAddress) return false;
  }
  
  // Amount owed is required
  if (!info.amountOwed || info.amountOwed <= 0) return false;
  
  return true;
}

export function validateLoanInfo(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  const loanData = state.loanData[clientId];
  
  if (!loanData || !loanData.loanInfo) {
    errors.push({ field: 'loanInfo', message: t('validation.loanInfo.missing') });
    return { isValid: false, errors };
  }
  
  const info = loanData.loanInfo;
  
  // Loan Purpose Type
  if (!info.loanPurposeType) {
    errors.push({ field: 'loanPurposeType', message: t('validation.loanInfo.loanPurposeTypeRequired') });
  }
  
  // Mortgage Type
  if (!info.mortgageType) {
    errors.push({ field: 'mortgageType', message: t('validation.loanInfo.mortgageTypeRequired') });
  }
  
  // Property Use Type
  if (!info.propertyUseType) {
    errors.push({ field: 'propertyUseType', message: t('validation.loanInfo.propertyUseTypeRequired') });
  }
  
  // Refinance Property (required for refinance types)
  const isRefinanceType = info.loanPurposeType === 'Refinance' || info.loanPurposeType === 'CashOutRefinance';
  if (isRefinanceType && !info.refinancePropertyId) {
    errors.push({ field: 'refinancePropertyId', message: t('validation.loanInfo.refinancePropertyRequired') });
  }
  
  // Loan Amount
  if (!info.loanAmount || info.loanAmount <= 0) {
    errors.push({ field: 'loanAmount', message: t('validation.loanInfo.loanAmountRequired') });
  }
  
  // Purchase-specific requirements
  if (info.loanPurposeType === 'Purchase') {
    // Down Payment
    if (!info.downPayment || info.downPayment < 0) {
      errors.push({ field: 'downPayment', message: t('validation.loanInfo.downPaymentRequired') });
    }
    // Property address or TBD
    if (!info.purchasePropertyAddressTBD && !info.purchasePropertyAddress) {
      errors.push({ field: 'purchasePropertyAddress', message: t('validation.loanInfo.purchasePropertyAddressRequired') });
    }
  }
  
  // Amount Owed (required for all loan types)
  if (!info.amountOwed || info.amountOwed <= 0) {
    errors.push({ field: 'amountOwed', message: t('validation.loanInfo.amountOwedRequired') });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

