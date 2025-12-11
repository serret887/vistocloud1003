// Employment analysis and gap detection conditions
import type { AddConditionFn } from '../types';
import { detectEmploymentGaps, calculateTotalCoverage, type EmploymentGap } from './utils';
import type { EmploymentRecord } from '$lib/types/employment';

export function generateEmploymentGapCondition(
  gaps: EmploymentGap[],
  clientName: string,
  addCondition: AddConditionFn
): void {
  const gapCount = gaps.length;
  const gapText = gapCount === 1 ? 'gap' : 'gaps';
  
  const gapPeriods = gaps.map(gap => {
    const startStr = gap.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const endStr = gap.endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr} (${gap.durationMonths} month${gap.durationMonths !== 1 ? 's' : ''})`;
  }).join(', ');

  addCondition(
    'Income',
    `Employment Gap Explanation for ${clientName}`,
    `We detected ${gapCount} employment ${gapText} in the work history: ${gapPeriods}. Please provide a written explanation for these gaps, including what ${clientName} was doing during this time (e.g., education, travel, family care, job search, etc.)`,
    'high',
    14
  );
}

export function generateInsufficientEmploymentCondition(
  totalMonths: number,
  clientName: string,
  addCondition: AddConditionFn
): void {
  const yearsProvided = (totalMonths / 12).toFixed(1);
  const monthsNeeded = 24 - totalMonths;

  addCondition(
    'Income',
    `Insufficient Employment History for ${clientName}`,
    `We require at least 2 years (24 months) of employment history. Currently provided: ${yearsProvided} years (${totalMonths} months). Please provide ${monthsNeeded} additional month${monthsNeeded !== 1 ? 's' : ''} of employment history, or provide a written explanation if less than 2 years of employment history is available (e.g., recent graduate, career change, etc.)`,
    'high',
    14
  );
}

export function analyzeEmployment(
  employmentData: EmploymentRecord[],
  clientName: string,
  addCondition: AddConditionFn
): void {
  const gaps = detectEmploymentGaps(employmentData);
  const totalMonths = calculateTotalCoverage(employmentData);

  if (gaps.length > 0) {
    generateEmploymentGapCondition(gaps, clientName, addCondition);
  }

  if (totalMonths < 24) {
    generateInsufficientEmploymentCondition(totalMonths, clientName, addCondition);
  }
}



