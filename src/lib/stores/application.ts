// Re-export everything from the refactored store for backwards compatibility
// This file can be removed once all imports are updated to use the new paths

export {
  applicationStore,
  activeClientId,
  currentStepId,
  clientIds,
  activeClientData,
  activeEmploymentData,
  activeAssetsData,
  activeRealEstateData,
  activeAddressData,
  activeIncomeData,
  currentStepValidationErrors
} from './application/index';

export type {
  ApplicationState,
  DocumentRecord,
  DocumentHistoryEntry,
  ClientDocumentsData
} from './application/types';
