/**
 * Validate all actions in a batch
 */

import { validateAction } from './validateAction';

/**
 * Validate all actions in a batch
 */
export function validateActions(actions: any[], currentState: any): {
  validActions: any[];
  invalidActions: Array<{ action: any; errors: string[]; warnings: string[] }>;
} {
  const validActions: any[] = [];
  const invalidActions: Array<{ action: any; errors: string[]; warnings: string[] }> = [];
  
  for (const action of actions) {
    const validation = validateAction(action, currentState);
    
    if (validation.valid) {
      validActions.push(action);
      if (validation.warnings.length > 0) {
        console.warn(`Warnings for action ${action.action}:`, validation.warnings);
      }
    } else {
      invalidActions.push({
        action,
        errors: validation.errors,
        warnings: validation.warnings
      });
      console.error(`Invalid action ${action.action}:`, validation.errors);
    }
  }
  
  return { validActions, invalidActions };
}

