/**
 * Process Conversation Function
 * Processes text input and returns structured actions for updating the application
 */

import { onCallGenkit } from 'firebase-functions/https';
import { ai, apiKey } from './processConversation/config';
import { inputSchema, outputSchema } from './processConversation/schema';
import { handleProcessConversation } from './processConversation/flowHandler';

// Define the conversation processing flow
const processConversationFlow = ai.defineFlow(
  {
    name: 'processConversation',
    inputSchema,
    outputSchema,
  },
  handleProcessConversation
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

