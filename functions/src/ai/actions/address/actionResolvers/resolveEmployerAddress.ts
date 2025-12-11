/**
 * Resolve employer address in updateEmploymentRecord action
 */

import { resolveAddress } from '../resolveAddress';

export async function resolveEmployerAddressAction(action: any): Promise<any> {
  if (action.action !== 'updateEmploymentRecord' || !action.params?.updates?.employerAddress) {
    return action;
  }
  
  const employerAddr = action.params.updates.employerAddress;
  
  if (employerAddr.address1 && !employerAddr.formattedAddress) {
    const addressString = `${employerAddr.address1}${employerAddr.city ? ', ' + employerAddr.city : ''}`;
    
    try {
      const resolvedAddr = await resolveAddress(addressString);
      
      if (resolvedAddr) {
        return {
          ...action,
          params: {
            ...action.params,
            updates: {
              ...action.params.updates,
              employerAddress: resolvedAddr
            }
          }
        };
      }
    } catch (err) {
      console.error('Employer address resolution failed:', err);
    }
  }
  
  return action;
}


