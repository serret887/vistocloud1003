// Validation module - exports all validation functions
export type { ValidationError, StepValidationResult, StepStatus } from './types';
export { STEP_ORDER } from './types';

export { isClientInfoComplete, validateClientInfo } from './client-info';
export { isEmploymentComplete, validateEmployment } from './employment';
export { isIncomeComplete, validateIncome } from './income';
export { isAssetsComplete, validateAssets } from './assets';
export { isRealEstateComplete, validateRealEstate } from './real-estate';
export { isDocumentsComplete, validateDocuments } from './documents';

import type { ApplicationState } from '$lib/stores/application/types';
import type { ApplicationStepId } from '$lib/types/application';
import type { StepValidationResult, StepStatus } from './types';
import { STEP_ORDER } from './types';

import { isClientInfoComplete, validateClientInfo } from './client-info';
import { isEmploymentComplete, validateEmployment } from './employment';
import { isIncomeComplete, validateIncome } from './income';
import { isAssetsComplete, validateAssets } from './assets';
import { isRealEstateComplete, validateRealEstate } from './real-estate';
import { isDocumentsComplete, validateDocuments } from './documents';

export function validateStep(stepId: ApplicationStepId, state: ApplicationState): StepValidationResult {
  const clientId = state.activeClientId;
  
  if (!clientId) {
    return { isValid: false, errors: [{ field: 'client', message: 'No active client' }] };
  }
  
  switch (stepId) {
    case 'client-info': return validateClientInfo(state, clientId);
    case 'employment': return validateEmployment(state, clientId);
    case 'income': return validateIncome(state, clientId);
    case 'assets': return validateAssets(state, clientId);
    case 'real-estate': return validateRealEstate(state, clientId);
    case 'documents': return validateDocuments(state, clientId);
    case 'dictate':
    case 'review':
      return { isValid: true, errors: [] };
    default:
      return { isValid: false, errors: [{ field: 'step', message: 'Unknown step' }] };
  }
}

export function isStepComplete(stepId: ApplicationStepId, state: ApplicationState): boolean {
  const clientId = state.activeClientId;
  if (!clientId) return false;
  
  switch (stepId) {
    case 'client-info': return isClientInfoComplete(state, clientId);
    case 'employment': return isEmploymentComplete(state, clientId);
    case 'income': return isIncomeComplete(state, clientId);
    case 'assets': return isAssetsComplete(state, clientId);
    case 'real-estate': return isRealEstateComplete(state, clientId);
    case 'documents': return isDocumentsComplete(state, clientId);
    case 'dictate':
      // Voice dictation is a tool, not a data step - never shows as "complete"
      return false;
    case 'review':
      // Review is complete only when ALL data steps are complete for ALL clients
      const dataSteps: ApplicationStepId[] = ['client-info', 'employment', 'income', 'assets', 'documents'];
      return state.clientIds.every(cId => {
        const origClient = state.activeClientId;
        state.activeClientId = cId;
        const allComplete = dataSteps.every(s => isStepComplete(s, state));
        state.activeClientId = origClient;
        return allComplete;
      });
    default:
      return false;
  }
}

export function getStepStatus(
  stepId: ApplicationStepId, 
  currentStepId: ApplicationStepId, 
  state: ApplicationState
): StepStatus {
  if (stepId === currentStepId) return 'current';
  
  // Voice dictation is always just "pending" - it's a tool, not a data step
  if (stepId === 'dictate') return 'pending';
  
  const stepIndex = STEP_ORDER.indexOf(stepId);
  const currentIndex = STEP_ORDER.indexOf(currentStepId);
  
  if (stepIndex < 0 || currentIndex < 0) return 'pending';
  
  // Check if this step has been visited by the active client
  const clientId = state.activeClientId;
  const visitedSteps = state.visitedSteps?.[clientId];
  const hasBeenVisited = visitedSteps instanceof Set && visitedSteps.has(stepId);
  
  // Only show completion status if the step has been visited
  if (!hasBeenVisited) {
    // Future steps that haven't been visited are pending
    return 'pending';
  }
  
  // Step has been visited - check if it's complete
  const isComplete = isStepComplete(stepId, state);
  if (isComplete) return 'completed';
  
  // Visited but not complete = incomplete
  return 'incomplete';
}


