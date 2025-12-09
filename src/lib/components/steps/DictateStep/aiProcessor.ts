// AI processing logic for DictateStep
import { applicationStore } from '$lib/stores/application/index';
import { executeStoreAction } from '$lib/llm/actionExecutor';
import { getCurrentLLMState } from '$lib/llm/storeAdapter';
import { processConversation } from '$lib/services/aiFunctions';
import type { LLMAction, VoiceUpdate } from '$lib/types/voice-assistant';
import type { DynamicIdMap } from '$lib/llm/types';
import { locale } from '$lib/i18n';
import { get } from 'svelte/store';

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
  const currentLocale = get(locale) || 'en';
  
  // Server now handles: address resolution, duplicate filtering, and validation
  const response = await processConversation(text, currentState, conversationHistory, currentLocale);
  
  // Log validation errors if any
  if (response.validationErrors && response.validationErrors.length > 0) {
    console.warn('Server-side validation errors:', response.validationErrors);
  }
  
  const dynamicIdMap: DynamicIdMap = new Map();
  const newUpdates: VoiceUpdate[] = [];
  
  // Actions are already processed server-side (addresses resolved, duplicates filtered, validated)
  // Just execute them on the client store
  for (const action of response.actions) {
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


