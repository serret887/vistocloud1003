// MISMO utility functions
export function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function mapMaritalStatus(status: string | undefined): string {
  const map: Record<string, string> = {
    'Single': 'Unmarried',
    'Married': 'Married',
    'Divorced': 'Unmarried',
    'Widowed': 'Unmarried',
    'Separated': 'Unmarried'
  };
  return map[status || ''] || 'Unmarried';
}

export function mapCitizenship(citizenship: string | undefined): string {
  const map: Record<string, string> = {
    'US Citizen': 'USCitizen',
    'Permanent Resident': 'PermanentResidentAlien',
    'Non-Permanent Resident': 'NonPermanentResidentAlien'
  };
  return map[citizenship || ''] || 'USCitizen';
}

export function mapPassiveIncomeType(type: string | undefined): string {
  const map: Record<string, string> = {
    'Alimony': 'Alimony',
    'ChildSupport': 'ChildSupport',
    'Disability': 'Disability',
    'FosterCare': 'FosterCare',
    'InterestAndDividends': 'InterestAndDividends',
    'Military': 'Military',
    'NonTaxable': 'NonTaxable',
    'Other': 'Other',
    'Pension': 'Pension',
    'PublicAssistance': 'PublicAssistance',
    'Retirement': 'Retirement',
    'SocialSecurity': 'SocialSecurity',
    'Trust': 'Trust',
    'Unemployment': 'Unemployment',
    'VA_Benefits': 'VABenefits'
  };
  return map[type || ''] || 'Other';
}

export function mapOccupancyType(type: string | undefined): string {
  const map: Record<string, string> = {
    'Primary': 'PrimaryResidence',
    'Secondary': 'SecondHome',
    'Investment': 'InvestmentProperty'
  };
  return map[type || ''] || 'PrimaryResidence';
}

export function mapAssetType(category: string | undefined, type: string | undefined): string {
  if (category === 'BankAccount') {
    const map: Record<string, string> = {
      'Checking': 'CheckingAccount',
      'Savings': 'SavingsAccount',
      'Money Market': 'MoneyMarketAccount',
      'CD': 'CertificateOfDeposit'
    };
    return map[type || ''] || 'CheckingAccount';
  }
  if (category === 'StocksAndBonds') return 'StocksAndBonds';
  if (category === 'LifeInsurance') return 'LifeInsurance';
  if (category === 'RetirementFund') {
    const map: Record<string, string> = {
      '401k': 'RetirementAccount',
      'IRA': 'RetirementAccount',
      'Roth IRA': 'RetirementAccount',
      'Pension': 'Pension'
    };
    return map[type || ''] || 'RetirementAccount';
  }
  if (category === 'Gift') return 'GiftFunds';
  return 'Other';
}

export function calculateMonths(fromDate: string | undefined): number {
  if (!fromDate) return 0;
  const from = new Date(fromDate);
  const now = new Date();
  return (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
}

export function calculateMonthsBetween(fromDate: string | undefined, toDate: string | undefined): number {
  if (!fromDate || !toDate) return 0;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}


