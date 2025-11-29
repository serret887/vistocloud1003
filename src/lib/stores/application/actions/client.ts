// Client-related store actions
import type { Writable } from 'svelte/store';
import type { ApplicationState } from '../types';
import type { ClientData } from '$lib/types/client-data';
import { debug } from '$lib/debug';
import { 
  createDefaultClientData,
  createDefaultAddressData,
  createDefaultEmploymentData,
  createDefaultIncomeData,
  createDefaultAssetsData,
  createDefaultRealEstateData,
  createDefaultDocumentsData
} from '../defaults';

export function createClientActions(
  update: Writable<ApplicationState>['update']
) {
  return {
    setActiveClient: (clientId: string) => {
      update(state => ({ ...state, activeClientId: clientId }));
    },
    
    addClient: () => {
      update(state => {
        const newClientId = `client-${state.clientIds.length + 1}`;
        return {
          ...state,
          clientIds: [...state.clientIds, newClientId],
          clientData: { ...state.clientData, [newClientId]: createDefaultClientData() },
          addressData: { ...state.addressData, [newClientId]: createDefaultAddressData(newClientId) },
          employmentData: { ...state.employmentData, [newClientId]: createDefaultEmploymentData(newClientId) },
          incomeData: { ...state.incomeData, [newClientId]: createDefaultIncomeData(newClientId) },
          assetsData: { ...state.assetsData, [newClientId]: createDefaultAssetsData(newClientId) },
          realEstateData: { ...state.realEstateData, [newClientId]: createDefaultRealEstateData(newClientId) },
          documentsData: { ...state.documentsData, [newClientId]: createDefaultDocumentsData(newClientId) }
        };
      });
    },
    
    removeClient: (clientId: string) => {
      update(state => {
        if (state.clientIds.length <= 1) {
          console.warn('Cannot remove the last client');
          return state;
        }
        
        let newActiveClientId = state.activeClientId;
        if (state.activeClientId === clientId) {
          newActiveClientId = state.clientIds.find(id => id !== clientId) || state.clientIds[0];
        }
        
        const newState = { ...state };
        newState.clientIds = state.clientIds.filter(id => id !== clientId);
        newState.activeClientId = newActiveClientId;
        
        // Remove from all data collections
        for (const key of ['clientData', 'addressData', 'employmentData', 'incomeData', 'assetsData', 'realEstateData', 'documentsData', 'validationErrors', 'visitedSteps', 'touchedFields'] as const) {
          const collection = { ...state[key] };
          delete collection[clientId];
          (newState as any)[key] = collection;
        }
        
        return newState;
      });
    },
    
    updateClientData: (clientId: string, data: Partial<ClientData>) => {
      update(state => {
        const updated = {
          ...state,
          clientData: {
            ...state.clientData,
            [clientId]: { ...state.clientData[clientId], ...data }
          }
        };
        debug.storeUpdate('updateClientData', { clientId, data });
        return updated;
      });
    }
  };
}


