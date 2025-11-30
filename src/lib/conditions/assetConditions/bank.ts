// Bank account condition generators
import type { AddConditionFn } from '../types';
import type { AssetRecord } from '$lib/types/assets';
import { getLastFourDigits } from './utils';

export function generateBankStatementCondition(
  asset: AssetRecord,
  addCondition: AddConditionFn
): void {
  const bankName = asset.institutionName || 'Bank';
  const accountType = asset.type || 'Account';
  const lastFour = getLastFourDigits(asset.accountNumber);

  const accountInfo = lastFour
    ? `${bankName} ${accountType} (ending in ${lastFour})`
    : `${bankName} ${accountType}`;

  addCondition(
    'Assets',
    `Bank Statements - ${accountInfo}`,
    `Please provide the most recent 2 months of bank statements for ${accountInfo}`,
    'high',
    7
  );
}

