// Assets validation
import type { ApplicationState } from '$lib/stores/application/types';
import type { ValidationError, StepValidationResult } from './types';
import { t } from '$lib/i18n';

export function isAssetsComplete(state: ApplicationState, clientId: string): boolean {
  const assets = state.assetsData[clientId];
  // At least one asset is required
  if (!assets?.records?.length) return false;
  
  // Check they have required fields
  return assets.records.every(asset => 
    !!(asset.category && asset.type?.trim() && asset.institutionName?.trim())
  );
}

export function validateAssets(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const assets = state.assetsData[clientId];
  
  if (!assets?.records?.length) {
    errors.push({ field: 'assets', message: t('errors.atLeastOneAsset') });
    return { isValid: false, errors };
  }
  
  assets.records.forEach((asset, index) => {
    if (!asset.institutionName?.trim()) {
      errors.push({ field: `assets.${index}.institutionName`, message: t('errors.institutionNameRequired', { index: (index + 1).toString() }) });
    }
    if (!asset.type?.trim()) {
      errors.push({ field: `assets.${index}.type`, message: t('errors.accountTypeRequired', { index: (index + 1).toString() }) });
    }
  });
  
  return { isValid: errors.length === 0, errors };
}



