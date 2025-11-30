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
  
  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content: source === 'voice' ? '🎤 Transcribing voice recording...' : '📁 Transcribing audio file...',
    timestamp: new Date()
  };
  
  try {
    const transcription = await transcribeAudio(audioBlob);
    if (!transcription?.trim()) {
      userMessage.content = source === 'voice' 
        ? '🎤 (No speech detected)' 
        : '📁 (No speech detected in file)';
      state.error = 'No speech detected. Please try again.';
      onError(state.error);
      return userMessage;
    }
    
    state.pendingTranscription = transcription;
    userMessage.content = transcription;
    onTranscription(transcription);
    return userMessage;
  } catch (err) {
    state.error = err instanceof Error ? err.message : 'Failed to transcribe audio';
    onError(state.error);
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

