/**
 * Configuration for processConversation flow
 */

import { genkit } from 'genkit';
import { vertexAI, googleAI } from '@genkit-ai/google-genai';
import { defineSecret } from 'firebase-functions/params';
import { getModelConfig } from '../../config/modelConfig';

// API key for Vertex AI or Google AI
export const apiKey = defineSecret('GOOGLE_AI_API_KEY');

// Get model configuration
export const modelConfig = getModelConfig();

// Initialize Genkit with the appropriate provider
export const ai = genkit({
  plugins: [
    modelConfig.provider === 'vertex'
      ? vertexAI({ location: modelConfig.location || 'us-central1' })
      : modelConfig.provider === 'vertexExpress'
      ? vertexAI({ 
          apiKey: process.env.GOOGLE_AI_API_KEY || '',
          location: modelConfig.location || 'us-central1' 
        })
      : googleAI({ apiKey: process.env.GOOGLE_AI_API_KEY || '' }),
  ],
});


