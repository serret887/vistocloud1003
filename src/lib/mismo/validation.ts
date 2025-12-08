import type { ApplicationState } from '$lib/stores/application/index';
import { t } from '$lib/i18n';

export function validateMISMO(state: ApplicationState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  state.clientIds.forEach((clientId, index) => {
    const label = index === 0 ? t('clientInfo.primaryBorrower') : `${t('clientInfo.coBorrower')} ${index}`;
    const client = state.clientData[clientId];
    const address = state.addressData[clientId]?.present?.addr;

    if (!client?.firstName) errors.push(t('errors.mismo.firstNameRequired', { label }));
    if (!client?.lastName) errors.push(t('errors.mismo.lastNameRequired', { label }));
    if (!client?.ssn) errors.push(t('errors.mismo.ssnRequired', { label }));
    if (!client?.dob) errors.push(t('errors.mismo.dobRequired', { label }));

    if (!address?.address1) errors.push(t('errors.mismo.addressLine1Required', { label }));
    if (!address?.city) errors.push(t('errors.mismo.cityRequired', { label }));
    if (!address?.region) errors.push(t('errors.mismo.stateRequired', { label }));
    if (!address?.postalCode) errors.push(t('errors.mismo.zipRequired', { label }));
  });

  const anyEmployment = state.clientIds.some(id => (state.employmentData[id]?.records || []).length > 0);
  if (!anyEmployment) errors.push(t('errors.mismo.atLeastOneEmployment'));

  const anyIncome = state.clientIds.some(id => {
    const data = state.incomeData[id];
    return (data?.activeIncomeRecords?.length || 0) > 0 || (data?.passiveIncomeRecords?.length || 0) > 0;
  });
  if (!anyIncome) errors.push(t('errors.mismo.atLeastOneIncome'));

  return { valid: errors.length === 0, errors };
}


