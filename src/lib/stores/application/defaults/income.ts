// Default income data factories
import type { ClientIncomeData, ActiveIncomeRecord, PassiveIncomeRecord } from '$lib/types/income';
import { generateId } from '$lib/idGenerator';

export const createDefaultIncomeData = (clientId: string): ClientIncomeData => ({
  clientId,
  activeIncomeRecords: [],
  passiveIncomeRecords: [],
  totals: {
    id: generateId('income-total'),
    clientId,
    totalMonthlyIncome: 0
  },
  completionStatus: 'empty',
  lastUpdated: new Date().toISOString(),
  validationErrors: []
});

export const createDefaultActiveIncomeRecord = (
  clientId: string,
  employmentRecordId: string
): ActiveIncomeRecord => ({
  id: generateId('active-income'),
  clientId,
  employmentRecordId,
  companyName: '',
  position: '',
  monthlyAmount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const createDefaultPassiveIncomeRecord = (clientId: string): PassiveIncomeRecord => ({
  id: generateId('passive-income'),
  clientId,
  sourceType: 'social_security',
  sourceName: '',
  monthlyAmount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});



