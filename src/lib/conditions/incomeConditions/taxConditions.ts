// Tax return condition generators
import type { AddConditionFn } from '../types';
import type { EmploymentRecord } from '$lib/types/employment';
import { getYearsWorkedForTaxReturns } from './utils';

export function generateTaxReturnConditions(
  emp: EmploymentRecord,
  employerName: string,
  addCondition: AddConditionFn
): void {
  const yearsWorked = getYearsWorkedForTaxReturns(emp.startDate, emp.endDate);
  const lastTwoYears = yearsWorked.slice(-2);

  if (lastTwoYears.length > 0) {
    const yearsList = lastTwoYears.join(', ');
    const yearsText = lastTwoYears.length === 1 ? 'year' : 'years';

    addCondition(
      'Income',
      `Tax Returns (${yearsList})`,
      `Please provide personal tax returns (Form 1040 with all schedules) for ${yearsText}: ${yearsList}`,
      'high',
      14
    );
  }
}

export function generateSelfEmployedTaxConditions(
  emp: EmploymentRecord,
  employerName: string,
  addCondition: AddConditionFn
): void {
  const yearsWorked = getYearsWorkedForTaxReturns(emp.startDate, emp.endDate);
  const lastTwoYears = yearsWorked.slice(-2);

  if (lastTwoYears.length > 0) {
    const yearsList = lastTwoYears.join(', ');
    const yearsText = lastTwoYears.length === 1 ? 'year' : 'years';

    addCondition(
      'Income',
      `Personal Tax Returns (${yearsList})`,
      `Please provide personal tax returns (Form 1040 with all schedules) for ${yearsText}: ${yearsList}`,
      'high',
      14
    );

    addCondition(
      'Income',
      `Business Tax Returns for ${employerName} (${yearsList})`,
      `Please provide business tax returns for ${employerName} for ${yearsText}: ${yearsList}`,
      'high',
      14
    );
  }
}

export function generateBusinessTaxReturnsForOwnership(
  emp: EmploymentRecord,
  employerName: string,
  addCondition: AddConditionFn
): void {
  const yearsWorked = getYearsWorkedForTaxReturns(emp.startDate, emp.endDate);
  const lastTwoYears = yearsWorked.slice(-2);

  if (lastTwoYears.length > 0) {
    const yearsList = lastTwoYears.join(', ');
    const yearsText = lastTwoYears.length === 1 ? 'year' : 'years';

    addCondition(
      'Income',
      `Business Tax Returns for ${employerName} (>25% Ownership) (${yearsList})`,
      `Since ownership percentage exceeds 25% in ${employerName}, please provide business tax returns (including K-1s if applicable) for ${yearsText}: ${yearsList}`,
      'high',
      14
    );
  }
}



