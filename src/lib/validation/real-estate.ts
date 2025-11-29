// Real estate validation
import type { ApplicationState } from '$lib/stores/application/types';
import type { ValidationError, StepValidationResult } from './types';

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
        errors.push({ field: `realEstate.${index}.address`, message: `Property address required for property ${index + 1}` });
      }
      if (!property.propertyType?.trim()) {
        errors.push({ field: `realEstate.${index}.propertyType`, message: `Property type required for property ${index + 1}` });
      }
      if (!property.propertyStatus?.trim()) {
        errors.push({ field: `realEstate.${index}.propertyStatus`, message: `Property status required for property ${index + 1}` });
      }
      if (!property.occupancyType?.trim()) {
        errors.push({ field: `realEstate.${index}.occupancyType`, message: `Occupancy type required for property ${index + 1}` });
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
}


