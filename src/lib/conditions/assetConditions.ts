// Asset condition generators
import type { AddConditionFn, ConditionGeneratorInput } from './types';
import type { AssetRecord } from '$lib/types/assets';
import { generateBankStatementCondition } from './assetConditions/bank';
import { generateInvestmentStatementCondition, generateLifeInsuranceCondition, generateRetirementFundCondition } from './assetConditions/investment';
import { generateGiftDocumentationCondition } from './assetConditions/gift';
import { generateOtherAssetCondition } from './assetConditions/other';

export function generateAssetConditions(
  input: ConditionGeneratorInput,
  addCondition: AddConditionFn
): void {
  const { assets, client } = input;
  const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client';

  addCondition(
    'Assets',
    `Bank Statements - Last 2 Months`,
    `Please provide the most recent 2 months of bank statements for all accounts (checking, savings, money market)`,
    'high',
    7
  );

  if (!assets || assets.length === 0) {
    return;
  }

  assets.forEach((asset: AssetRecord) => {
    switch (asset.category) {
      case 'BankAccount':
        generateBankStatementCondition(asset, addCondition);
        break;
      case 'StocksAndBonds':
        generateInvestmentStatementCondition(asset, addCondition);
        break;
      case 'LifeInsurance':
        generateLifeInsuranceCondition(asset, addCondition);
        break;
      case 'RetirementFund':
        generateRetirementFundCondition(asset, addCondition);
        break;
      case 'Gift':
        generateGiftDocumentationCondition(asset, addCondition);
        break;
      case 'Other':
        generateOtherAssetCondition(asset, addCondition);
        break;
    }
  });
}

