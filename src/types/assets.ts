export type AssetCategory =
  | 'BankAccount'
  | 'StocksAndBonds'
  | 'LifeInsurance'
  | 'RetirementFund'
  | 'Gift'
  | 'Other';

export interface AssetRecord {
  id: string;
  clientId: string;
  sharedClientIds?: string[];
  category: AssetCategory;
  type: string;
  amount: number;
  institutionName?: string | null;
  accountNumber?: string | null; // Optional; when provided must be unique across all assets
  source?: string | null; // Gift source
  createdAt: string;
  updatedAt: string;
}

export interface ClientAssetsData {
  clientId: string;
  records: AssetRecord[];
}


