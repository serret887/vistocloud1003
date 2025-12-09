/**
 * Genkit tool for action validation
 */

import { z } from 'genkit';
import { validateAction } from '../actions/validation';

/**
 * Define action validation tool for Genkit
 * This allows the LLM to validate actions before returning them
 */
export function createValidationTool(ai: any, currentState: any) {
  return ai.defineTool(
    {
      name: 'validateAction',
      description: 'Validate an action before executing it. Use this to check if action parameters are valid (e.g., phone numbers, emails, dates, amounts). Returns validation errors and warnings.',
      inputSchema: z.object({
        action: z.object({
          action: z.string().describe('The action type (e.g., "addClient", "updateClientData")'),
          params: z.any().describe('The action parameters'),
          returnId: z.string().optional().describe('Optional return ID for referencing'),
        }),
      }),
      outputSchema: z.object({
        valid: z.boolean().describe('Whether the action is valid'),
        errors: z.array(z.string()).describe('List of validation errors'),
        warnings: z.array(z.string()).describe('List of validation warnings'),
      }),
    },
    async (input) => {
      const result = validateAction(input.action, currentState);
      return {
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
      };
    }
  );
}

