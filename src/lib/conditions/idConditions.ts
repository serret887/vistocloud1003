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

  // Work authorization documentation for non-US citizens
  if (client.citizenship === 'Permanent Resident Alien') {
    // Green Card holder
    addCondition(
      'ID',
      `Green Card (Permanent Resident Card) for ${clientName}`,
      `Please provide a copy of ${clientName}'s Green Card (Permanent Resident Card)`,
      'high',
      7
    );
  } else if (client.citizenship === 'Non-Permanent Resident Alien') {
    // EAD required
    addCondition(
      'ID',
      `Employment Authorization Document (EAD) for ${clientName}`,
      `Please provide a copy of ${clientName}'s Employment Authorization Document (EAD) and work visa`,
      'high',
      7
    );
  }
}

