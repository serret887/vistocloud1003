import type { LLMAction, VoiceUpdate } from '$lib/types/voice-assistant';
import type { DynamicIdMap } from './types';
import { handleAddClient, handleUpdateClientData } from './actionHandlers/client';
import { handleAddEmploymentRecord, handleUpdateEmploymentRecord } from './actionHandlers/employment';
import { handleAddActiveIncome, handleUpdateActiveIncome } from './actionHandlers/income';
import { handleAddAsset, handleUpdateAsset, handleSetSharedOwners } from './actionHandlers/assets';
import { handleUpdateAddressData, handleAddFormerAddress } from './actionHandlers/address';
import { handleAddRealEstateRecord, handleUpdateRealEstateRecord } from './actionHandlers/realEstate';

/**
 * Execute store actions and return update information
 */
export function executeStoreAction(
  action: LLMAction,
  store: any,
  dynamicIdMap: DynamicIdMap
): VoiceUpdate | null {
  try {
    switch (action.action) {
      case 'addClient':
        return handleAddClient(action, store, dynamicIdMap);
      case 'updateClientData':
        return handleUpdateClientData(action, store, dynamicIdMap);
      case 'addEmploymentRecord':
        return handleAddEmploymentRecord(action, store, dynamicIdMap);
      case 'updateEmploymentRecord':
        return handleUpdateEmploymentRecord(action, store, dynamicIdMap);
      case 'addActiveIncome':
        return handleAddActiveIncome(action, store, dynamicIdMap);
      case 'updateActiveIncome':
        return handleUpdateActiveIncome(action, store, dynamicIdMap);
      case 'addRealEstateRecord':
        return handleAddRealEstateRecord(action, store);
      case 'updateRealEstateRecord':
        return handleUpdateRealEstateRecord(action, store);
      case 'addAsset':
        return handleAddAsset(action, store, dynamicIdMap);
      case 'updateAsset':
        return handleUpdateAsset(action, store, dynamicIdMap);
      case 'updateAddressData':
        return handleUpdateAddressData(action, store, dynamicIdMap);
      case 'addFormerAddress':
        return handleAddFormerAddress(action, store, dynamicIdMap);
      case 'setSharedOwners':
        return handleSetSharedOwners(action, store, dynamicIdMap);
      default:
        console.warn('Unknown action:', action.action);
        return null;
    }
  } catch (err) {
    console.error('Error executing action:', action, err);
    return null;
  }
}
