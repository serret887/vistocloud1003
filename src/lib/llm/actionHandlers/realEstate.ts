// Real estate action handlers
import type { LLMAction, VoiceUpdate } from '$lib/types/voice-assistant';

export function handleAddRealEstateRecord(
  action: LLMAction,
  store: any
): VoiceUpdate {
  store.addRealEstateRecord(action.params.clientId);
  return {
    description: 'Added new real estate property',
    field: 'real-estate',
    timestamp: new Date().toISOString()
  };
}

export function handleUpdateRealEstateRecord(
  action: LLMAction,
  store: any
): VoiceUpdate {
  store.updateRealEstateRecord(
    action.params.clientId,
    action.params.recordId,
    action.params.updates
  );
  const fields = Object.keys(action.params.updates).join(', ');
  return {
    description: `Updated property: ${fields}`,
    field: fields,
    timestamp: new Date().toISOString(),
    updates: action.params.updates
  };
}


