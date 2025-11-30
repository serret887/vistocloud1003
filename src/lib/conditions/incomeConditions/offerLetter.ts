// Offer letter condition generator
import type { AddConditionFn } from '../types';

export function generateOfferLetterCondition(
  employerName: string,
  clientName: string,
  addCondition: AddConditionFn
): void {
  addCondition(
    'Income',
    `Offer Letter from ${employerName}`,
    `Please provide the signed offer letter from ${employerName} for ${clientName}, including details of compensation, start date, and employment terms`,
    'high',
    7
  );
}

