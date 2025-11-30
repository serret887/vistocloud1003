// W-2 condition generators
import type { AddConditionFn } from '../types';
import type { EmploymentRecord } from '$lib/types/employment';
import { getYearsWorkedForW2 } from './utils';

export function generateW2Conditions(
  emp: EmploymentRecord,
  employerName: string,
  addCondition: AddConditionFn
): void {
  const yearsWorked = getYearsWorkedForW2(emp.startDate, emp.endDate);
  const lastTwoYears = yearsWorked.slice(-2);

  if (lastTwoYears.length > 0) {
    const yearsList = lastTwoYears.join(', ');
    const yearsText = lastTwoYears.length === 1 ? 'year' : 'years';

    addCondition(
      'Income',
      `W-2 Forms from ${employerName} (${yearsList})`,
      `Please provide W-2 forms from ${employerName} for ${yearsText}: ${yearsList}`,
      'high',
      14
    );
  }
}

export function generatePaystubConditions(
  emp: EmploymentRecord,
  employerName: string,
  addCondition: AddConditionFn
): void {
  const isCurrentlyEmployed = !emp.endDate || emp.currentlyEmployed;

  if (isCurrentlyEmployed) {
    addCondition(
      'Income',
      `Pay Stubs from ${employerName}`,
      `Please provide your most recent 30 days of pay stubs from ${employerName}`,
      'high',
      7
    );
  }
}

