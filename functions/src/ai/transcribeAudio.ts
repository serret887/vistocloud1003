/**
 * Transcribe Audio Function
 * Converts audio to text using Google Speech-to-Text API via Vertex AI
 */

import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

// API key for Google Speech-to-Text (can use same key as Gemini)
const apiKey = defineSecret('GOOGLE_AI_API_KEY');

/**
 * Transcribe audio blob to text
 */
export const transcribeAudio = onCall(
  {
    secrets: [apiKey],
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
      // Get API key from secret or environment
      let keyValue: string | undefined;
      try {
        keyValue = apiKey.value();
      } catch (error) {
        // Secret not available (e.g., in emulator), try environment variable
        keyValue = process.env.GOOGLE_AI_API_KEY;
      }
      
      if (!keyValue) {
        throw new Error(
          'GOOGLE_AI_API_KEY is not set. ' +
          'For local development, set the GOOGLE_AI_API_KEY environment variable before starting the emulator.'
        );
      }

      // Use Google Speech-to-Text API
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${keyValue}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: audioFormat,
              sampleRateHertz: 16000,
              languageCode: 'en-US',
              enableAutomaticPunctuation: true,
              model: 'latest_long',
            },
            audio: {
              content: base64Content,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Speech-to-Text API error:', errorData);
        throw new Error(`Speech-to-Text API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        console.warn('No transcription results');
        return { transcription: '' };
      }

      // Combine all alternatives
      const transcription = data.results
        .map((result: any) => result.alternatives[0]?.transcript || '')
        .join(' ')
        .trim();

      console.log('Transcription complete:', transcription.substring(0, 100) + '...');

      return { transcription };
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }
);

