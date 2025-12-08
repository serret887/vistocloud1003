// Real estate validation
import type { ApplicationState } from '$lib/stores/application/types';
import type { ValidationError, StepValidationResult } from './types';
import { t } from '$lib/i18n';

export function isRealEstateComplete(state: ApplicationState, clientId: string): boolean {
  const realEstate = state.realEstateData[clientId];
  // Real estate is optional
  if (!realEstate?.records?.length) return true;
  
  return realEstate.records.every(property => 
    !!(
      (property.address?.formattedAddress || property.address?.address1) &&
      property.propertyType?.trim() &&
      property.propertyStatus?.trim() &&
      property.occupancyType?.trim()
    )
  );
}

export function validateRealEstate(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const realEstate = state.realEstateData[clientId];
  
  if (realEstate?.records?.length) {
    realEstate.records.forEach((property, index) => {
      if (!property.address?.formattedAddress && !property.address?.address1) {
        errors.push({ field: `realEstate.${index}.address`, message: t('errors.propertyAddressRequired', { index: (index + 1).toString() }) });
      }
      if (!property.propertyType?.trim()) {
        errors.push({ field: `realEstate.${index}.propertyType`, message: t('errors.propertyTypeRequired', { index: (index + 1).toString() }) });
      }
      if (!property.propertyStatus?.trim()) {
        errors.push({ field: `realEstate.${index}.propertyStatus`, message: t('errors.propertyStatusRequired', { index: (index + 1).toString() }) });
      }
      if (!property.occupancyType?.trim()) {
        errors.push({ field: `realEstate.${index}.occupancyType`, message: t('errors.occupancyTypeRequired', { index: (index + 1).toString() }) });
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
}



