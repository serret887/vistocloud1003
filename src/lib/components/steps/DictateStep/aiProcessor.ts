// AI processing logic for DictateStep
import { applicationStore } from '$lib/stores/application';
import { executeStoreAction } from '$lib/llm/actionExecutor';
import { resolveAddressesInActions } from '$lib/llm/addressResolver';
import { filterDuplicateActions } from '$lib/llm/duplicateFilter';
import { getCurrentLLMState } from '$lib/llm/storeAdapter';
import { processConversation } from '$lib/services/aiFunctions';
import type { LLMAction, VoiceUpdate } from '$lib/types/voice-assistant';
import type { DynamicIdMap } from '$lib/llm/types';

export interface ProcessResult {
  summary: string;
  nextSteps?: string;
  updates: VoiceUpdate[];
}

export async function processTextWithAI(
  text: string,
  conversationHistory: any[]
): Promise<ProcessResult> {
  const currentState = getCurrentLLMState();
  const response = await processConversation(text, currentState, conversationHistory);
  const dynamicIdMap: DynamicIdMap = new Map();
  const newUpdates: VoiceUpdate[] = [];
  
  const resolvedActions = await resolveAddressesInActions(response.actions);
  const filteredActions = filterDuplicateActions(resolvedActions, applicationStore);
  
  for (const action of filteredActions) {
    try {
      const update = executeStoreAction(action, applicationStore, dynamicIdMap);
      if (update) newUpdates.push(update);
    } catch (err) {
      console.error('Error executing action:', err, action);
    }
  }
  
  if (newUpdates.length > 0) {
    try {
      await applicationStore.saveToFirebase();
    } catch (err) {
      console.error('Failed to save to Firebase:', err);
    }
  }
  
  conversationHistory.push(
    { role: 'user', content: text, timestamp: new Date().toISOString() },
    { 
      role: 'assistant', 
      content: response.summary, 
      updates: newUpdates.map(u => u.description), 
      timestamp: new Date().toISOString() 
    }
  );
  
  if (conversationHistory.length > 10) {
    conversationHistory.splice(0, conversationHistory.length - 10);
  }
  
  return {
    summary: response.summary,
    nextSteps: response.nextSteps,
    updates: newUpdates
  };
}

