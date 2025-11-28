import type { AddConditionFn, ConditionGeneratorInput } from './types';
import type { AssetRecord } from '$lib/types/assets';

/**
 * Generate asset-related conditions (Bank Statements, Investment Statements, etc.)
 */
export function generateAssetConditions(
  input: ConditionGeneratorInput,
  addCondition: AddConditionFn
): void {
  const { assets, client } = input;
  const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client';

  // Always generate bank statements condition (last 2 months) - required for all applications
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

/**
 * Helper function to get last 4 digits of account number
 */
function getLastFourDigits(accountNumber: string | null | undefined): string {
  if (!accountNumber) return '';
  return accountNumber.length >= 4 ? accountNumber.slice(-4) : accountNumber;
}

/**
 * Generate bank statement condition for a bank account
 */
function generateBankStatementCondition(
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

/**
 * Generate investment statement condition for stocks and bonds
 */
function generateInvestmentStatementCondition(
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

/**
 * Generate life insurance documentation condition
 */
function generateLifeInsuranceCondition(
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

/**
 * Generate retirement fund documentation condition
 */
function generateRetirementFundCondition(
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

/**
 * Generate gift documentation condition
 */
function generateGiftDocumentationCondition(
  asset: AssetRecord,
  addCondition: AddConditionFn
): void {
  const giftSource = asset.source || 'Donor';
  const giftType = asset.type || 'Gift';

  // Gift Letter
  addCondition(
    'Assets',
    `Gift Letter - ${giftType} from ${giftSource}`,
    `Please provide a signed gift letter from ${giftSource} stating that the ${giftType} is a gift and does not require repayment`,
    'high',
    7
  );

  // Proof of Transfer
  addCondition(
    'Assets',
    `Gift Transfer Documentation - ${giftType} from ${giftSource}`,
    `Please provide proof of transfer showing the ${giftType} funds have been deposited into your account`,
    'high',
    7
  );

  // Donor's Bank Statement
  addCondition(
    'Assets',
    `Donor Bank Statement - ${giftSource}`,
    `Please provide a copy of ${giftSource}'s bank statement showing withdrawal of gift funds`,
    'high',
    7
  );
}

/**
 * Generate other asset documentation condition
 */
function generateOtherAssetCondition(
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

