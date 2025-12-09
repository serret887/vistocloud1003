/**
 * Resolve addresses in action parameters
 */

import {
  resolveAddressDataAction,
  resolveEmployerAddressAction,
  resolveFormerAddressAction
} from './actionResolvers';

/**
 * Resolve addresses in action parameters
 */
export async function resolveAddressesInActions(actions: any[]): Promise<any[]> {
  const resolvedActions = [...actions];
  
  for (let i = 0; i < resolvedActions.length; i++) {
    const action = resolvedActions[i];
    
    // Resolve address based on action type
    resolvedActions[i] = await resolveAddressDataAction(action);
    resolvedActions[i] = await resolveEmployerAddressAction(resolvedActions[i]);
    resolvedActions[i] = await resolveFormerAddressAction(resolvedActions[i]);
  }
  
  return resolvedActions;
}

