// Validation-related store actions
import type { Writable } from 'svelte/store';
import type { ApplicationState, ValidationError } from '../types';
import type { ApplicationStepId } from '$lib/types/application';
import { validateStep } from '$lib/validation/index';

export function createValidationActions(
  update: Writable<ApplicationState>['update'],
  getStore: () => ApplicationState
) {
  return {
    clearValidationErrors: (stepId: ApplicationStepId) => {
      update(s => {
        const clientId = s.activeClientId;
        if (!clientId) return s;
        
        const validationErrors = { ...s.validationErrors };
        if (validationErrors[clientId]) {
          const clientErrors = { ...validationErrors[clientId] };
          delete clientErrors[stepId];
          validationErrors[clientId] = clientErrors;
        }
        return { ...s, validationErrors };
      });
    },
    
    clearFieldError: (fieldPath: string) => {
      update(s => {
        const clientId = s.activeClientId;
        const stepId = s.currentStepId;
        if (!clientId || !stepId) return s;
        
        const validationErrors = { ...s.validationErrors };
        if (validationErrors[clientId]?.[stepId]) {
          const currentErrors = validationErrors[clientId][stepId];
          console.log(`🧹 [CLEAR] Clearing "${fieldPath}" from step "${stepId}". Current errors:`, currentErrors.map(e => e.field));
          const filteredErrors = currentErrors.filter(err => err.field !== fieldPath);
          console.log(`🧹 [CLEAR] Errors after filter:`, filteredErrors.map(e => e.field));
          validationErrors[clientId] = {
            ...validationErrors[clientId],
            [stepId]: filteredErrors
          };
        } else {
          console.log(`🧹 [CLEAR] No errors found for step "${stepId}" or client "${clientId}"`);
        }
        return { ...s, validationErrors };
      });
    },
    
    markFieldTouched: (fieldPath: string) => {
      update(s => {
        const clientId = s.activeClientId;
        if (!clientId) return s;
        
        const touchedFields = { ...s.touchedFields };
        if (!touchedFields[clientId]) {
          touchedFields[clientId] = new Set<string>();
        }
        touchedFields[clientId].add(`${s.currentStepId}.${fieldPath}`);
        return { ...s, touchedFields };
      });
    },
    
    revalidateCurrentStep: () => {
      const state = getStore();
      const currentStepId = state.currentStepId;
      const clientId = state.activeClientId;
      
      if (!currentStepId || !clientId) return;
      
      try {
        const validation = validateStep(currentStepId, state);
        
        const clientVisitedSteps = state.visitedSteps[clientId];
        if (clientVisitedSteps?.has(currentStepId)) {
          update(s => {
            const validationErrors = { ...s.validationErrors };
            if (!validationErrors[clientId]) {
              validationErrors[clientId] = {} as Record<ApplicationStepId, ValidationError[]>;
            }
            validationErrors[clientId][currentStepId] = validation.errors;
            return { ...s, validationErrors };
          });
        }
      } catch (error) {
        console.error('Re-validation error:', error);
      }
    }
  };
}


