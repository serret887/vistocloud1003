/**
 * Service for calling Firebase AI Functions
 * Handles transcription and conversation processing
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '$lib/firebase';
import type { LLMApplicationState, LLMResponse } from '$lib/llm/types';

/**
 * Transcribe audio to text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    // Determine MIME type
    const mimeType = audioBlob.type || 'audio/webm';

    console.log('🎤 [TRANSCRIBE] Calling transcribeAudio function:', {
      size: audioBlob.size,
      mimeType
    });

    // Call Firebase Function
    const transcribeFunction = httpsCallable(functions, 'transcribeAudio');
    const result = await transcribeFunction({
      audioBase64: base64Audio,
      mimeType
    });

    const data = result.data as { transcription: string };
    
    if (!data.transcription) {
      throw new Error('No transcription returned');
    }

    console.log('✅ [TRANSCRIBE] Transcription complete:', data.transcription.substring(0, 100) + '...');
    
    return data.transcription;
  } catch (error) {
    console.error('❌ [TRANSCRIBE] Transcription error:', error);
    throw error;
  }
}

/**
 * Process conversation text and get structured actions
 */
export async function processConversation(
  transcription: string,
  currentState: LLMApplicationState,
  conversationHistory: any[] = [],
  locale: string = 'en'
): Promise<LLMResponse> {
  try {
    console.log('🤖 [CONVERSATION] Calling processConversation function:', {
      transcriptionLength: transcription.length,
      hasHistory: conversationHistory.length > 0,
      locale
    });

    // Call Firebase Function
    const processFunction = httpsCallable(functions, 'processConversation');
    const result = await processFunction({
      transcription,
      currentState,
      conversationHistory,
      locale
    });

    const data = result.data as LLMResponse;
    
    console.log('✅ [CONVERSATION] Processing complete:', {
      actionsCount: data.actions?.length || 0,
      summary: data.summary?.substring(0, 50) + '...'
    });

    return data;
  } catch (error) {
    console.error('❌ [CONVERSATION] Processing error:', error);
    throw error;
  }
}

/**
 * Convert blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

