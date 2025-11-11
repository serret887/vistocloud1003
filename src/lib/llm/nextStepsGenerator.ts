import type { LLMApplicationState } from './types'

/**
 * Check if a client has a complete name (both first and last name)
 */
function hasCompleteName(client: any): boolean {
  if (!client) return false
  const firstName = client.firstName?.trim() || ''
  const lastName = client.lastName?.trim() || ''
  return firstName !== '' && lastName !== ''
}

/**
 * Generate default next steps based on missing information in the application state
 */
export function generateDefaultNextSteps(state: LLMApplicationState): string {
  const missingByClient: { [clientId: string]: string[] } = {}
  const clientNames: { [clientId: string]: string } = {}
  const clientsWithoutNames: string[] = []
  
  // Get names for all clients and identify clients without complete names
  Object.entries(state.clients).forEach(([id, client]: [string, any]) => {
    if (!client) {
      clientNames[id] = `Client ${id}`
      clientsWithoutNames.push(id)
      return
    }
    
    const firstName = client.firstName?.trim() || ''
    const lastName = client.lastName?.trim() || ''
    
    if (firstName && lastName) {
      clientNames[id] = `${firstName} ${lastName}`
    } else if (firstName) {
      clientNames[id] = firstName
      clientsWithoutNames.push(id)
    } else if (lastName) {
      clientNames[id] = lastName
      clientsWithoutNames.push(id)
    } else {
      clientNames[id] = `Client ${id}`
      clientsWithoutNames.push(id)
    }
  })
  
  
  // Analyze each client - only generate detailed suggestions for clients with complete names
  Object.keys(state.clients).forEach(clientId => {
    const client = state.clients[clientId]
    
    // Skip if client is null/undefined or doesn't have a complete name
    if (!client || !hasCompleteName(client)) {
      return
    }
    
    const missing: string[] = []
    
    // Basic info - check for empty strings and whitespace
    if (!client.email || client.email.trim() === '') missing.push('email')
    if (!client.phone || client.phone.trim() === '') missing.push('phone')
    if (!client.ssn || client.ssn.trim() === '') missing.push('SSN')
    if (!client.dob || client.dob.trim() === '') missing.push('date of birth')
    if (!client.citizenship || client.citizenship.trim() === '') missing.push('citizenship')
    if (!client.maritalStatus || client.maritalStatus.trim() === '') missing.push('marital status')
    
    // Employment
    if (!state.employmentData[clientId]?.records?.length) {
      missing.push('employment details')
    }
    
    // Income
    if (!state.incomeData.active[clientId]?.length) {
      missing.push('income information')
    }
    
    // Address
    if (!state.addressData[clientId]?.present?.addr?.address1) {
      missing.push('current address')
    }
    
    // Assets
    if (!state.assetsData[clientId]?.length) {
      missing.push('assets')
    }
    
    if (missing.length > 0) {
      missingByClient[clientId] = missing
    }
  })
  
  // Build the response
  const responseParts: string[] = []
  
  // Add summary for clients without names
  if (clientsWithoutNames.length > 0) {
    const count = clientsWithoutNames.length
    const message = count === 1 
      ? 'You have 1 client that needs to be named'
      : `You have ${count} clients that need to be named`
    responseParts.push(message)
  }
  
  // Add detailed suggestions for clients with names
  if (Object.keys(missingByClient).length > 0) {
    const nextSteps = Object.entries(missingByClient).map(([id, items]) => 
      `For ${clientNames[id]}: ${items.join(', ')}`
    ).join('\n')
    responseParts.push(`Please provide the following:\n${nextSteps}`)
  }
  
  // If no missing information
  if (responseParts.length === 0) {
    return 'All required information seems complete for all clients. Anything else to add?'
  }
  
  return responseParts.join('\n\n')
}
