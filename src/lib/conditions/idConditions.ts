import type { AddConditionFn, ConditionGeneratorInput } from './types';

/**
 * Generate ID-related conditions (Government ID, Visa, etc.)
 */
export function generateIdConditions(
  input: ConditionGeneratorInput,
  addCondition: AddConditionFn
): void {
  const { client } = input;
  const firstName = client.firstName?.trim() || '';
  const lastName = client.lastName?.trim() || '';
  const clientName = `${firstName} ${lastName}`.trim() || 'Client';

  // Government ID (always required)
  addCondition(
    'ID',
    `Government Issued ID for ${clientName}`,
    `Please provide a copy of ${clientName}'s driver's license, passport, or state ID`,
    'high',
    7
  );

  // Work Visa documentation for non-US citizens
  if (client.citizenship !== 'US Citizen') {
    addCondition(
      'ID',
      `Visa Documentation for ${clientName}`,
      `Please provide a copy of ${clientName}'s work visa and employment authorization documents`,
      'high',
      7
    );
  }
}

