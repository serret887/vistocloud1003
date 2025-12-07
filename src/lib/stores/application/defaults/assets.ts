// Default assets data factories
import type { ClientAssetsData, AssetRecord } from '$lib/types/assets';
import { generateId } from '$lib/idGenerator';

export const createDefaultAssetsData = (clientId: string): ClientAssetsData => ({
  clientId,
  records: []
});

export const createDefaultAssetRecord = (
  clientId: string,
  category: AssetRecord['category']
): AssetRecord => ({
  id: generateId('asset'),
  clientId,
  category,
  type: '',
  amount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});



