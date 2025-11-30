// Store types for income state management
import type { ClientIncomeData, IncomeFormState, CreateActiveIncomeRequest, UpdateActiveIncomeRequest, CreatePassiveIncomeRequest, UpdatePassiveIncomeRequest, ActiveIncomeRecord, PassiveIncomeRecord, IncomeTotal, IncomeFrequency, PassiveIncomeFrequency, IncomeType, IncomeValidationResult } from './types';

export interface IncomeStoreState {
  incomeData: Record<string, ClientIncomeData>;
  isLoading: boolean;
  error: string | null;
  formState: IncomeFormState;
}

export interface IncomeStoreActions {
  getClientIncomeData: (clientId: string) => ClientIncomeData;
  fetchClientIncomeData: (clientId: string) => Promise<ClientIncomeData>;
  addActiveIncome: (clientId: string, income: CreateActiveIncomeRequest) => Promise<ActiveIncomeRecord>;
  updateActiveIncome: (clientId: string, incomeId: string, updates: UpdateActiveIncomeRequest) => Promise<ActiveIncomeRecord>;
  removeActiveIncome: (clientId: string, incomeId: string) => Promise<void>;
  addPassiveIncome: (clientId: string, income: CreatePassiveIncomeRequest) => Promise<PassiveIncomeRecord>;
  updatePassiveIncome: (clientId: string, incomeId: string, updates: UpdatePassiveIncomeRequest) => Promise<PassiveIncomeRecord>;
  removePassiveIncome: (clientId: string, incomeId: string) => Promise<void>;
  recalculateIncomeTotals: (clientId: string) => Promise<IncomeTotal>;
  setFormState: (state: Partial<IncomeFormState>) => void;
  resetFormState: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

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

