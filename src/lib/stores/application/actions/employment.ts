// Employment-related store actions
import type { Writable } from 'svelte/store';
import type { ApplicationState } from '../types';
import type { EmploymentRecord } from '$lib/types/employment';
import { generateId } from '$lib/idGenerator';
import { createEmptyAddress } from '../defaults';
import { debug } from '$lib/debug';

export function createEmploymentActions(
  update: Writable<ApplicationState>['update']
) {
  return {
    addEmploymentRecord: (clientId: string) => {
      let newRecordId = '';
      
      update(state => {
        const existingRecords = state.employmentData[clientId]?.records || [];
        let mostRecentStartDate: string | null = null;
        
        // Auto-fill end date from most recent job
        if (existingRecords.length > 0) {
          const currentJob = existingRecords.find(r => r.currentlyEmployed && r.startDate);
          if (currentJob?.startDate) {
            mostRecentStartDate = currentJob.startDate;
          } else {
            const sortedByStartDate = existingRecords
              .filter(r => r.startDate)
              .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime());
            
            if (sortedByStartDate.length > 0) {
              mostRecentStartDate = sortedByStartDate[0].startDate!;
            }
          }
        }
        
        const newRecord: EmploymentRecord = {
          id: generateId('emp'),
          employerName: '',
          phoneNumber: '',
          employerAddress: createEmptyAddress(),
          jobTitle: '',
          incomeType: '',
          selfEmployed: false,
          ownershipPercentage: false,
          relatedParty: false,
          currentlyEmployed: false,
          startDate: '',
          endDate: mostRecentStartDate,
          hasOfferLetter: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        newRecordId = newRecord.id;
        
        return {
          ...state,
          employmentData: {
            ...state.employmentData,
            [clientId]: {
              ...state.employmentData[clientId],
              records: [...state.employmentData[clientId].records, newRecord]
            }
          }
        };
      });
      
      return newRecordId;
    },
    
    updateEmploymentRecord: (clientId: string, recordId: string, updates: Partial<EmploymentRecord>) => {
      update(state => {
        const updated = {
          ...state,
          employmentData: {
            ...state.employmentData,
            [clientId]: {
              ...state.employmentData[clientId],
              records: state.employmentData[clientId].records.map(r =>
                r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
              )
            }
          }
        };
        debug.storeUpdate('updateEmploymentRecord', { clientId, recordId, updates });
        return updated;
      });
    },
    
    removeEmploymentRecord: (clientId: string, recordId: string) => {
      update(state => ({
        ...state,
        employmentData: {
          ...state.employmentData,
          [clientId]: {
            ...state.employmentData[clientId],
            records: state.employmentData[clientId].records.filter(r => r.id !== recordId)
          }
        }
      }));
    }
  };
}


