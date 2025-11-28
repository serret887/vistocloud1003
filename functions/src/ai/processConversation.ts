/**
 * Process Conversation Function
 * Processes text input and returns structured actions for updating the application
 */

import { genkit, z } from 'genkit';
import { vertexAI, googleAI } from '@genkit-ai/google-genai';
import { onCallGenkit } from 'firebase-functions/https';
import { defineSecret } from 'firebase-functions/params';
import { getModelConfig } from '../config/modelConfig';
import { buildSystemPrompt } from './promptBuilder';

// API key for Vertex AI or Google AI
const apiKey = defineSecret('GOOGLE_AI_API_KEY');

// Get model configuration
const modelConfig = getModelConfig();

// Initialize Genkit with the appropriate provider
// Note: For local emulator, use .env file. For production, secrets are available as env vars
const ai = genkit({
  plugins: [
    modelConfig.provider === 'vertex'
      ? vertexAI({ location: modelConfig.location || 'global' })
      : modelConfig.provider === 'vertexExpress'
      ? vertexAI({ 
          apiKey: process.env.GOOGLE_AI_API_KEY || '',
          location: modelConfig.location || 'global' 
        })
      : googleAI({ apiKey: process.env.GOOGLE_AI_API_KEY || '' }),
  ],
});

// Define the conversation processing flow
const processConversationFlow = ai.defineFlow(
  {
    name: 'processConversation',
    inputSchema: z.object({
      transcription: z.string().describe('The text input from the user'),
      currentState: z.any().describe('Current application state'),
      conversationHistory: z.array(z.any()).optional().describe('Previous conversation messages'),
    }),
    outputSchema: z.object({
      actions: z.array(
        z.object({
          action: z.string(),
          params: z.any(),
          returnId: z.string().optional(),
        })
      ),
      summary: z.string(),
      nextSteps: z.string().optional(),
    }),
  },
  async (input) => {
    const { transcription, currentState, conversationHistory = [] } = input;

    // Build the system prompt
    const systemPrompt = buildSystemPrompt(currentState, conversationHistory);

    // Build conversation context
    const conversationContext = conversationHistory.slice(-4).map((msg: any) => {
      if (msg.role === 'assistant') {
        return `Assistant: I updated: ${msg.updates?.join(', ') || 'acknowledged'}`;
      }
      return `User: ${msg.content}`;
    }).join('\n');

    const userPrompt = `Extract mortgage application information from this spoken input:\n\n"${transcription}"`;

    const fullPrompt = `${systemPrompt}\n\n${
      conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''
    }${userPrompt}`;

    console.log('Processing conversation:', {
      provider: modelConfig.provider,
      model: modelConfig.model,
      transcriptionLength: transcription.length,
      hasHistory: conversationHistory.length > 0,
    });

    // Get the model based on provider
    const model = (modelConfig.provider === 'vertex' || modelConfig.provider === 'vertexExpress')
      ? vertexAI.model(modelConfig.model)
      : googleAI.model(modelConfig.model);

    // Generate response
    const response = await ai.generate({
      model,
      prompt: fullPrompt,
      config: {
        temperature: modelConfig.temperature || 0.3,
        maxOutputTokens: modelConfig.maxOutputTokens || 4000,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    console.log('Received response from AI');

    // Parse JSON response
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response:', text);
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    return {
      actions: parsedResult.actions || [],
      summary: parsedResult.summary || 'Information extracted',
      nextSteps: parsedResult.nextSteps || '',
    };
  }
);

// Export as callable Cloud Function
export const processConversation = onCallGenkit(
  {
    secrets: [apiKey],
    cors: true,
    maxInstances: 10,
  },
  processConversationFlow
);

