// Employment action handlers
import type { LLMAction, VoiceUpdate } from '$lib/types/voice-assistant';
import type { DynamicIdMap } from '../types';

function getClientName(store: any, clientId: string): string {
  const clientData = store.clients?.[clientId];
  if (clientData?.firstName && clientData?.lastName) {
    return `${clientData.firstName} ${clientData.lastName}`;
  }
  return clientData?.firstName || clientData?.lastName || 'Client';
}

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

export function handleAddEmploymentRecord(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate {
  const clientId = resolveClientId(action.params.clientId, dynamicIdMap);
  const empId = store.addEmploymentRecord(clientId);
  
  if (action.returnId) {
    dynamicIdMap.set(action.returnId, empId);
  }
  
  const clientName = getClientName(store, clientId);
  
  return {
    description: `Added employment record for ${clientName}`,
    field: 'employment',
    timestamp: new Date().toISOString(),
    clientName,
    updates: action.params.updates,
    type: 'employment'
  };
}

export function handleUpdateEmploymentRecord(
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
    (s, cid) => s.getEmploymentRecords(cid)
  );
  
  console.log('🔧 Updating employment record:', { clientId, recordId, updates: action.params.updates });
  store.updateEmploymentRecord(clientId, recordId, action.params.updates);
  
  const updatedRecord = store.getEmploymentRecords(clientId).find((emp: any) => emp.id === recordId);
  console.log('🔍 Updated employment record:', updatedRecord);
  
  const clientName = getClientName(store, clientId);
  
  return {
    description: `Updated employment for ${clientName}`,
    field: 'employment',
    timestamp: new Date().toISOString(),
    clientName,
    updates: action.params.updates,
    type: 'employment'
  };
}


