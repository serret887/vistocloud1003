// Income type labels and constants
import type { IncomeType, PassiveIncomeType, IncomeFrequency, PassiveIncomeFrequency } from './types';

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  Standard: 'Standard',
  Foreign: 'Foreign',
  Seasonal: 'Seasonal',
  TemporaryLeave: 'Temporary Leave'
};

export const PASSIVE_INCOME_TYPE_LABELS: Record<PassiveIncomeType, string> = {
  '401k_ira': '401K/IRA',
  'alimony': 'Alimony',
  'asset_depletion': 'Asset Depletion',
  'automobile_expense_account': 'Automobile Expense Account',
  'boarder': 'Boarder',
  'capital_gains': 'Capital Gains',
  'child_support': 'Child Support',
  'dividends_interest': 'Dividends/Interest',
  'foster_care': 'Foster Care',
  'gambling_winnings': 'Gambling Winnings',
  'mortgage_differential': 'Mortgage Differential',
  'notes_receivable': 'Notes Receivable',
  'pension': 'Pension',
  'permanent_disability': 'Permanent Disability',
  'VITE_assistance': 'Public Assistance',
  'royalty_payment': 'Royalty Payment',
  'social_security': 'Social Security',
  'temporary_disability': 'Temporary Disability',
  'temporary_leave': 'Temporary Leave',
  'trust': 'Trust',
  'unemployment': 'Unemployment',
  'va_benefits_non_educational': 'VA Benefits Non Educational'
};

export const FREQUENCY_LABELS: Record<IncomeFrequency | PassiveIncomeFrequency, string> = {
  hourly: 'Hourly',
  weekly: 'Weekly',
  'bi-weekly': 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
  irregular: 'Irregular'
};


