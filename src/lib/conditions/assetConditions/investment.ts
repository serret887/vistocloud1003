// Investment account condition generators
import type { AddConditionFn } from '../types';
import type { AssetRecord } from '$lib/types/assets';
import { getLastFourDigits } from './utils';

export function generateInvestmentStatementCondition(
  asset: AssetRecord,
  addCondition: AddConditionFn
): void {
  const institutionName = asset.institutionName || 'Investment Institution';
  const accountType = asset.type || 'Investment Account';
  const lastFour = getLastFourDigits(asset.accountNumber);

  const accountInfo = lastFour
    ? `${institutionName} ${accountType} (ending in ${lastFour})`
    : `${institutionName} ${accountType}`;

  addCondition(
    'Assets',
    `Investment Account Statements - ${accountInfo}`,
    `Please provide the most recent quarterly statement or current statement for ${accountInfo} showing account value and ownership`,
    'high',
    7
  );
}

export function generateLifeInsuranceCondition(
  asset: AssetRecord,
  addCondition: AddConditionFn
): void {
  const institutionName = asset.institutionName || 'Insurance Company';
  const policyType = asset.type || 'Policy';

  addCondition(
    'Assets',
    `Life Insurance Cash Value Statement - ${institutionName}`,
    `Please provide documentation from ${institutionName} showing the current cash value of the ${policyType}`,
    'medium',
    14
  );
}

export function generateRetirementFundCondition(
  asset: AssetRecord,
  addCondition: AddConditionFn
): void {
  const institutionName = asset.institutionName || 'Retirement Fund Provider';
  const accountType = asset.type || 'Retirement Account';
  const lastFour = getLastFourDigits(asset.accountNumber);

  const accountInfo = lastFour
    ? `${institutionName} ${accountType} (ending in ${lastFour})`
    : `${institutionName} ${accountType}`;

  addCondition(
    'Assets',
    `Retirement Account Statement - ${accountInfo}`,
    `Please provide the most recent quarterly statement for ${accountInfo} showing current balance and vested amount`,
    'high',
    7
  );
}


