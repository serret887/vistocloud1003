/**
 * Resolve address in updateAddressData action
 */

import { resolveAddress } from '../resolveAddress';

export async function resolveAddressDataAction(action: any): Promise<any> {
  if (action.action !== 'updateAddressData' || !action.params?.data?.addr) {
    return action;
  }
  
  const addrData = action.params.data.addr;
  
  if (addrData.address1 && !addrData.formattedAddress) {
    const addressString = `${addrData.address1}${addrData.city ? ', ' + addrData.city : ''}`;
    
    try {
      const resolvedAddr = await resolveAddress(addressString);
      
      if (resolvedAddr) {
        return {
          ...action,
          params: {
            ...action.params,
            data: {
              ...action.params.data,
              addr: resolvedAddr
            }
          }
        };
      }
    } catch (err) {
      console.error('Address resolution failed:', err);
    }
  }
  
  return action;
}

