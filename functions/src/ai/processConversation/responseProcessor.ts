/**
 * Process actions after AI generation
 */

import { resolveAddressesInActions } from '../actions/address';
import { filterDuplicateActions } from '../actions/duplicates';
import { validateActions } from '../actions/validation';

/**
 * Process actions: resolve addresses, filter duplicates, validate
 */
export async function processActions(actions: any[], currentState: any): Promise<{
  actions: any[];
  validationErrors?: Array<{ action: string; errors: string[]; warnings: string[] }>;
}> {
  // Server-side processing: resolve addresses
  console.log('Resolving addresses in actions...');
  let processedActions = await resolveAddressesInActions(actions);

  // Server-side processing: filter duplicates
  console.log('Filtering duplicate actions...');
  processedActions = filterDuplicateActions(processedActions, currentState);

  // Server-side processing: validate actions
  console.log('Validating actions...');
  const validationResult = validateActions(processedActions, currentState);
  
  const validationErrors = validationResult.invalidActions.length > 0
    ? validationResult.invalidActions.map(ia => ({
        action: ia.action.action,
        errors: ia.errors,
        warnings: ia.warnings
      }))
    : undefined;

  if (validationResult.invalidActions.length > 0) {
    console.warn('Some actions were invalid and removed:', validationResult.invalidActions);
  }

  return {
    actions: validationResult.validActions,
    validationErrors
  };
}

