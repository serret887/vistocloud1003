// Income-related store actions
import type { Writable } from 'svelte/store';
import type { ApplicationState } from '../types';
import type { ActiveIncomeRecord, PassiveIncomeRecord } from '$lib/types/income';
import { generateId } from '$lib/idGenerator';

export function createIncomeActions(
  update: Writable<ApplicationState>['update']
) {
  return {
    addActiveIncome: (clientId: string, employmentRecordId: string) => {
      const newRecord: ActiveIncomeRecord = {
        id: generateId('active-income'),
        clientId,
        employmentRecordId,
        companyName: '',
        position: '',
        monthlyAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        incomeData: {
          ...state.incomeData,
          [clientId]: {
            ...state.incomeData[clientId],
            activeIncomeRecords: [...state.incomeData[clientId].activeIncomeRecords, newRecord]
          }
        }
      }));
      
      return newRecord.id;
    },
    
    addPassiveIncome: (clientId: string) => {
      const newRecord: PassiveIncomeRecord = {
        id: generateId('passive-income'),
        clientId,
        sourceType: 'social_security',
        sourceName: '',
        monthlyAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        incomeData: {
          ...state.incomeData,
          [clientId]: {
            ...state.incomeData[clientId],
            passiveIncomeRecords: [...state.incomeData[clientId].passiveIncomeRecords, newRecord]
          }
        }
      }));
      
      return newRecord.id;
    },
    
    updateActiveIncomeRecord: (clientId: string, recordId: string, updates: Partial<ActiveIncomeRecord>) => {
      update(state => ({
        ...state,
        incomeData: {
          ...state.incomeData,
          [clientId]: {
            ...state.incomeData[clientId],
            activeIncomeRecords: state.incomeData[clientId].activeIncomeRecords.map(r =>
              r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
          }
        }
      }));
    },
    
    updatePassiveIncomeRecord: (clientId: string, recordId: string, updates: Partial<PassiveIncomeRecord>) => {
      update(state => ({
        ...state,
        incomeData: {
          ...state.incomeData,
          [clientId]: {
            ...state.incomeData[clientId],
            passiveIncomeRecords: state.incomeData[clientId].passiveIncomeRecords.map(r =>
              r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
          }
        }
      }));
    }
  };
}




