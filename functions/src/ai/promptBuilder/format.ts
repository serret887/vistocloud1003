/**
 * Return format example for system prompt
 */

export function getReturnFormat(currentState: any): string {
  return `Return format:
{
  "actions": [
    {"action": "addClient", "returnId": "$c2"},
    {"action": "updateClientData", "params": {"id": "${currentState.activeClientId}", "updates": {"firstName": "Rolando", "lastName": "Torres"}}},
    {"action": "updateClientData", "params": {"id": "$c2", "updates": {"firstName": "Helen", "lastName": "Diaz"}}},
    {"action": "addEmploymentRecord", "params": {"clientId": "${currentState.activeClientId}"}, "returnId": "$emp1"},
    {"action": "updateEmploymentRecord", "params": {"clientId": "${currentState.activeClientId}", "recordId": "$emp1", "updates": {"employerName": "ABC Corp", "jobTitle": "Manager", "grossMonthlyIncome": 5000}}},
    {"action": "addActiveIncome", "params": {"clientId": "${currentState.activeClientId}"}, "returnId": "$inc1"},
    {"action": "updateActiveIncome", "params": {"clientId": "${currentState.activeClientId}", "recordId": "$inc1", "updates": {"employmentRecordId": "$emp1", "companyName": "ABC Corp", "position": "Manager", "monthlyAmount": 5000}}},
    {"action": "addAsset", "params": {"clientId": "${currentState.activeClientId}"}, "returnId": "$asset1"},
    {"action": "updateAsset", "params": {"clientId": "${currentState.activeClientId}", "recordId": "$asset1", "updates": {"category": "banking", "type": "checking", "amount": 300000}}},
    {"action": "setSharedOwners", "params": {"clientId": "${currentState.activeClientId}", "assetId": "$asset1", "sharedClientIds": ["$c2"]}},
    {"action": "updateAddressData", "params": {"clientId": "${currentState.activeClientId}", "data": {"addr": {"address1": "123 Main St", "city": "Anytown"}}}}
  ],
  "summary": "Brief description of what was extracted",
  "nextSteps": "Specific guidance on what information is still needed (e.g., 'Need employer names and employment dates', 'Need property details if they own real estate')"
}`;
}


