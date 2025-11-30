// Other asset condition generators
import type { AddConditionFn } from '../types';
import type { AssetRecord } from '$lib/types/assets';

export function generateOtherAssetCondition(
  asset: AssetRecord,
  addCondition: AddConditionFn
): void {
  const assetType = asset.type || 'Asset';

  switch (asset.type) {
    case 'Earnest Money Deposit':
      addCondition(
        'Assets',
        'Earnest Money Deposit Receipt',
        'Please provide a copy of the earnest money deposit receipt or proof of payment',
        'high',
        3
      );
      break;

    case 'Secured Borrowed Funds Not Deposited':
      addCondition(
        'Assets',
        'Secured Borrowed Funds Documentation',
        'Please provide complete loan documentation for the secured borrowed funds including loan agreement and proof of collateral',
        'high',
        7
      );
      break;

    case 'Bridge Loan Not Deposited':
      addCondition(
        'Assets',
        'Bridge Loan Documentation',
        'Please provide the bridge loan agreement and terms, including repayment schedule and collateral information',
        'high',
        7
      );
      break;

    default:
      addCondition(
        'Assets',
        `Asset Documentation - ${assetType}`,
        `Please provide documentation verifying the ${assetType} and its current value`,
        'medium',
        14
      );
  }
}

