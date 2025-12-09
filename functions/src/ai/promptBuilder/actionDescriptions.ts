/**
 * Action descriptions for system prompt
 */

export function getActionDescriptions(): string {
  return `Available Store Actions (Always create complete actions, including updates to link records like employmentRecordId):
1. addClient(params) - Creates new client, optionally with initial data. Use returnId to reference it (e.g., "returnId": "$c2", "params": {"firstName": "Kelly", "lastName": "Parrish"})
2. updateClientData(id, updates) - Updates: firstName, lastName, email, phone, ssn, dob, citizenship, maritalStatus, hasMilitaryService
3. addEmploymentRecord(clientId) - Creates new employment record, use returnId to reference it
4. updateEmploymentRecord(clientId, recordId, updates) - Updates: employerName, phoneNumber, jobTitle, incomeType, selfEmployed, currentlyEmployed, startDate, endDate, grossMonthlyIncome, employerAddress
5. addActiveIncome(clientId) - Creates new active income record, use returnId to reference it
6. updateActiveIncome(clientId, recordId, updates) - Updates: employmentRecordId, companyName, position, monthlyAmount, bonus, commissions, overtime, notes
7. addRealEstateRecord(clientId) - Creates new property record, use returnId to reference it
8. updateRealEstateRecord(clientId, recordId, updates) - Updates: propertyType, propertyStatus, occupancyType, propertyValue, monthlyTaxes, monthlyInsurance, currentResidence
9. addAsset(clientId) - Creates new asset record for primary owner, use returnId to reference it
10. updateAsset(clientId, recordId, updates) - Updates: category, type, amount, institutionName, accountNumber, source
11. setSharedOwners(clientId, assetId, sharedClientIds) - Marks an asset as shared/joint ownership. Use this for joint accounts. Example: create asset for client1, then use setSharedOwners(client1, assetId, [client2])
12. updateAddressData(clientId, data) - Updates present address. The data should contain: {"addr": {"address1": "4027 Pierce Street", "city": "Hollywood"}}. Optionally include "fromDate": "2020-01-01" if a move-in date is mentioned. The system will automatically resolve full address details via Google Places API.
13. addFormerAddress(clientId, address) - Adds a former address record. The address should contain: {"id": "former1", "fromDate": "2020-01-01", "toDate": "2023-01-01", "addr": {"address1": "300 Bayview Drive", "address2": "Apartment 151", "city": "Hollywood"}}`;
}

