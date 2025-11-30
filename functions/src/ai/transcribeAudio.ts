/**
 * Transcribe Audio Function
 * Converts audio to text using Vertex AI Speech-to-Text API
 * Uses Application Default Credentials (ADC) - no API key needed
 */

import { onCall } from 'firebase-functions/v2/https';
import { SpeechClient } from '@google-cloud/speech';

/**
 * Transcribe audio blob to text using Vertex AI
 */
export const transcribeAudio = onCall(
  {
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    const { audioBase64, mimeType } = request.data as {
      audioBase64: string;
      mimeType: string;
    };

    if (!audioBase64) {
      throw new Error('audioBase64 is required');
    }

    // Determine audio format from MIME type
    const audioFormat = mimeType.includes('webm') ? 'WEBM_OPUS' :
                       mimeType.includes('mp3') ? 'MP3' :
                       mimeType.includes('wav') ? 'LINEAR16' : 'WEBM_OPUS';

    // Remove data URL prefix if present
    const base64Content = audioBase64.includes(',') 
      ? audioBase64.split(',')[1] 
      : audioBase64;

    try {
      // Get project ID from environment
      // In Firebase Functions, GCLOUD_PROJECT is automatically set
      const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;

      if (!projectId) {
        throw new Error('GCLOUD_PROJECT or GCP_PROJECT environment variable is not set');
      }

      // Initialize Speech client with ADC (Application Default Credentials)
      // In Firebase Functions, ADC is automatically configured
      // Vertex AI Speech API uses the standard endpoint
      const speechClient = new SpeechClient({
        projectId,
      });

      // Prepare the recognition request
      const requestConfig = {
        encoding: audioFormat as any,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'latest_long',
      };

      const audio = {
        content: base64Content,
      };

      // Call Vertex AI Speech-to-Text API
      const [response] = await speechClient.recognize({
        config: requestConfig,
        audio: audio,
      });

      if (!response.results || response.results.length === 0) {
        console.warn('No transcription results');
        return { transcription: '' };
      }

      // Combine all alternatives
      const transcription = response.results
        .map((result: any) => result.alternatives?.[0]?.transcript || '')
        .join(' ')
        .trim();

      console.log('Transcription complete:', transcription.substring(0, 100) + '...');

      return { transcription };
    } catch (error: any) {
      console.error('Transcription error:', error);
      throw new Error(`Transcription failed: ${error.message || 'Unknown error'}`);
    }
  }
);

