// Gift asset condition generators
import type { AddConditionFn } from '../types';
import type { AssetRecord } from '$lib/types/assets';

export function generateGiftDocumentationCondition(
  asset: AssetRecord,
  addCondition: AddConditionFn
): void {
  const giftSource = asset.source || 'Donor';
  const giftType = asset.type || 'Gift';

  addCondition(
    'Assets',
    `Gift Letter - ${giftType} from ${giftSource}`,
    `Please provide a signed gift letter from ${giftSource} stating that the ${giftType} is a gift and does not require repayment`,
    'high',
    7
  );

  addCondition(
    'Assets',
    `Gift Transfer Documentation - ${giftType} from ${giftSource}`,
    `Please provide proof of transfer showing the ${giftType} funds have been deposited into your account`,
    'high',
    7
  );

  addCondition(
    'Assets',
    `Donor Bank Statement - ${giftSource}`,
    `Please provide a copy of ${giftSource}'s bank statement showing withdrawal of gift funds`,
    'high',
    7
  );
}


