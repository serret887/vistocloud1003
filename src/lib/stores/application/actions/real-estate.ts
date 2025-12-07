// Real estate-related store actions
import type { Writable } from 'svelte/store';
import type { ApplicationState } from '../types';
import type { RealEstateOwned } from '$lib/types/real-estate';
import { generateId } from '$lib/idGenerator';
import { createEmptyAddress } from '../defaults';

export function createRealEstateActions(
  update: Writable<ApplicationState>['update']
) {
  return {
    addRealEstateRecord: (clientId: string) => {
      const newRecord: RealEstateOwned = {
        id: generateId('reo'),
        clientId,
        address: createEmptyAddress(),
        propertyType: 'Single Family',
        propertyStatus: 'Retained',
        occupancyType: 'Primary Residence',
        monthlyTaxes: 0,
        monthlyInsurance: 0,
        currentResidence: false,
        propertyValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        realEstateData: {
          ...state.realEstateData,
          [clientId]: {
            ...state.realEstateData[clientId],
            records: [...state.realEstateData[clientId].records, newRecord]
          }
        }
      }));
      
      return newRecord.id;
    },
    
    updateRealEstateRecord: (clientId: string, recordId: string, updates: Partial<RealEstateOwned>) => {
      update(state => ({
        ...state,
        realEstateData: {
          ...state.realEstateData,
          [clientId]: {
            ...state.realEstateData[clientId],
            records: state.realEstateData[clientId].records.map(r =>
              r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
          }
        }
      }));
    },
    
    removeRealEstateRecord: (clientId: string, recordId: string) => {
      update(state => ({
        ...state,
        realEstateData: {
          ...state.realEstateData,
          [clientId]: {
            ...state.realEstateData[clientId],
            records: state.realEstateData[clientId].records.filter(r => r.id !== recordId)
          }
        }
      }));
    }
  };
}



