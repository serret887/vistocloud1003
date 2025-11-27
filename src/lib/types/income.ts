// TypeScript types for Income Cards feature
// Generated from data-model.md specification

export type IncomeFrequency = 'hourly' | 'weekly' | 'bi-weekly' | 'monthly' | 'annually';
export type IncomeType = 'salary' | 'hourly' | 'commission' | 'contract' | 'other';
export type PassiveIncomeType = 
  | '401k_ira'
  | 'alimony'
  | 'asset_depletion'
  | 'automobile_expense_account'
  | 'boarder'
  | 'capital_gains'
  | 'child_support'
  | 'dividends_interest'
  | 'foster_care'
  | 'gambling_winnings'
  | 'mortgage_differential'
  | 'notes_receivable'
  | 'pension'
  | 'permanent_disability'
  | 'VITE_assistance'
  | 'royalty_payment'
  | 'social_security'
  | 'temporary_disability'
  | 'temporary_leave'
  | 'trust'
  | 'unemployment'
  | 'va_benefits_non_educational';
export type PassiveIncomeFrequency = 'monthly' | 'quarterly' | 'annually' | 'irregular';
export type CompletionStatus = 'empty' | 'partial' | 'complete';

// Active Income Record - Employment-based income
export interface ActiveIncomeRecord {
  id: string;
  clientId: string;
  employmentRecordId: string;
  companyName: string;
  position: string;
  monthlyAmount: number; // User-entered monthly base amount
  bonus?: number; // Monthly bonus amount
  commissions?: number; // Monthly commission amount
  overtime?: number; // Monthly overtime amount
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Passive Income Record - Non-employment income sources
export interface PassiveIncomeRecord {
  id: string;
  clientId: string;
  sourceType: PassiveIncomeType;
  sourceName: string;
  monthlyAmount: number; // User-entered monthly amount
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Income Totals - User-entered totals
export interface IncomeTotal {
  id: string;
  clientId: string;
  totalMonthlyIncome: number; // User-entered total monthly income
  notes?: string;
  updatedAt?: string;
}

// Client Income Data - Aggregated income information for a client
export interface ClientIncomeData {
  clientId: string;
  activeIncomeRecords: ActiveIncomeRecord[];
  passiveIncomeRecords: PassiveIncomeRecord[];
  totals: IncomeTotal;
  completionStatus: CompletionStatus;
  lastUpdated: string;
  validationErrors: ValidationError[];
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

// Form data types for creating/updating income records
export interface CreateActiveIncomeRequest {
  employmentRecordId: string;
  monthlyAmount: number;
  notes?: string;
}

export interface UpdateActiveIncomeRequest {
  monthlyAmount?: number;
  notes?: string;
}

export interface CreatePassiveIncomeRequest {
  sourceType: PassiveIncomeType;
  sourceName: string;
  monthlyAmount: number;
  notes?: string;
}

export interface UpdatePassiveIncomeRequest {
  sourceType?: PassiveIncomeType;
  sourceName?: string;
  monthlyAmount?: number;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// Income calculation types
export interface IncomeCalculationResult {
  monthlyAmount: number;
  annualAmount: number;
  frequency: IncomeFrequency | PassiveIncomeFrequency;
  isValid: boolean;
  errors?: string[];
}

// Income validation types
export interface IncomeValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

// Form state types
export interface IncomeFormState {
  isEditing: boolean;
  editingId?: string;
  formType: 'active' | 'passive';
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Employment integration types (for active income sync)
export interface EmploymentRecord {
  id: string;
  clientId: string;
  employerName: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentEmployment: boolean;
}

// Income source display labels
export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  salary: 'Salary',
  hourly: 'Hourly',
  commission: 'Commission',
  contract: 'Contract',
  other: 'Other'
};

export const PASSIVE_INCOME_TYPE_LABELS: Record<PassiveIncomeType, string> = {
  '401k_ira': '401K/IRA',
  'alimony': 'Alimony',
  'asset_depletion': 'Asset Depletion',
  'automobile_expense_account': 'Automobile Expense Account',
  'boarder': 'Boarder',
  'capital_gains': 'Capital Gains',
  'child_support': 'Child Support',
  'dividends_interest': 'Dividends/Interest',
  'foster_care': 'Foster Care',
  'gambling_winnings': 'Gambling Winnings',
  'mortgage_differential': 'Mortgage Differential',
  'notes_receivable': 'Notes Receivable',
  'pension': 'Pension',
  'permanent_disability': 'Permanent Disability',
  'VITE_assistance': 'Public Assistance',
  'royalty_payment': 'Royalty Payment',
  'social_security': 'Social Security',
  'temporary_disability': 'Temporary Disability',
  'temporary_leave': 'Temporary Leave',
  'trust': 'Trust',
  'unemployment': 'Unemployment',
  'va_benefits_non_educational': 'VA Benefits Non Educational'
};

export const FREQUENCY_LABELS: Record<IncomeFrequency | PassiveIncomeFrequency, string> = {
  hourly: 'Hourly',
  weekly: 'Weekly',
  'bi-weekly': 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
  irregular: 'Irregular'
};

// Utility types for component props
export interface IncomeCardProps {
  clientId: string;
  onAddIncome: () => void;
  onEditIncome: (incomeId: string) => void;
  onDeleteIncome: (incomeId: string) => void;
}

export interface ActiveIncomeCardProps extends IncomeCardProps {
  activeIncomeRecords: ActiveIncomeRecord[];
}

export interface PassiveIncomeCardProps extends IncomeCardProps {
  passiveIncomeRecords: PassiveIncomeRecord[];
}

export interface IncomeTotalsCardProps {
  totals: IncomeTotal;
  isLoading?: boolean;
}

export interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: 'active' | 'passive';
  clientId: string;
  editingRecord?: ActiveIncomeRecord | PassiveIncomeRecord;
  onSubmit: (data: CreateActiveIncomeRequest | CreatePassiveIncomeRequest) => void;
}

// Store types for state management
export interface IncomeStoreState {
  incomeData: Record<string, ClientIncomeData>;
  isLoading: boolean;
  error: string | null;
  formState: IncomeFormState;
}

export interface IncomeStoreActions {
  // Data fetching
  getClientIncomeData: (clientId: string) => ClientIncomeData;
  fetchClientIncomeData: (clientId: string) => Promise<ClientIncomeData>;
  
  // Active income actions
  addActiveIncome: (clientId: string, income: CreateActiveIncomeRequest) => Promise<ActiveIncomeRecord>;
  updateActiveIncome: (clientId: string, incomeId: string, updates: UpdateActiveIncomeRequest) => Promise<ActiveIncomeRecord>;
  removeActiveIncome: (clientId: string, incomeId: string) => Promise<void>;
  
  // Passive income actions
  addPassiveIncome: (clientId: string, income: CreatePassiveIncomeRequest) => Promise<PassiveIncomeRecord>;
  updatePassiveIncome: (clientId: string, incomeId: string, updates: UpdatePassiveIncomeRequest) => Promise<PassiveIncomeRecord>;
  removePassiveIncome: (clientId: string, incomeId: string) => Promise<void>;
  
  // Totals actions
  recalculateIncomeTotals: (clientId: string) => Promise<IncomeTotal>;
  
  // Form state actions
  setFormState: (state: Partial<IncomeFormState>) => void;
  resetFormState: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Hook return types
export interface UseIncomeCalculationsReturn {
  normalizeToMonthly: (amount: number, frequency: IncomeFrequency | PassiveIncomeFrequency, hoursPerWeek?: number) => number;
  calculateTotals: (clientIncomeData: ClientIncomeData) => IncomeTotal;
  validateIncomeCompleteness: (clientIncomeData: ClientIncomeData) => boolean;
}

export interface UseIncomeValidationReturn {
  validateActiveIncome: (record: Partial<ActiveIncomeRecord>) => IncomeValidationResult;
  validatePassiveIncome: (record: Partial<PassiveIncomeRecord>) => IncomeValidationResult;
  validateIncomeAmount: (amount: number) => boolean;
  validateFrequency: (frequency: string) => boolean;
  validateHoursPerWeek: (hours: number | undefined, incomeType: IncomeType) => boolean;
}

// Type guards
export function isActiveIncomeRecord(record: ActiveIncomeRecord | PassiveIncomeRecord): record is ActiveIncomeRecord {
  return 'employmentRecordId' in record && 'companyName' in record;
}

export function isPassiveIncomeRecord(record: ActiveIncomeRecord | PassiveIncomeRecord): record is PassiveIncomeRecord {
  return 'sourceType' in record && 'sourceName' in record;
}
