/**
 * Flow handler for processConversation
 */

import { vertexAI, googleAI } from '@genkit-ai/google-genai';
import { ai, modelConfig } from './config';
import { buildFullPrompt } from './promptBuilder';
import { parseAIResponse } from './responseParser';
import { processActions } from './responseProcessor';
import { createAddressResolutionTool } from '../tools/addressTool';
import { createValidationTool } from '../tools/validationTool';

export async function handleProcessConversation(input: {
  transcription: string;
  currentState: any;
  conversationHistory?: any[];
  locale?: string;
}) {
  const { transcription, currentState, conversationHistory = [], locale = 'en' } = input;

  const fullPrompt = buildFullPrompt(transcription, currentState, conversationHistory, locale);

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

  // Create tools for the LLM to use
  const addressTool = createAddressResolutionTool(ai);
  const validationTool = createValidationTool(ai, currentState);

  // Generate response with tools available
  const response = await ai.generate({
    model,
    prompt: fullPrompt,
    tools: [addressTool, validationTool],
    config: {
      temperature: modelConfig.temperature || 0.3,
      maxOutputTokens: modelConfig.maxOutputTokens || 4000,
      responseMimeType: 'application/json',
    },
  });

  console.log('Received response from AI');

  // Parse JSON response
  const parsedResult = parseAIResponse(response.text);
  const actions = parsedResult.actions || [];

  // Process actions: resolve addresses, filter duplicates, validate
  const { actions: processedActions, validationErrors } = await processActions(actions, currentState);

  // Update summary if there were validation issues
  let summary = parsedResult.summary || 'Information extracted';
  if (validationErrors && validationErrors.length > 0) {
    summary += ` (Note: ${validationErrors.length} invalid action(s) were removed)`;
  }

  return {
    actions: processedActions,
    summary,
    nextSteps: parsedResult.nextSteps || '',
    validationErrors,
  };
}


