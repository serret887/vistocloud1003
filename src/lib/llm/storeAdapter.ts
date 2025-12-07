/**
 * Adapter to convert Svelte store state to LLMApplicationState format
 */

import type { ApplicationState } from '$lib/stores/application/index';
import type { LLMApplicationState } from './types';
import { get } from 'svelte/store';
import { applicationStore } from '$lib/stores/application/index';

/**
 * Convert ApplicationState to LLMApplicationState format
 */
export function convertToLLMState(state: ApplicationState): LLMApplicationState {
  // Convert client data to the format expected by LLM
  const clients: Record<string, any> = {};
  
  state.clientIds.forEach(clientId => {
    clients[clientId] = {
      ...state.clientData[clientId],
      id: clientId
    };
  });

  // Convert income data structure
  const incomeData: LLMApplicationState['incomeData'] = {
    active: {},
    passive: {},
    totals: {}
  };

  state.clientIds.forEach(clientId => {
    const income = state.incomeData[clientId];
    if (income) {
      incomeData.active[clientId] = income.activeIncomeRecords || [];
      incomeData.passive[clientId] = income.passiveIncomeRecords || [];
      incomeData.totals[clientId] = income.totals || {};
    }
  });

  return {
    clients,
    activeClientId: state.activeClientId,
    employmentData: state.employmentData,
    incomeData,
    realEstateData: state.realEstateData,
    assetsData: state.assetsData,
    addressData: state.addressData
  };
}

/**
 * Get current LLM state from the store
 */
export function getCurrentLLMState(): LLMApplicationState {
  const state = get(applicationStore);
  return convertToLLMState(state);
}

