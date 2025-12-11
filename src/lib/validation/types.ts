// Validation types
import type { ApplicationStepId } from '$lib/types/application';

export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export type StepStatus = 'completed' | 'incomplete' | 'current' | 'pending';

export const STEP_ORDER: ApplicationStepId[] = [
  'client-info',
  'employment',
  'income',
  'assets',
  'real-estate',
  'loan-info',
  'documents',
  'dictate',
  'review'
];



