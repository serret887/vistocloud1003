// Client info validation
import type { ApplicationState } from '$lib/stores/application/types';
import type { ValidationError, StepValidationResult } from './types';
import { t } from '$lib/i18n';

export function isClientInfoComplete(state: ApplicationState, clientId: string): boolean {
  const client = state.clientData[clientId];
  if (!client) return false;
  
  const hasName = !!(client.firstName?.trim() && client.lastName?.trim());
  const hasContact = !!(client.email?.trim() && client.phone?.trim());
  const hasPersonal = !!(client.ssn?.trim() && client.dob?.trim());
  const hasStatus = !!(client.citizenship?.trim() && client.maritalStatus?.trim());
  const hasAddress = !!(
    state.addressData[clientId]?.present?.addr?.formattedAddress ||
    state.addressData[clientId]?.present?.addr?.address1
  );
  const hasMoveInDate = !!state.addressData[clientId]?.present?.fromDate;
  
  // Check former addresses if needed (less than 24 months at current)
  const fromDate = state.addressData[clientId]?.present?.fromDate;
  if (fromDate) {
    const diffMonths = getMonthsDiff(new Date(fromDate), new Date());
    if (diffMonths < 24 && diffMonths > 0) {
      const hasFormerAddresses = (state.addressData[clientId]?.former?.length || 0) > 0;
      return hasName && hasContact && hasPersonal && hasStatus && hasAddress && hasMoveInDate && hasFormerAddresses;
    }
  }
  
  return hasName && hasContact && hasPersonal && hasStatus && hasAddress && hasMoveInDate;
}

export function validateClientInfo(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const client = state.clientData[clientId];
  
  if (!client) {
    return { isValid: false, errors: [{ field: 'client', message: t('errors.clientDataNotFound') }] };
  }
  
  if (!client.firstName?.trim()) errors.push({ field: 'firstName', message: t('errors.firstNameRequired') });
  if (!client.lastName?.trim()) errors.push({ field: 'lastName', message: t('errors.lastNameRequired') });
  if (!client.email?.trim()) errors.push({ field: 'email', message: t('errors.emailRequired') });
  if (!client.phone?.trim()) errors.push({ field: 'phone', message: t('errors.phoneRequired') });
  if (!client.ssn?.trim()) errors.push({ field: 'ssn', message: t('errors.ssnRequired') });
  if (!client.dob?.trim()) errors.push({ field: 'dob', message: t('errors.dobRequired') });
  if (!client.citizenship?.trim()) errors.push({ field: 'citizenship', message: t('errors.citizenshipRequired') });
  if (!client.maritalStatus?.trim()) errors.push({ field: 'maritalStatus', message: t('errors.maritalStatusRequired') });
  
  const address = state.addressData[clientId]?.present?.addr;
  if (!address?.formattedAddress && !address?.address1) {
    errors.push({ field: 'address', message: t('errors.presentAddressRequired') });
  }
  
  if (!state.addressData[clientId]?.present?.fromDate) {
    errors.push({ field: 'moveInDate', message: t('errors.moveInDateRequired') });
  }
  
  // Check former addresses if needed
  const fromDate = state.addressData[clientId]?.present?.fromDate;
  if (fromDate) {
    const diffMonths = getMonthsDiff(new Date(fromDate), new Date());
    if (diffMonths < 24 && diffMonths > 0) {
      const formerAddresses = state.addressData[clientId]?.former || [];
      if (formerAddresses.length === 0) {
        errors.push({ field: 'formerAddresses', message: t('errors.formerAddressesRequired') });
      } else {
        formerAddresses.forEach((addr, index) => {
          if (!addr.addr?.formattedAddress && !addr.addr?.address1) {
            errors.push({ field: `formerAddress.${index}.address`, message: t('errors.formerAddressRequired', { index: (index + 1).toString() }) });
          }
          if (!addr.fromDate) {
            errors.push({ field: `formerAddress.${index}.fromDate`, message: t('errors.fromDateRequired', { index: (index + 1).toString() }) });
          }
          if (!addr.toDate) {
            errors.push({ field: `formerAddress.${index}.toDate`, message: t('errors.toDateRequired', { index: (index + 1).toString() }) });
          }
        });
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

function getMonthsDiff(start: Date, end: Date): number {
  const diffTime = end.getTime() - start.getTime();
  return diffTime / (30.44 * 24 * 60 * 60 * 1000);
}



