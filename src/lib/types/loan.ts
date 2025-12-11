// Loan Information types
// Based on 1003 form requirements

import type { AddressType } from "$lib/types/address"

export type LoanPurposeType = 
  | 'Purchase'
  | 'Refinance'
  | 'CashOutRefinance'
  | 'Construction'
  | 'ConstructionToPermanent'
  | 'BankStatement'
  | 'DSCR'
  | 'HELOC'
  | 'heloan'
  | 'AssetBased'
  | 'Bridge'
  | 'Other';

export type MortgageType = 
  | 'Conventional'
  | 'FHA'
  | 'VA'
  | 'HardMoney'
  | 'USDA'
  | 'Non-QM'
  | 'Other';

export interface LoanInformation {
  loanPurposeType: LoanPurposeType | null;
  mortgageType: MortgageType | null;
  refinancePropertyId: string | null; // Reference to RealEstateOwned.id when loanPurposeType is Refinance or CashOutRefinance
  purchasePropertyAddress: AddressType | null; // Property address for Purchase loans
  purchasePropertyAddressTBD: boolean; // Mark purchase property address as TBD
  loanAmount: number | null;
  amountOwed: number | null; // For Purchase: purchase price, For Refinance: outstanding balance
  downPayment: number | null;
  downPaymentSource: string | null;
  interestRate: number | null; // Approximate or desired interest rate (as percentage, e.g., 6.5 for 6.5%)
  estimatedTaxes: number | null; // Estimated monthly property taxes
  estimatedInsurance: number | null; // Estimated monthly insurance
  propertyUseType: 'PrimaryResidence' | 'SecondaryResidence' | 'Investment' | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientLoanData {
  clientId: string;
  loanInfo: LoanInformation | null;
  isComplete?: boolean;
}

// Loan information service interface for local data management
export interface LoanService {
  getLoanData(clientId: string): Promise<LoanInformation | null>;
  saveLoanData(clientId: string, loanInfo: LoanInformation): Promise<LoanInformation>;
  getClientLoanData(clientId: string): Promise<ClientLoanData>;
}

// Loan store actions interface
export interface LoanStoreActions {
  setLoanPurposeType: (clientId: string, purposeType: LoanPurposeType) => void;
  setMortgageType: (clientId: string, mortgageType: MortgageType) => void;
  setRefinancePropertyId: (clientId: string, propertyId: string | null) => void;
  setLoanAmount: (clientId: string, amount: number | null) => void;
  setAmountOwed: (clientId: string, amount: number | null) => void;
  setDownPayment: (clientId: string, amount: number | null) => void;
  setDownPaymentSource: (clientId: string, source: string | null) => void;
  setPurchasePropertyAddress: (clientId: string, address: AddressType | null) => void;
  setPurchasePropertyAddressTBD: (clientId: string, tbd: boolean) => void;
  setInterestRate: (clientId: string, rate: number | null) => void;
  setEstimatedTaxes: (clientId: string, taxes: number | null) => void;
  setEstimatedInsurance: (clientId: string, insurance: number | null) => void;
  setPropertyUseType: (clientId: string, useType: 'PrimaryResidence' | 'SecondaryResidence' | 'Investment' | null) => void;
  updateLoanInfo: (clientId: string, updates: Partial<LoanInformation>) => void;
  clearLoanData: (clientId: string) => void;
  getLoanData: (clientId: string) => LoanInformation | null;
  getClientLoanData: (clientId: string) => ClientLoanData;
}

// Loan store state interface
export interface LoanStoreState {
  loanData: { [clientId: string]: ClientLoanData };
  actions: LoanStoreActions;
}

// Loan purpose type labels
export const LOAN_PURPOSE_TYPE_LABELS: Record<LoanPurposeType, string> = {
  'Purchase': 'Purchase',
  'Refinance': 'Refinance',
  'CashOutRefinance': 'Cash-Out Refinance',
  'Construction': 'Construction',
  'ConstructionToPermanent': 'Construction to Permanent',
  'BankStatement': 'Bank Statement',
  'DSCR': 'DSCR',
  'HELOC': 'HELOC',
  'heloan': 'HE Loan',
  'AssetBased': 'Asset Based',
  'Bridge': 'Bridge',
  'Other': 'Other'
};

// Mortgage type labels
export const MORTGAGE_TYPE_LABELS: Record<MortgageType, string> = {
  'Conventional': 'Conventional',
  'FHA': 'FHA',
  'VA': 'VA',
  'HardMoney': 'Hard Money',
  'USDA': 'USDA',
  'Non-QM': 'Non-QM',
  'Other': 'Other'
};

