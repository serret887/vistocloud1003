// Core income type definitions
import type { PassiveIncomeType } from './passiveTypes';

export type IncomeFrequency = 'hourly' | 'weekly' | 'bi-weekly' | 'monthly' | 'annually';
export type IncomeType = 'Standard' | 'Foreign' | 'Seasonal' | 'TemporaryLeave';
export type { PassiveIncomeType } from './passiveTypes';
export type PassiveIncomeFrequency = 'monthly' | 'quarterly' | 'annually' | 'irregular';
export type CompletionStatus = 'empty' | 'partial' | 'complete';

export interface ActiveIncomeRecord {
  id: string;
  clientId: string;
  employmentRecordId: string;
  companyName: string;
  position: string;
  monthlyAmount: number;
  bonus?: number;
  commissions?: number;
  overtime?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PassiveIncomeRecord {
  id: string;
  clientId: string;
  sourceType: PassiveIncomeType;
  sourceName: string;
  monthlyAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeTotal {
  id: string;
  clientId: string;
  totalMonthlyIncome: number;
  notes?: string;
  updatedAt?: string;
}

export interface ClientIncomeData {
  clientId: string;
  activeIncomeRecords: ActiveIncomeRecord[];
  passiveIncomeRecords: PassiveIncomeRecord[];
  totals: IncomeTotal;
  completionStatus: CompletionStatus;
  lastUpdated: string;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

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

export interface IncomeCalculationResult {
  monthlyAmount: number;
  annualAmount: number;
  frequency: IncomeFrequency | PassiveIncomeFrequency;
  isValid: boolean;
  errors?: string[];
}

export interface IncomeValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export interface IncomeFormState {
  isEditing: boolean;
  editingId?: string;
  formType: 'active' | 'passive';
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export interface EmploymentRecord {
  id: string;
  clientId: string;
  employerName: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentEmployment: boolean;
}

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

