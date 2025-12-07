// Client action handlers
import type { LLMAction, VoiceUpdate } from '$lib/types/voice-assistant';
import type { DynamicIdMap } from '../types';
import { validateClientData } from '$lib/dataValidator';
import { get } from 'svelte/store';
import type { ApplicationState } from '$lib/stores/application';

export function handleAddClient(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate {
  const newClientId = store.addClient();
  if (action.returnId) {
    dynamicIdMap.set(action.returnId, newClientId);
  }
  
  if (action.params && Object.keys(action.params).length > 0) {
    store.updateClientData(newClientId, action.params);
  }
  
  return {
    description: 'Added new client',
    field: 'client',
    timestamp: new Date().toISOString(),
    updates: action.params,
    clientName: action.params.firstName && action.params.lastName
      ? `${action.params.firstName} ${action.params.lastName}`
      : action.params.firstName || action.params.lastName || 'Client',
    type: 'client'
  };
}

export function handleUpdateClientData(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate {
  let clientId = action.params.id;
  if (clientId.startsWith('$')) {
    clientId = dynamicIdMap.get(clientId) || clientId;
  }
  
  const validationResult = validateClientData(action.params.updates);
  store.updateClientData(clientId, action.params.updates);
  
  const state = get(store) as ApplicationState;
  const clientData = state.clientData[clientId];
  const clientName = clientData?.firstName && clientData?.lastName
    ? `${clientData.firstName} ${clientData.lastName}`
    : clientData?.firstName || clientData?.lastName || 'Client';
  
  let description = `Updated ${clientName}`;
  const updates: any = { ...validationResult.data };
  
  if (validationResult.errors.length > 0) {
    const errorFields = validationResult.errors.map(error => {
      if (error.includes('SSN')) return 'SSN';
      if (error.includes('phone')) return 'phone';
      if (error.includes('email')) return 'email';
      return 'data';
    }).join(', ');
    description += ` (${errorFields} not updated due to invalid format)`;
  }
  
  return {
    description,
    field: 'client',
    timestamp: new Date().toISOString(),
    clientName,
    updates,
    type: 'client'
  };
}


