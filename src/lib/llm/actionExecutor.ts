import type { LLMAction, VoiceUpdate } from '@/types/voice-assistant'
import type { DynamicIdMap } from './types'
import { useApplicationStore } from '@/stores/applicationStore'
import { validateClientData } from '@/lib/dataValidator'

/**
 * Execute store actions and return update information
 */
export function executeStoreAction(action: LLMAction, store: any, dynamicIdMap: DynamicIdMap): VoiceUpdate | null {
  try {
    switch (action.action) {
      case 'addClient': {
        const newClientId = store.addClient()
        // Store the mapping for dynamic ID resolution
        if (action.returnId) {
          dynamicIdMap.set(action.returnId, newClientId)
        }
        
        // If client data is provided, update the client immediately
        if (action.params && Object.keys(action.params).length > 0) {
          store.updateClientData(newClientId, action.params)
        }
        
        return {
          description: 'Added new client',
          field: 'client',
          timestamp: new Date().toISOString(),
          updates: action.params,
          clientName: action.params.firstName && action.params.lastName
            ? `${action.params.firstName} ${action.params.lastName}`
            : action.params.firstName || action.params.lastName || 'Client',
          type: 'client'
        }
      }
      
      case 'updateClientData': {
        // Resolve dynamic IDs
        let clientId = action.params.id
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        // Validate the data before updating to check for invalid fields
        const validationResult = validateClientData(action.params.updates)
        
        // Update the store (it will only store valid fields)
        store.updateClientData(clientId, action.params.updates)
        
        // Get the updated client data from the store after the update
        const clientData = store.clients[clientId]
        const clientName = clientData?.firstName && clientData?.lastName
          ? `${clientData.firstName} ${clientData.lastName}`
          : clientData?.firstName || clientData?.lastName || 'Client'
        
        // Build description and updates based on validation results
        let description = `Updated ${clientName}`
        const updates: any = { ...validationResult.data }
        
        // Add validation errors as notes in the description
        if (validationResult.errors.length > 0) {
          const errorFields = validationResult.errors.map(error => {
            if (error.includes('SSN')) return 'SSN'
            if (error.includes('phone')) return 'phone'
            if (error.includes('email')) return 'email'
            return 'data'
          }).join(', ')
          description += ` (${errorFields} not updated due to invalid format)`
        }
        
        return {
          description,
          field: 'client',
          timestamp: new Date().toISOString(),
          clientName,
          updates,
          type: 'client'
        }
      }
      
      case 'addEmploymentRecord': {
        // Resolve dynamic client IDs
        let clientId = action.params.clientId
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        const empId = store.addEmploymentRecord(clientId)
        // Store the mapping for dynamic ID resolution
        if (action.returnId) {
          dynamicIdMap.set(action.returnId, empId)
        }
        
        const clientData = store.clients[clientId]
        const clientName = clientData?.firstName && clientData?.lastName
          ? `${clientData.firstName} ${clientData.lastName}`
          : 'Client'
        
        return {
          description: `Added employment record for ${clientName}`,
          field: 'employment',
          timestamp: new Date().toISOString(),
          clientName,
          updates: action.params.updates,
          type: 'employment'
        }
      }
      
      case 'updateEmploymentRecord': {
        // Resolve dynamic client IDs
        let clientId = action.params.clientId
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        let recordId = action.params.recordId
        // Handle dynamic ID references like '$emp1'
        if (recordId.startsWith('$')) {
          recordId = dynamicIdMap.get(recordId) || recordId
          // Fallback: get the last employment record
          if (!dynamicIdMap.has(action.params.recordId)) {
            const records = store.getEmploymentRecords(clientId)
            if (records.length > 0) {
              recordId = records[records.length - 1].id
            }
          }
        }
        console.log('🔧 Updating employment record:', { clientId, recordId, updates: action.params.updates })
        store.updateEmploymentRecord(clientId, recordId, action.params.updates)
        
        // Debug: Check if the update was successful
        const updatedRecord = store.getEmploymentRecords(clientId).find((emp: any) => emp.id === recordId)
        console.log('🔍 Updated employment record:', updatedRecord)
        
        const clientData = store.clients[clientId]
        const clientName = clientData?.firstName && clientData?.lastName
          ? `${clientData.firstName} ${clientData.lastName}`
          : 'Client'
        
        return {
          description: `Updated employment for ${clientName}`,
          field: 'employment',
          timestamp: new Date().toISOString(),
          clientName,
          updates: action.params.updates,
          type: 'employment'
        }
      }
      
      case 'addActiveIncome': {
        // Resolve dynamic client IDs
        let clientId = action.params.clientId
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        const incomeId = store.addActiveIncome(clientId)
        // Store the mapping for dynamic ID resolution
        if (action.returnId) {
          dynamicIdMap.set(action.returnId, incomeId)
        }
        
        const clientData = store.clients[clientId]
        const clientName = clientData?.firstName && clientData?.lastName
          ? `${clientData.firstName} ${clientData.lastName}`
          : 'Client'
        
        return {
          description: `Added income record for ${clientName}`,
          field: 'income',
          timestamp: new Date().toISOString(),
          clientName,
          updates: action.params,
          type: 'income'
        }
      }
      
      case 'updateActiveIncome': {
        // Resolve dynamic client IDs
        let clientId = action.params.clientId
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        let recordId = action.params.recordId
        // Handle dynamic ID references like '$inc1'
        if (recordId.startsWith('$')) {
          recordId = dynamicIdMap.get(recordId) || recordId
          // Fallback: get the last income record
          if (!dynamicIdMap.has(action.params.recordId)) {
            const records = store.getActiveIncomeRecords(clientId)
            if (records.length > 0) {
              recordId = records[records.length - 1].id
            }
          }
        }
        
        // Resolve employment record ID if it's a dynamic reference
        if (action.params.updates.employmentRecordId?.startsWith('$')) {
          action.params.updates.employmentRecordId = dynamicIdMap.get(action.params.updates.employmentRecordId) || action.params.updates.employmentRecordId
        }
        
        store.updateActiveIncome(clientId, recordId, action.params.updates)
        
        const clientData = store.clients[clientId]
        const clientName = clientData?.firstName && clientData?.lastName
          ? `${clientData.firstName} ${clientData.lastName}`
          : 'Client'
        
        return {
          description: `Updated income for ${clientName}`,
          field: 'income',
          timestamp: new Date().toISOString(),
          clientName,
          updates: action.params.updates,
          type: 'income'
        }
      }
      
      case 'addRealEstateRecord': {
        store.addRealEstateRecord(action.params.clientId)
        return {
          description: 'Added new real estate property',
          field: 'real-estate',
          timestamp: new Date().toISOString()
        }
      }
      
      case 'updateRealEstateRecord': {
        store.updateRealEstateRecord(
          action.params.clientId, 
          action.params.recordId, 
          action.params.updates
        )
        const fields = Object.keys(action.params.updates).join(', ')
        return {
          description: `Updated property: ${fields}`,
          field: fields,
          timestamp: new Date().toISOString(),
          updates: action.params.updates
        }
      }
      
      case 'addAsset': {
        // Resolve dynamic client IDs
        let clientId = action.params.clientId
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        const assetId = store.addAsset(clientId)
        // Store the mapping for dynamic ID resolution
        if (action.returnId) {
          dynamicIdMap.set(action.returnId, assetId)
        }
        
        const clientData = store.clients[clientId]
        const clientName = clientData?.firstName && clientData?.lastName
          ? `${clientData.firstName} ${clientData.lastName}`
          : 'Client'
        
        return {
          description: `Added asset for ${clientName}`,
          field: 'assets',
          timestamp: new Date().toISOString(),
          clientName,
          updates: action.params,
          type: 'asset'
        }
      }
      
      case 'updateAsset': {
        // Resolve dynamic client IDs
        let clientId = action.params.clientId
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        let recordId = action.params.recordId
        // Handle dynamic ID references
        if (recordId.startsWith('$')) {
          recordId = dynamicIdMap.get(recordId) || recordId
          // Fallback: get the last asset
          if (!dynamicIdMap.has(action.params.recordId)) {
            const assets = store.assetsData[clientId] || []
            if (assets.length > 0) {
              recordId = assets[assets.length - 1].id
            }
          }
        }
        store.updateAsset(clientId, recordId, action.params.updates)
        
        const clientData = store.clients[clientId]
        const clientName = clientData?.firstName && clientData?.lastName
          ? `${clientData.firstName} ${clientData.lastName}`
          : 'Client'
        
        return {
          description: `Updated asset for ${clientName}`,
          field: 'assets',
          timestamp: new Date().toISOString(),
          clientName,
          updates: action.params.updates,
          type: 'asset'
        }
      }
      
      case 'updateAddressData': {
        // Resolve dynamic client IDs
        let clientId = action.params.clientId
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        // Get current address data to preserve existing structure
        const currentAddressData = store.getAddressData(clientId)
        
        // Ensure we have a proper present address structure
        const presentAddress = currentAddressData.present || {
          id: 'present',
          fromDate: '',
          toDate: '',
          addr: {
            address1: '',
            address2: '',
            formattedAddress: '',
            city: '',
            region: '',
            postalCode: '',
            country: '',
            lat: 0,
            lng: 0
          },
          isPresent: true
        }
        
        // Merge the new address data with the existing structure
        const updatedAddressData = {
          ...currentAddressData,
          present: {
            ...presentAddress,
            addr: action.params.data.addr,
            // Only update fromDate if it's explicitly provided and not empty
            fromDate: action.params.data.fromDate && action.params.data.fromDate.trim() !== '' 
              ? action.params.data.fromDate 
              : presentAddress.fromDate,
            // Only update toDate if it's explicitly provided and not empty
            toDate: action.params.data.toDate && action.params.data.toDate.trim() !== '' 
              ? action.params.data.toDate 
              : presentAddress.toDate
          },
          former: currentAddressData.former || []
        }
        
        store.updateAddressData(clientId, updatedAddressData)
        
        const clientData = store.clients[clientId]
        const clientName = clientData?.firstName && clientData?.lastName
          ? `${clientData.firstName} ${clientData.lastName}`
          : 'Client'
        
        return {
          description: `Updated address for ${clientName}`,
          field: 'address',
          timestamp: new Date().toISOString(),
          clientName,
          updates: { address: action.params.data.addr?.formattedAddress || action.params.data.addr?.address1 || '' },
          type: 'address'
        }
      }
      
      case 'addFormerAddress': {
        // Resolve dynamic client IDs
        let clientId = action.params.clientId
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        store.addFormerAddress(clientId, action.params.address)
        
        const clientData = store.clients[clientId]
        const clientName = clientData?.firstName && clientData?.lastName
          ? `${clientData.firstName} ${clientData.lastName}`
          : 'Client'
        
        return {
          description: `Added former address for ${clientName}`,
          field: 'address',
          timestamp: new Date().toISOString(),
          clientName,
          updates: { address: action.params.address.addr?.formattedAddress || action.params.address.addr?.address1 || '' },
          type: 'address'
        }
      }
      
      case 'setSharedOwners': {
        // Resolve dynamic client IDs
        let clientId = action.params.clientId
        if (clientId.startsWith('$')) {
          clientId = dynamicIdMap.get(clientId) || clientId
        }
        
        let assetId = action.params.assetId
        if (assetId.startsWith('$')) {
          assetId = dynamicIdMap.get(assetId) || assetId
        }
        
        // Resolve shared client IDs
        const sharedClientIds = (action.params.sharedClientIds || []).map((id: string) => {
          if (id.startsWith('$')) {
            return dynamicIdMap.get(id) || id
          }
          return id
        })
        
        store.setSharedOwners(clientId, assetId, sharedClientIds)
        return {
          description: `Marked asset as joint/shared ownership`,
          field: 'assets',
          timestamp: new Date().toISOString()
        }
      }
      
      default:
        console.warn('Unknown action:', action.action)
        return null
    }
  } catch (err) {
    console.error('Error executing action:', action, err)
    return null
  }
}
