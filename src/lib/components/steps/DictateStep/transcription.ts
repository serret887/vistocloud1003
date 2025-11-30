// Audio transcription utilities for DictateStep
import { transcribeAudio } from '$lib/services/aiFunctions';
import type { ChatMessage } from '$lib/types/voice-assistant';

export interface TranscriptionState {
  isTranscribing: boolean;
  pendingTranscription: string | null;
  error: string | null;
}

export function createTranscriptionState(): TranscriptionState {
  return {
    isTranscribing: false,
    pendingTranscription: null,
    error: null
  };
}

export async function processAudioBlob(
  audioBlob: Blob,
  source: 'voice' | 'file',
  state: TranscriptionState,
  onTranscription: (text: string) => void,
  onError: (error: string) => void
): Promise<ChatMessage | null> {
  state.isTranscribing = true;
  state.error = null;
  state.pendingTranscription = null;
  
  try {
    const transcription = await transcribeAudio(audioBlob);
    if (!transcription?.trim()) {
      state.error = 'No speech detected. Please try again.';
      onError(state.error);
      return null;
    }
    
    // Call the callback to append transcription to input field
    onTranscription(transcription);
    return null; // Don't add message to chat - transcription goes to input field
  } catch (err) {
    state.error = err instanceof Error ? err.message : 'Failed to transcribe audio';
    onError(state.error);
    // Return error message to show in chat
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `❌ Error: ${state.error}`,
      timestamp: new Date()
    };
  } finally {
    state.isTranscribing = false;
  }
}

