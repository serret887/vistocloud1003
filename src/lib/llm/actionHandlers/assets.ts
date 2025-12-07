// Asset action handlers
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
  clientId: string
): string {
  if (recordId.startsWith('$')) {
    const resolved = dynamicIdMap.get(recordId) || recordId;
    if (!dynamicIdMap.has(actionRecordId)) {
      const assets = store.assetsData?.[clientId] || [];
      if (assets.length > 0) {
        return assets[assets.length - 1].id;
      }
    }
    return resolved;
  }
  return recordId;
}

export function handleAddAsset(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate {
  const clientId = resolveClientId(action.params.clientId, dynamicIdMap);
  const assetId = store.addAsset(clientId);
  
  if (action.returnId) {
    dynamicIdMap.set(action.returnId, assetId);
  }
  
  const clientName = getClientName(store, clientId);
  
  return {
    description: `Added asset for ${clientName}`,
    field: 'assets',
    timestamp: new Date().toISOString(),
    clientName,
    updates: action.params,
    type: 'asset'
  };
}

export function handleUpdateAsset(
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
    clientId
  );
  
  store.updateAsset(clientId, recordId, action.params.updates);
  const clientName = getClientName(store, clientId);
  
  return {
    description: `Updated asset for ${clientName}`,
    field: 'assets',
    timestamp: new Date().toISOString(),
    clientName,
    updates: action.params.updates,
    type: 'asset'
  };
}

export function handleSetSharedOwners(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate {
  const clientId = resolveClientId(action.params.clientId, dynamicIdMap);
  let assetId = action.params.assetId;
  if (assetId.startsWith('$')) {
    assetId = dynamicIdMap.get(assetId) || assetId;
  }
  
  const sharedClientIds = (action.params.sharedClientIds || []).map((id: string) => {
    return id.startsWith('$') ? dynamicIdMap.get(id) || id : id;
  });
  
  store.setSharedOwners(clientId, assetId, sharedClientIds);
  
  return {
    description: 'Marked asset as joint/shared ownership',
    field: 'assets',
    timestamp: new Date().toISOString()
  };
}


