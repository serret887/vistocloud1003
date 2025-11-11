import type { LLMAction } from '@/types/voice-assistant'

/**
 * Filter out duplicate actions to prevent creating duplicate records
 * This handles multiple scenarios:
 * 1. Multiple legitimate actions for different records
 * 2. Multiple updates to the same record (corrections)
 * 3. Converting add actions to update actions when duplicates exist
 */
export function filterDuplicateActions(actions: LLMAction[], store: any): LLMAction[] {
  const filteredActions: LLMAction[] = []
  const skipIndices = new Set<number>()
  
  // Track which records we've already created/updated to avoid true duplicates
  const processedRecords = new Set<string>()
  
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    let shouldInclude = true
    
    // Check for duplicate employment records
    if (action.action === 'addEmploymentRecord') {
      try {
        const clientId = action.params?.clientId
        if (!clientId) {
          // If no clientId, just include the action as-is
          if (shouldInclude && !skipIndices.has(i)) {
            filteredActions.push(action)
          }
          continue
        }
        
        const existingRecords = store.getEmploymentRecords?.(clientId) || []
        
        // Look for a subsequent updateEmploymentRecord action for the same returnId
        const returnId = action.returnId
        const updateActionIndex = actions.findIndex(a => 
          a.action === 'updateEmploymentRecord' && 
          a.params?.recordId === `$${returnId}`
        )
        
        if (updateActionIndex !== -1) {
          const updateAction = actions[updateActionIndex]
          if (updateAction.params?.updates?.employerName) {
            const employerName = updateAction.params.updates.employerName.toLowerCase()
            
            // Check if this employer already exists
            const existingEmployment = existingRecords.find((emp: any) => 
              emp.employerName?.toLowerCase() === employerName
            )
            
            if (existingEmployment) {
              // Create a unique key for this record
              const recordKey = `emp-${clientId}-${employerName}`
              
              // Only convert to update if we haven't already processed this record
              if (!processedRecords.has(recordKey)) {
                // Convert to update action instead of add
                const newUpdateAction = {
                  action: 'updateEmploymentRecord' as const,
                  params: {
                    clientId: clientId,
                    recordId: existingEmployment.id,
                    updates: updateAction.params.updates
                  }
                }
                filteredActions.push(newUpdateAction)
                processedRecords.add(recordKey)
                shouldInclude = false
                skipIndices.add(updateActionIndex) // Skip the original update action
              }
            }
          }
        }
      } catch (error) {
        // If there's an error, just include the action as-is
        console.warn('Error checking employment duplicates:', error)
      }
    }
    
    // Check for duplicate asset records
    if (action.action === 'addAsset') {
      try {
        const clientId = action.params?.clientId
        if (!clientId) {
          // If no clientId, just include the action as-is
          if (shouldInclude && !skipIndices.has(i)) {
            filteredActions.push(action)
          }
          continue
        }
        
        const existingAssets = store.getAssets?.(clientId) || []
        
        // Look for a subsequent updateAsset action for the same returnId
        const returnId = action.returnId
        const updateActionIndex = actions.findIndex(a => 
          a.action === 'updateAsset' && 
          a.params?.recordId === `$${returnId}`
        )
        
        if (updateActionIndex !== -1) {
          const updateAction = actions[updateActionIndex]
          if (updateAction.params?.updates?.amount !== undefined && updateAction.params?.updates?.category) {
            const amount = updateAction.params.updates.amount
            const category = updateAction.params.updates.category
            
            // Check if this amount and category already exists
            const existingAsset = existingAssets.find((asset: any) => 
              Math.abs(asset.amount - amount) < 1 &&
              asset.category === category
            )
            
            if (existingAsset) {
              // Create a unique key for this record
              const recordKey = `asset-${clientId}-${category}-${amount}`
              
              // Only convert to update if we haven't already processed this record
              if (!processedRecords.has(recordKey)) {
                // Convert to update action instead of add
                const newUpdateAction = {
                  action: 'updateAsset' as const,
                  params: {
                    clientId: clientId,
                    recordId: existingAsset.id,
                    updates: updateAction.params.updates
                  }
                }
                filteredActions.push(newUpdateAction)
                processedRecords.add(recordKey)
                shouldInclude = false
                skipIndices.add(updateActionIndex) // Skip the original update action
              }
            }
          }
        }
      } catch (error) {
        // If there's an error, just include the action as-is
        console.warn('Error checking asset duplicates:', error)
      }
    }
    
    // Check for duplicate income records
    if (action.action === 'addActiveIncome') {
      try {
        const clientId = action.params?.clientId
        if (!clientId) {
          // If no clientId, just include the action as-is
          if (shouldInclude && !skipIndices.has(i)) {
            filteredActions.push(action)
          }
          continue
        }
        
        const existingIncomes = store.getActiveIncomeRecords?.(clientId) || []
        
        // Look for a subsequent updateActiveIncome action for the same returnId
        const returnId = action.returnId
        const updateActionIndex = actions.findIndex(a => 
          a.action === 'updateActiveIncome' && 
          a.params?.recordId === `$${returnId}`
        )
        
        if (updateActionIndex !== -1) {
          const updateAction = actions[updateActionIndex]
          if (updateAction.params?.updates?.companyName && updateAction.params.updates.monthlyAmount !== undefined) {
            const companyName = updateAction.params.updates.companyName.toLowerCase()
            const monthlyAmount = updateAction.params.updates.monthlyAmount
            
            // Check if this company and amount already exists
            const existingIncome = existingIncomes.find((income: any) => 
              income.companyName?.toLowerCase() === companyName &&
              Math.abs(income.monthlyAmount - monthlyAmount) < 1
            )
            
            if (existingIncome) {
              // Create a unique key for this record
              const recordKey = `income-${clientId}-${companyName}-${monthlyAmount}`
              
              // Only convert to update if we haven't already processed this record
              if (!processedRecords.has(recordKey)) {
                // Convert to update action instead of add
                const newUpdateAction = {
                  action: 'updateActiveIncome' as const,
                  params: {
                    clientId: clientId,
                    recordId: existingIncome.id,
                    updates: updateAction.params.updates
                  }
                }
                filteredActions.push(newUpdateAction)
                processedRecords.add(recordKey)
                shouldInclude = false
                skipIndices.add(updateActionIndex) // Skip the original update action
              }
            }
          }
        }
      } catch (error) {
        // If there's an error, just include the action as-is
        console.warn('Error checking income duplicates:', error)
      }
    }
    
    if (shouldInclude && !skipIndices.has(i)) {
      filteredActions.push(action)
    }
  }
  
  return filteredActions
}
