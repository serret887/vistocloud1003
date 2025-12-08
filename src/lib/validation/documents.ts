// Documents validation
import type { ApplicationState } from '$lib/stores/application/types';
import type { ValidationError, StepValidationResult } from './types';
import { generateConditions } from '$lib/conditions';
import { t } from '$lib/i18n';

export function isDocumentsComplete(state: ApplicationState, clientId: string): boolean {
  const documents = state.documentsData[clientId]?.documents || [];
  const client = state.clientData[clientId];
  const employmentRecords = state.employmentData[clientId]?.records || [];
  const assets = state.assetsData[clientId]?.records || [];
  
  if (!client?.firstName) return false;
  
  const requiredConditions = generateConditions({
    clientId,
    client,
    employmentData: employmentRecords,
    assets
  });
  
  if (requiredConditions.length === 0) return false;
  
  const uploadedConditionIds = new Set(
    documents
      .filter(doc => doc.status === 'uploaded' || doc.status === 'verified')
      .map(doc => doc.conditionId || doc.id)
  );
  
  return requiredConditions.every(condition => uploadedConditionIds.has(condition.id));
}

export function validateDocuments(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const documents = state.documentsData[clientId]?.documents || [];
  const client = state.clientData[clientId];
  const employmentRecords = state.employmentData[clientId]?.records || [];
  const assets = state.assetsData[clientId]?.records || [];
  
  if (!client?.firstName) {
    return { isValid: false, errors: [{ field: 'client', message: t('errors.clientInfoMustCompleteFirst') }] };
  }
  
  const requiredConditions = generateConditions({
    clientId,
    client,
    employmentData: employmentRecords,
    assets
  });
  
  if (requiredConditions.length === 0) {
    return { isValid: false, errors: [{ field: 'documents', message: t('errors.noDocumentsRequiredYet') }] };
  }
  
  const uploadedConditionIds = new Set(
    documents
      .filter(doc => doc.status === 'uploaded' || doc.status === 'verified')
      .map(doc => doc.conditionId || doc.id)
  );
  
  const missingDocuments = requiredConditions.filter(condition => !uploadedConditionIds.has(condition.id));
  
  missingDocuments.forEach(condition => {
    errors.push({ field: `document.${condition.id}`, message: condition.title });
  });
  
  return { isValid: errors.length === 0, errors };
}



