/**
 * Handle duplicate employment record detection
 */

import type { LLMAction, ApplicationState } from './types';

export function checkEmploymentDuplicates(
  action: LLMAction,
  actions: LLMAction[],
  currentState: ApplicationState,
  processedRecords: Set<string>,
  skipIndices: Set<number>
): { shouldInclude: boolean; newAction?: LLMAction; skipIndex?: number } {
  if (action.action !== 'addEmploymentRecord') {
    return { shouldInclude: true };
  }
  
  try {
    const clientId = action.params?.clientId;
    if (!clientId) {
      return { shouldInclude: true };
    }
    
    const existingRecords = currentState.employmentData?.[clientId] || [];
    const returnId = action.returnId;
    const updateActionIndex = actions.findIndex(a => 
      a.action === 'updateEmploymentRecord' && 
      a.params?.recordId === `$${returnId}`
    );
    
    if (updateActionIndex !== -1) {
      const updateAction = actions[updateActionIndex];
      if (updateAction.params?.updates?.employerName) {
        const employerName = updateAction.params.updates.employerName.toLowerCase();
        
        const existingEmployment = existingRecords.find((emp: any) => 
          emp.employerName?.toLowerCase() === employerName
        );
        
        if (existingEmployment) {
          const recordKey = `emp-${clientId}-${employerName}`;
          
          if (!processedRecords.has(recordKey)) {
            const newUpdateAction: LLMAction = {
              action: 'updateEmploymentRecord',
              params: {
                clientId: clientId,
                recordId: existingEmployment.id,
                updates: updateAction.params.updates
              }
            };
            processedRecords.add(recordKey);
            return { shouldInclude: false, newAction: newUpdateAction, skipIndex: updateActionIndex };
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error checking employment duplicates:', error);
  }
  
  return { shouldInclude: true };
}

