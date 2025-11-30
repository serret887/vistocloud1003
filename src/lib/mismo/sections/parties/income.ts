import type { ActiveIncomeRecord, PassiveIncomeRecord } from '$lib/types/income';
import { mapPassiveIncomeType } from '../../utils';

export function generateIncome(income: any): string {
  if (!income) return '';

  const blocks: string[] = [];

  (income.activeIncomeRecords || []).forEach((record: ActiveIncomeRecord) => {
    blocks.push(baseIncome(record.monthlyAmount || 0, 'Base'));
    addOptional(blocks, record.bonus, 'Bonus');
    addOptional(blocks, record.overtime, 'Overtime');
    addOptional(blocks, record.commissions, 'Commissions');
  });

  (income.passiveIncomeRecords || []).forEach((record: PassiveIncomeRecord) => {
    blocks.push(passiveIncome(record.monthlyAmount || 0, mapPassiveIncomeType(record.sourceType)));
  });

  return blocks.join('\n');
}

function baseIncome(amount: number, type: string): string {
  return incomeTemplate(amount, type, true);
}

function passiveIncome(amount: number, type: string): string {
  return incomeTemplate(amount, type, false);
}

function incomeTemplate(amount: number, type: string, employment: boolean): string {
  return `                      <CURRENT_INCOME_ITEM>
                        <CURRENT_INCOME_ITEM_DETAIL>
                          <CurrentIncomeMonthlyTotalAmount>${amount}</CurrentIncomeMonthlyTotalAmount>
                          <IncomeType>${type}</IncomeType>
                          <EmploymentIncomeIndicator>${employment}</EmploymentIncomeIndicator>
                        </CURRENT_INCOME_ITEM_DETAIL>
                      </CURRENT_INCOME_ITEM>`;
}

function addOptional(blocks: string[], value: number | undefined, type: string) {
  if (!value) return;
  blocks.push(baseIncome(value, type));
}

