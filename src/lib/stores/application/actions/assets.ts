// Assets-related store actions
import type { Writable } from 'svelte/store';
import type { ApplicationState } from '../types';
import type { AssetRecord } from '$lib/types/assets';
import { generateId } from '$lib/idGenerator';

export function createAssetsActions(
  update: Writable<ApplicationState>['update']
) {
  return {
    addAssetRecord: (clientId: string, category: AssetRecord['category']) => {
      const newRecord: AssetRecord = {
        id: generateId('asset'),
        clientId,
        category,
        type: '',
        amount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        assetsData: {
          ...state.assetsData,
          [clientId]: {
            ...state.assetsData[clientId],
            records: [...state.assetsData[clientId].records, newRecord]
          }
        }
      }));
      
      return newRecord.id;
    },
    
    updateAssetRecord: (clientId: string, recordId: string, updates: Partial<AssetRecord>) => {
      update(state => ({
        ...state,
        assetsData: {
          ...state.assetsData,
          [clientId]: {
            ...state.assetsData[clientId],
            records: state.assetsData[clientId].records.map(r =>
              r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
          }
        }
      }));
    },
    
    removeAssetRecord: (clientId: string, recordId: string) => {
      update(state => ({
        ...state,
        assetsData: {
          ...state.assetsData,
          [clientId]: {
            ...state.assetsData[clientId],
            records: state.assetsData[clientId].records.filter(r => r.id !== recordId)
          }
        }
      }));
    }
  };
}



