/**
 * Filter out duplicate actions to prevent creating duplicate records
 */

import type { LLMAction, ApplicationState } from './types';
import { checkEmploymentDuplicates } from './employmentDuplicates';
import { checkAssetDuplicates } from './assetDuplicates';
import { checkIncomeDuplicates } from './incomeDuplicates';

/**
 * Filter out duplicate actions to prevent creating duplicate records
 */
export function filterDuplicateActions(
  actions: LLMAction[],
  currentState: ApplicationState
): LLMAction[] {
  const filteredActions: LLMAction[] = [];
  const skipIndices = new Set<number>();
  const processedRecords = new Set<string>();
  
  for (let i = 0; i < actions.length; i++) {
    if (skipIndices.has(i)) {
      continue;
    }
    
    const action = actions[i];
    
    // Check for duplicate employment records
    const employmentCheck = checkEmploymentDuplicates(
      action, actions, currentState, processedRecords, skipIndices
    );
    if (!employmentCheck.shouldInclude) {
      if (employmentCheck.newAction) {
        filteredActions.push(employmentCheck.newAction);
      }
      if (employmentCheck.skipIndex !== undefined) {
        skipIndices.add(employmentCheck.skipIndex);
      }
      continue;
    }
    
    // Check for duplicate asset records
    const assetCheck = checkAssetDuplicates(
      action, actions, currentState, processedRecords, skipIndices
    );
    if (!assetCheck.shouldInclude) {
      if (assetCheck.newAction) {
        filteredActions.push(assetCheck.newAction);
      }
      if (assetCheck.skipIndex !== undefined) {
        skipIndices.add(assetCheck.skipIndex);
      }
      continue;
    }
    
    // Check for duplicate income records
    const incomeCheck = checkIncomeDuplicates(
      action, actions, currentState, processedRecords, skipIndices
    );
    if (!incomeCheck.shouldInclude) {
      if (incomeCheck.newAction) {
        filteredActions.push(incomeCheck.newAction);
      }
      if (incomeCheck.skipIndex !== undefined) {
        skipIndices.add(incomeCheck.skipIndex);
      }
      continue;
    }
    
    // Include action if no duplicates found
    filteredActions.push(action);
  }
  
  return filteredActions;
}

