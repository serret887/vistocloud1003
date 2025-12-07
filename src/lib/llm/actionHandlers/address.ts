// Address action handlers
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

export function handleUpdateAddressData(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate {
  const clientId = resolveClientId(action.params.clientId, dynamicIdMap);
  const currentAddressData = store.getAddressData(clientId);
  
  const presentAddress = currentAddressData.present || {
    id: 'present',
    fromDate: '',
    toDate: '',
    addr: {
      address1: '',
      address2: '',
      formattedAddress: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      lat: 0,
      lng: 0
    },
    isPresent: true
  };
  
  const updatedAddressData = {
    ...currentAddressData,
    present: {
      ...presentAddress,
      addr: action.params.data.addr,
      fromDate: action.params.data.fromDate && action.params.data.fromDate.trim() !== ''
        ? action.params.data.fromDate
        : presentAddress.fromDate,
      toDate: action.params.data.toDate && action.params.data.toDate.trim() !== ''
        ? action.params.data.toDate
        : presentAddress.toDate
    },
    former: currentAddressData.former || []
  };
  
  store.updateAddressData(clientId, updatedAddressData);
  const clientName = getClientName(store, clientId);
  
  return {
    description: `Updated address for ${clientName}`,
    field: 'address',
    timestamp: new Date().toISOString(),
    clientName,
    updates: { address: action.params.data.addr?.formattedAddress || action.params.data.addr?.address1 || '' },
    type: 'address'
  };
}

export function handleAddFormerAddress(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate {
  const clientId = resolveClientId(action.params.clientId, dynamicIdMap);
  store.addFormerAddress(clientId, action.params.address);
  const clientName = getClientName(store, clientId);
  
  return {
    description: `Added former address for ${clientName}`,
    field: 'address',
    timestamp: new Date().toISOString(),
    clientName,
    updates: { address: action.params.address.addr?.formattedAddress || action.params.address.addr?.address1 || '' },
    type: 'address'
  };
}


