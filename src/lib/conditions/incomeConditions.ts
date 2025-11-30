import type { AddConditionFn, ConditionGeneratorInput } from './types';
import type { EmploymentRecord } from '$lib/types/employment';
import { analyzeEmployment } from './incomeConditions/employmentAnalysis';
import { generateW2Conditions, generatePaystubConditions } from './incomeConditions/w2Conditions';
import { generateTaxReturnConditions, generateSelfEmployedTaxConditions, generateBusinessTaxReturnsForOwnership } from './incomeConditions/taxConditions';
import { generateOfferLetterCondition } from './incomeConditions/offerLetter';

/**
 * Generate income-related conditions (W-2s, Pay Stubs, Tax Returns, etc.)
 */
export function generateIncomeConditions(
  input: ConditionGeneratorInput,
  addCondition: AddConditionFn
): void {
  const { employmentData, client } = input;

  if (!employmentData || employmentData.length === 0) {
    return;
  }

  const clientName = `${client.firstName} ${client.lastName}`.trim() || 'Client';

  analyzeEmployment(employmentData, clientName, addCondition);

  employmentData.forEach((emp: EmploymentRecord) => {
    const employerName = emp.employerName || 'Employer';

    if (emp.hasOfferLetter) {
      generateOfferLetterCondition(employerName, clientName, addCondition);
    }

    if (emp.selfEmployed === false) {
      generateW2Conditions(emp, employerName, addCondition);
      generatePaystubConditions(emp, employerName, addCondition);
      generateTaxReturnConditions(emp, employerName, addCondition);
      
      if (emp.ownershipPercentage) {
        generateBusinessTaxReturnsForOwnership(emp, employerName, addCondition);
      }
    } else if (emp.selfEmployed === true) {
      generateSelfEmployedTaxConditions(emp, employerName, addCondition);
    }
  });
}


