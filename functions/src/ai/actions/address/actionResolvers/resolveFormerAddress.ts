/**
 * Resolve address in addFormerAddress action
 */

import { resolveAddress } from '../resolveAddress';

export async function resolveFormerAddressAction(action: any): Promise<any> {
  if (action.action !== 'addFormerAddress' || !action.params?.address?.addr) {
    return action;
  }
  
  const addrData = action.params.address.addr;
  
  if (addrData.address1 && !addrData.formattedAddress) {
    const addressString = `${addrData.address1}${addrData.city ? ', ' + addrData.city : ''}`;
    
    try {
      const resolvedAddr = await resolveAddress(addressString);
      
      if (resolvedAddr) {
        return {
          ...action,
          params: {
            ...action.params,
            address: {
              ...action.params.address,
              addr: resolvedAddr
            }
          }
        };
      }
    } catch (err) {
      console.error('Former address resolution failed:', err);
    }
  }
  
  return action;
}


