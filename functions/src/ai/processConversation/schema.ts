/**
 * Schema definitions for processConversation flow
 */

import { z } from 'genkit';

export const inputSchema = z.object({
  transcription: z.string().describe('The text input from the user'),
  currentState: z.any().describe('Current application state'),
  conversationHistory: z.array(z.any()).optional().describe('Previous conversation messages'),
  locale: z.string().optional().describe('Current locale (en or es)'),
});

export const outputSchema = z.object({
  actions: z.array(
    z.object({
      action: z.string(),
      params: z.any(),
      returnId: z.string().optional(),
    })
  ),
  summary: z.string(),
  nextSteps: z.string().optional(),
  validationErrors: z.array(
    z.object({
      action: z.string(),
      errors: z.array(z.string()),
      warnings: z.array(z.string()),
    })
  ).optional(),
});


