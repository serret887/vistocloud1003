// Income action handlers
import type { LLMAction, VoiceUpdate } from '$lib/types/voice-assistant';
import type { DynamicIdMap } from '../types';
import { getClientNameFromLLMState } from '$lib/utils/client';

function resolveClientId(clientId: string, dynamicIdMap: DynamicIdMap): string {
  return clientId.startsWith('$') ? dynamicIdMap.get(clientId) || clientId : clientId;
}

function resolveRecordId(
  recordId: string,
  actionRecordId: string,
  dynamicIdMap: DynamicIdMap,
  store: any,
  clientId: string,
  getRecordsFn: (store: any, clientId: string) => any[]
): string {
  if (recordId.startsWith('$')) {
    const resolved = dynamicIdMap.get(recordId) || recordId;
    if (!dynamicIdMap.has(actionRecordId)) {
      const records = getRecordsFn(store, clientId);
      if (records.length > 0) {
        return records[records.length - 1].id;
      }
    }
    return resolved;
  }
  return recordId;
}

export function handleAddActiveIncome(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate {
  const clientId = resolveClientId(action.params.clientId, dynamicIdMap);
  const incomeId = store.addActiveIncome(clientId);
  
  if (action.returnId) {
    dynamicIdMap.set(action.returnId, incomeId);
  }
  
  const clientName = getClientNameFromLLMState(store, clientId);
  
  return {
    description: `Added income record for ${clientName}`,
    field: 'income',
    timestamp: new Date().toISOString(),
    clientName,
    updates: action.params,
    type: 'income'
  };
}

export function handleUpdateActiveIncome(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate {
  const clientId = resolveClientId(action.params.clientId, dynamicIdMap);
  const recordId = resolveRecordId(
    action.params.recordId,
    action.params.recordId,
    dynamicIdMap,
    store,
    clientId,
    (s, cid) => s.getActiveIncomeRecords(cid)
  );
  
  if (action.params.updates.employmentRecordId?.startsWith('$')) {
    action.params.updates.employmentRecordId = dynamicIdMap.get(action.params.updates.employmentRecordId) || action.params.updates.employmentRecordId;
  }
  
  store.updateActiveIncome(clientId, recordId, action.params.updates);
  const clientName = getClientNameFromLLMState(store, clientId);
  
  return {
    description: `Updated income for ${clientName}`,
    field: 'income',
    timestamp: new Date().toISOString(),
    clientName,
    updates: action.params.updates,
    type: 'income'
  };
}



