/**
 * Main action validation function
 */

import type { ValidationResult } from './types';
import { validateClientAction } from './clientValidator';
import { validateEmploymentAction } from './employmentValidator';
import { validateIncomeAction } from './incomeValidator';
import { validateAssetAction } from './assetValidator';
import { validateRealEstateAction } from './realEstateValidator';
import { validateAddressAction } from './addressValidator';

/**
 * Validate action parameters
 */
export function validateAction(action: any, currentState: any): ValidationResult {
  let result: ValidationResult;
  
  switch (action.action) {
    case 'addClient':
    case 'updateClientData':
      result = validateClientAction(action);
      break;
    
    case 'updateEmploymentRecord':
      result = validateEmploymentAction(action);
      break;
    
    case 'updateActiveIncome':
      result = validateIncomeAction(action);
      break;
    
    case 'updateAsset':
      result = validateAssetAction(action);
      break;
    
    case 'updateRealEstateRecord':
      result = validateRealEstateAction(action);
      break;
    
    case 'updateAddressData':
    case 'addFormerAddress':
      result = validateAddressAction(action);
      break;
    
    default:
      result = { valid: true, errors: [], warnings: [] };
  }
  
  // Check if clientId references exist
  if (action.params?.clientId) {
    const clientId = action.params.clientId;
    if (!clientId.startsWith('$') && !currentState.clients?.[clientId]) {
      result.warnings.push(`Client ID ${clientId} does not exist in current state`);
    }
  }
  
  return result;
}

