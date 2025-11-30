import type { ApplicationState } from '$lib/stores/application';

export function validateMISMO(state: ApplicationState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  state.clientIds.forEach((clientId, index) => {
    const label = index === 0 ? 'Primary Borrower' : `Co-Borrower ${index}`;
    const client = state.clientData[clientId];
    const address = state.addressData[clientId]?.present?.addr;

    if (!client?.firstName) errors.push(`${label}: first name required`);
    if (!client?.lastName) errors.push(`${label}: last name required`);
    if (!client?.ssn) errors.push(`${label}: SSN required`);
    if (!client?.dob) errors.push(`${label}: date of birth required`);

    if (!address?.address1) errors.push(`${label}: address line 1 required`);
    if (!address?.city) errors.push(`${label}: city required`);
    if (!address?.region) errors.push(`${label}: state required`);
    if (!address?.postalCode) errors.push(`${label}: ZIP required`);
  });

  const anyEmployment = state.clientIds.some(id => (state.employmentData[id]?.records || []).length > 0);
  if (!anyEmployment) errors.push('At least one employment record is required');

  const anyIncome = state.clientIds.some(id => {
    const data = state.incomeData[id];
    return (data?.activeIncomeRecords?.length || 0) > 0 || (data?.passiveIncomeRecords?.length || 0) > 0;
  });
  if (!anyIncome) errors.push('At least one income source is required');

  return { valid: errors.length === 0, errors };
}

