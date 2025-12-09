/**
 * Handle duplicate income record detection
 */

import type { LLMAction, ApplicationState } from './types';

export function checkIncomeDuplicates(
  action: LLMAction,
  actions: LLMAction[],
  currentState: ApplicationState,
  processedRecords: Set<string>,
  skipIndices: Set<number>
): { shouldInclude: boolean; newAction?: LLMAction; skipIndex?: number } {
  if (action.action !== 'addActiveIncome') {
    return { shouldInclude: true };
  }
  
  try {
    const clientId = action.params?.clientId;
    if (!clientId) {
      return { shouldInclude: true };
    }
    
    const existingIncomes = currentState.incomeData?.active?.[clientId] || [];
    const returnId = action.returnId;
    const updateActionIndex = actions.findIndex(a => 
      a.action === 'updateActiveIncome' && 
      a.params?.recordId === `$${returnId}`
    );
    
    if (updateActionIndex !== -1) {
      const updateAction = actions[updateActionIndex];
      if (updateAction.params?.updates?.companyName && updateAction.params.updates.monthlyAmount !== undefined) {
        const companyName = updateAction.params.updates.companyName.toLowerCase();
        const monthlyAmount = updateAction.params.updates.monthlyAmount;
        
        const existingIncome = existingIncomes.find((income: any) => 
          income.companyName?.toLowerCase() === companyName &&
          Math.abs(income.monthlyAmount - monthlyAmount) < 1
        );
        
        if (existingIncome) {
          const recordKey = `income-${clientId}-${companyName}-${monthlyAmount}`;
          
          if (!processedRecords.has(recordKey)) {
            const newUpdateAction: LLMAction = {
              action: 'updateActiveIncome',
              params: {
                clientId: clientId,
                recordId: existingIncome.id,
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
    console.warn('Error checking income duplicates:', error);
  }
  
  return { shouldInclude: true };
}

