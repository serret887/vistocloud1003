import { resolveAddress } from '$lib/addressResolver'
import type { LLMAction } from '$lib/types/voice-assistant'

/**
 * Resolve addresses in LLM actions using Google Places API
 */
export async function resolveAddressesInActions(actions: LLMAction[]): Promise<LLMAction[]> {
  const resolvedActions = [...actions]
  
  for (let i = 0; i < resolvedActions.length; i++) {
    const action = resolvedActions[i]
    
    // Handle updateAddressData actions
    if (action.action === 'updateAddressData' && action.params?.data?.addr) {
      const addrData = action.params.data.addr
      console.log('🏠 Processing address data:', addrData)
      
      // Check if we have a basic address string that needs resolution
      if (addrData.address1 && !addrData.formattedAddress) {
        // Try to resolve the full address
        const addressString = `${addrData.address1}${addrData.city ? ', ' + addrData.city : ''}`
        console.log('🔍 Attempting to resolve address:', addressString)
        
        try {
          const resolvedAddr = await resolveAddress(addressString)
          console.log('✅ Resolved address:', resolvedAddr)
          
          if (resolvedAddr) {
            // Replace with resolved address
            resolvedActions[i] = {
              ...action,
              params: {
                ...action.params,
                data: {
                  ...action.params.data,
                  addr: resolvedAddr
                }
              }
            }
          } else {
            console.warn('⚠️ Address resolution returned null')
          }
        } catch (err) {
          console.error('❌ Address resolution failed:', err)
        }
      } else if (addrData.formattedAddress) {
        console.log('✓ Address already has formattedAddress, skipping resolution')
      }
    }
    
    // Handle updateEmploymentRecord actions with employerAddress
    if (action.action === 'updateEmploymentRecord' && action.params?.updates?.employerAddress) {
      const addrData = action.params.updates.employerAddress
      console.log('🏢 Processing employer address data:', addrData)
      
      // Check if we have a basic address string that needs resolution
      if (addrData.address1 && !addrData.formattedAddress) {
        // Try to resolve the full address
        const addressString = `${addrData.address1}${addrData.city ? ', ' + addrData.city : ''}`
        console.log('🔍 Attempting to resolve employer address:', addressString)
        
        try {
          const resolvedAddr = await resolveAddress(addressString)
          console.log('✅ Resolved employer address:', resolvedAddr)
          
          if (resolvedAddr) {
            // Replace with resolved address
            resolvedActions[i] = {
              ...action,
              params: {
                ...action.params,
                updates: {
                  ...action.params.updates,
                  employerAddress: resolvedAddr
                }
              }
            }
          } else {
            console.warn('⚠️ Employer address resolution returned null')
          }
        } catch (err) {
          console.error('❌ Employer address resolution failed:', err)
        }
      } else if (addrData.formattedAddress) {
        console.log('✓ Employer address already has formattedAddress, skipping resolution')
      }
    }
    
    // Handle addFormerAddress actions
    if (action.action === 'addFormerAddress' && action.params?.address?.addr) {
      const addrData = action.params.address.addr
      console.log('🏠 Processing former address data:', addrData)
      
      // Check if we have a basic address string that needs resolution
      if (addrData.address1 && !addrData.formattedAddress) {
        // Try to resolve the full address
        const addressString = `${addrData.address1}${addrData.address2 ? ', ' + addrData.address2 : ''}${addrData.city ? ', ' + addrData.city : ''}`
        console.log('🔍 Attempting to resolve former address:', addressString)
        
        try {
          const resolvedAddr = await resolveAddress(addressString)
          console.log('✅ Resolved former address:', resolvedAddr)
          
          if (resolvedAddr) {
            // Replace with resolved address
            resolvedActions[i] = {
              ...action,
              params: {
                ...action.params,
                address: {
                  ...action.params.address,
                  addr: resolvedAddr
                }
              }
            }
          } else {
            console.warn('⚠️ Former address resolution returned null')
          }
        } catch (err) {
          console.error('❌ Former address resolution failed:', err)
        }
      } else if (addrData.formattedAddress) {
        console.log('✓ Former address already has formattedAddress, skipping resolution')
      }
    }
  }
  
  return resolvedActions
}
