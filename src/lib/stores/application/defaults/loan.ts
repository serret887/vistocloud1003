// Default loan data factories
import type { ClientLoanData, LoanInformation } from '$lib/types/loan';

export function createDefaultLoanData(clientId: string): ClientLoanData {
  return {
    clientId,
    loanInfo: createDefaultLoanInformation(),
    isComplete: false
  };
}

export function createDefaultLoanInformation(): LoanInformation {
  return {
    loanPurposeType: null,
    mortgageType: null,
    refinancePropertyId: null,
    purchasePropertyAddress: null,
    purchasePropertyAddressTBD: false,
    loanAmount: null,
    amountOwed: null,
    downPayment: null,
    downPaymentSource: null,
    interestRate: null,
    estimatedTaxes: null,
    estimatedInsurance: null,
    propertyUseType: null
  };
}

