/**
 * Handle duplicate asset record detection
 */

import type { LLMAction, ApplicationState } from './types';

export function checkAssetDuplicates(
  action: LLMAction,
  actions: LLMAction[],
  currentState: ApplicationState,
  processedRecords: Set<string>,
  skipIndices: Set<number>
): { shouldInclude: boolean; newAction?: LLMAction; skipIndex?: number } {
  if (action.action !== 'addAsset') {
    return { shouldInclude: true };
  }
  
  try {
    const clientId = action.params?.clientId;
    if (!clientId) {
      return { shouldInclude: true };
    }
    
    const existingAssets = currentState.assetsData?.[clientId] || [];
    const returnId = action.returnId;
    const updateActionIndex = actions.findIndex(a => 
      a.action === 'updateAsset' && 
      a.params?.recordId === `$${returnId}`
    );
    
    if (updateActionIndex !== -1) {
      const updateAction = actions[updateActionIndex];
      if (updateAction.params?.updates?.amount !== undefined && updateAction.params?.updates?.category) {
        const amount = updateAction.params.updates.amount;
        const category = updateAction.params.updates.category;
        
        const existingAsset = existingAssets.find((asset: any) => 
          Math.abs(asset.amount - amount) < 1 &&
          asset.category === category
        );
        
        if (existingAsset) {
          const recordKey = `asset-${clientId}-${category}-${amount}`;
          
          if (!processedRecords.has(recordKey)) {
            const newUpdateAction: LLMAction = {
              action: 'updateAsset',
              params: {
                clientId: clientId,
                recordId: existingAsset.id,
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
    console.warn('Error checking asset duplicates:', error);
  }
  
  return { shouldInclude: true };
}


