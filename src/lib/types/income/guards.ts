// Type guards for income records
import type { ActiveIncomeRecord, PassiveIncomeRecord } from './types';

export function isActiveIncomeRecord(record: ActiveIncomeRecord | PassiveIncomeRecord): record is ActiveIncomeRecord {
  return 'employmentRecordId' in record && 'companyName' in record;
}

export function isPassiveIncomeRecord(record: ActiveIncomeRecord | PassiveIncomeRecord): record is PassiveIncomeRecord {
  return 'sourceType' in record && 'sourceName' in record;
}



