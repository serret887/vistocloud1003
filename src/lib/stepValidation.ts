/**
 * Step validation and completion checking
 */

import type { ApplicationState } from './stores/application';
import type { ApplicationStepId } from './types/application';
import { generateConditions } from './conditions';

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result for a step
 */
export interface StepValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Check if client info step is complete
 */
function isClientInfoComplete(state: ApplicationState, clientId: string): boolean {
  const client = state.clientData[clientId];
  if (!client) return false;
  
  // Required fields for client info
  const hasName = !!(client.firstName?.trim() && client.lastName?.trim());
  const hasContact = !!(client.email?.trim() && client.phone?.trim());
  const hasPersonal = !!(client.ssn?.trim() && client.dob?.trim());
  const hasStatus = !!(client.citizenship?.trim() && client.maritalStatus?.trim());
  const hasAddress = !!(
    state.addressData[clientId]?.present?.addr?.formattedAddress ||
    state.addressData[clientId]?.present?.addr?.address1
  );
  const hasMoveInDate = !!state.addressData[clientId]?.present?.fromDate;
  
  // Check former addresses if needed (less than 24 months at current address)
  const fromDate = state.addressData[clientId]?.present?.fromDate;
  if (fromDate) {
    const moveInDate = new Date(fromDate);
    const today = new Date();
    const diffTime = today.getTime() - moveInDate.getTime();
    const diffMonths = diffTime / (30.44 * 24 * 60 * 60 * 1000);
    
    if (diffMonths < 24 && diffMonths > 0) {
      // Need former addresses
      const hasFormerAddresses = (state.addressData[clientId]?.former?.length || 0) > 0;
      return hasName && hasContact && hasPersonal && hasStatus && hasAddress && hasMoveInDate && hasFormerAddresses;
    }
  }
  
  return hasName && hasContact && hasPersonal && hasStatus && hasAddress && hasMoveInDate;
}

/**
 * Validate client info step and return detailed errors
 */
export function validateClientInfo(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const client = state.clientData[clientId];
  
  if (!client) {
    return { isValid: false, errors: [{ field: 'client', message: 'Client data not found' }] };
  }
  
  if (!client.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  
  if (!client.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  
  if (!client.email?.trim()) {
    errors.push({ field: 'email', message: 'Email address is required' });
  }
  
  if (!client.phone?.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  }
  
  if (!client.ssn?.trim()) {
    errors.push({ field: 'ssn', message: 'Social Security Number is required' });
  }
  
  if (!client.dob?.trim()) {
    errors.push({ field: 'dob', message: 'Date of birth is required' });
  }
  
  if (!client.citizenship?.trim()) {
    errors.push({ field: 'citizenship', message: 'Citizenship status is required' });
  }
  
  if (!client.maritalStatus?.trim()) {
    errors.push({ field: 'maritalStatus', message: 'Marital status is required' });
  }
  
  const address = state.addressData[clientId]?.present?.addr;
  if (!address?.formattedAddress && !address?.address1) {
    errors.push({ field: 'address', message: 'Present address is required' });
  }
  
  if (!state.addressData[clientId]?.present?.fromDate) {
    errors.push({ field: 'moveInDate', message: 'Move-in date is required' });
  }
  
  // Check former addresses if needed
  const fromDate = state.addressData[clientId]?.present?.fromDate;
  if (fromDate) {
    const moveInDate = new Date(fromDate);
    const today = new Date();
    const diffTime = today.getTime() - moveInDate.getTime();
    const diffMonths = diffTime / (30.44 * 24 * 60 * 60 * 1000);
    
    if (diffMonths < 24 && diffMonths > 0) {
      const hasFormerAddresses = (state.addressData[clientId]?.former?.length || 0) > 0;
      if (!hasFormerAddresses) {
        errors.push({ field: 'formerAddresses', message: 'Former addresses are required (less than 24 months at current address)' });
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Check if employment step is complete
 */
function isEmploymentComplete(state: ApplicationState, clientId: string): boolean {
  const employment = state.employmentData[clientId];
  if (!employment) return false;
  
  // Need at least one employment record
  if (!employment.records || employment.records.length === 0) return false;
  
  // Check if we have at least 24 months of coverage
  const records = employment.records;
  let totalMonths = 0;
  const now = new Date();
  
  for (const record of records) {
    if (record.startDate) {
      const start = new Date(record.startDate);
      const end = record.currentlyEmployed ? now : (record.endDate ? new Date(record.endDate) : now);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  }
  
  // If less than 24 months, need employment note
  if (totalMonths < 24) {
    return !!(employment.employmentNote?.trim());
  }
  
  // Check that each record has required fields
  return records.every(record => 
    !!(record.employerName?.trim() && record.jobTitle?.trim() && record.startDate)
  );
}

/**
 * Validate employment step and return detailed errors
 */
export function validateEmployment(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const employment = state.employmentData[clientId];
  
  if (!employment || !employment.records || employment.records.length === 0) {
    return { isValid: false, errors: [{ field: 'employment', message: 'At least one employment record is required' }] };
  }
  
  const records = employment.records;
  let totalMonths = 0;
  const now = new Date();
  
  // Validate each record
  records.forEach((record, index) => {
    if (!record.employerName?.trim()) {
      errors.push({ field: `employment.${index}.employerName`, message: `Employer name is required for employment ${index + 1}` });
    }
    
    if (!record.jobTitle?.trim()) {
      errors.push({ field: `employment.${index}.jobTitle`, message: `Job title is required for employment ${index + 1}` });
    }
    
    if (!record.startDate) {
      errors.push({ field: `employment.${index}.startDate`, message: `Start date is required for employment ${index + 1}` });
    }
    
    if (record.startDate) {
      const start = new Date(record.startDate);
      const end = record.currentlyEmployed ? now : (record.endDate ? new Date(record.endDate) : now);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  });
  
  // Check employment history coverage
  if (totalMonths < 24) {
    if (!employment.employmentNote?.trim()) {
      errors.push({ field: 'employmentNote', message: 'Employment history note is required (less than 24 months of coverage)' });
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Check if income step is complete
 */
function isIncomeComplete(state: ApplicationState, clientId: string): boolean {
  const income = state.incomeData[clientId];
  if (!income) return false;
  
  // Need at least some income records (active or passive)
  const hasActiveIncome = (income.activeIncomeRecords?.length || 0) > 0;
  const hasPassiveIncome = (income.passiveIncomeRecords?.length || 0) > 0;
  
  return hasActiveIncome || hasPassiveIncome;
}

/**
 * Validate income step and return detailed errors
 */
export function validateIncome(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const income = state.incomeData[clientId];
  
  if (!income) {
    return { isValid: false, errors: [{ field: 'income', message: 'Income data not found' }] };
  }
  
  const hasActiveIncome = (income.activeIncomeRecords?.length || 0) > 0;
  const hasPassiveIncome = (income.passiveIncomeRecords?.length || 0) > 0;
  
  if (!hasActiveIncome && !hasPassiveIncome) {
    errors.push({ field: 'income', message: 'At least one income source is required (employment income or other income)' });
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Check if assets step is complete
 */
function isAssetsComplete(state: ApplicationState, clientId: string): boolean {
  const assets = state.assetsData[clientId];
  // Assets are optional, but if they exist, they should be valid
  if (!assets || !assets.records || assets.records.length === 0) {
    return true; // Assets are optional, so empty is considered complete
  }
  
  // If assets exist, check they have required fields
  return assets.records.every(asset => 
    !!(asset.category && asset.type?.trim() && asset.institutionName?.trim())
  );
}

/**
 * Validate assets step and return detailed errors
 */
export function validateAssets(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const assets = state.assetsData[clientId];
  
  // Assets are optional, but if they exist, validate them
  if (assets && assets.records && assets.records.length > 0) {
    assets.records.forEach((asset, index) => {
      if (!asset.institutionName?.trim()) {
        errors.push({ field: `assets.${index}.institutionName`, message: `Institution name is required for asset ${index + 1}` });
      }
      
      if (!asset.type?.trim()) {
        errors.push({ field: `assets.${index}.type`, message: `Account type is required for asset ${index + 1}` });
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Check if real estate step is complete
 */
function isRealEstateComplete(state: ApplicationState, clientId: string): boolean {
  const realEstate = state.realEstateData[clientId];
  // Real estate is optional
  if (!realEstate || !realEstate.records || realEstate.records.length === 0) {
    return true; // Real estate is optional
  }
  
  // If real estate exists, check they have required fields
  return realEstate.records.every(property => 
    !!(
      property.address?.formattedAddress || property.address?.address1 &&
      property.propertyType?.trim() &&
      property.propertyStatus?.trim() &&
      property.occupancyType?.trim()
    )
  );
}

/**
 * Validate real estate step and return detailed errors
 */
export function validateRealEstate(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const realEstate = state.realEstateData[clientId];
  
  // Real estate is optional, but if it exists, validate it
  if (realEstate && realEstate.records && realEstate.records.length > 0) {
    realEstate.records.forEach((property, index) => {
      if (!property.address?.formattedAddress && !property.address?.address1) {
        errors.push({ field: `realEstate.${index}.address`, message: `Property address is required for property ${index + 1}` });
      }
      
      if (!property.propertyType?.trim()) {
        errors.push({ field: `realEstate.${index}.propertyType`, message: `Property type is required for property ${index + 1}` });
      }
      
      if (!property.propertyStatus?.trim()) {
        errors.push({ field: `realEstate.${index}.propertyStatus`, message: `Property status is required for property ${index + 1}` });
      }
      
      if (!property.occupancyType?.trim()) {
        errors.push({ field: `realEstate.${index}.occupancyType`, message: `Occupancy type is required for property ${index + 1}` });
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Check if documents step is complete
 */
function isDocumentsComplete(state: ApplicationState, clientId: string): boolean {
  const documents = state.documentsData[clientId]?.documents || [];
  const client = state.clientData[clientId];
  const employmentRecords = state.employmentData[clientId]?.records || [];
  const assets = state.assetsData[clientId]?.records || [];
  
  if (!client || !client.firstName) {
    return false;
  }
  
  // Generate required conditions based on application data
  const requiredConditions = generateConditions({
    clientId,
    client,
    employmentData: employmentRecords,
    assets
  });
  
  if (requiredConditions.length === 0) {
    return false; // No conditions means incomplete data
  }
  
  // Check if all required conditions have uploaded documents (at least one per condition)
  const uploadedConditionIds = new Set(
    documents
      .filter(doc => doc.status === 'uploaded' || doc.status === 'verified')
      .map(doc => doc.conditionId || doc.id) // Support both old and new structure
  );
  
  return requiredConditions.every(condition => uploadedConditionIds.has(condition.id));
}

/**
 * Validate documents step and return detailed errors
 */
export function validateDocuments(state: ApplicationState, clientId: string): StepValidationResult {
  const errors: ValidationError[] = [];
  const documents = state.documentsData[clientId]?.documents || [];
  const client = state.clientData[clientId];
  const employmentRecords = state.employmentData[clientId]?.records || [];
  const assets = state.assetsData[clientId]?.records || [];
  
  if (!client || !client.firstName) {
    return { isValid: false, errors: [{ field: 'client', message: 'Client information must be completed first' }] };
  }
  
  // Generate required conditions
  const requiredConditions = generateConditions({
    clientId,
    client,
    employmentData: employmentRecords,
    assets
  });
  
  if (requiredConditions.length === 0) {
    return { isValid: false, errors: [{ field: 'documents', message: 'No documents required yet. Complete previous steps first.' }] };
  }
  
  // Check which documents are missing (need at least one document per condition)
  const uploadedConditionIds = new Set(
    documents
      .filter(doc => doc.status === 'uploaded' || doc.status === 'verified')
      .map(doc => doc.conditionId || doc.id) // Support both old and new structure
  );
  
  const missingDocuments = requiredConditions.filter(condition => !uploadedConditionIds.has(condition.id));
  
  missingDocuments.forEach(condition => {
    errors.push({ field: `document.${condition.id}`, message: condition.title });
  });
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate a specific step
 */
export function validateStep(stepId: ApplicationStepId, state?: ApplicationState): StepValidationResult {
  const appState = state || get(applicationStore);
  const clientId = appState.activeClientId;
  
  if (!clientId) {
    return { isValid: false, errors: [{ field: 'client', message: 'No active client' }] };
  }
  
  switch (stepId) {
    case 'client-info':
      return validateClientInfo(appState, clientId);
    case 'employment':
      return validateEmployment(appState, clientId);
    case 'income':
      return validateIncome(appState, clientId);
    case 'assets':
      return validateAssets(appState, clientId);
    case 'real-estate':
      return validateRealEstate(appState, clientId);
    case 'documents':
      return validateDocuments(appState, clientId);
    case 'dictate':
    case 'review':
      // These steps don't have validation
      return { isValid: true, errors: [] };
    default:
      return { isValid: false, errors: [{ field: 'step', message: 'Unknown step' }] };
  }
}

/**
 * Check if a step is complete for the active client
 */
export function isStepComplete(stepId: ApplicationStepId, state?: ApplicationState): boolean {
  // If state is provided, use it; otherwise import dynamically to avoid circular dependency
  if (!state) {
    // This will be called from getStepStatus which has access to the store
    return false; // Will be handled by the caller
  }
  
  const clientId = state.activeClientId;
  
  if (!clientId) return false;
  
  switch (stepId) {
    case 'client-info':
      return isClientInfoComplete(state, clientId);
    case 'employment':
      return isEmploymentComplete(state, clientId);
    case 'income':
      return isIncomeComplete(state, clientId);
    case 'assets':
      return isAssetsComplete(state, clientId);
    case 'real-estate':
      return isRealEstateComplete(state, clientId);
    case 'documents':
      return isDocumentsComplete(state, clientId);
    case 'dictate':
    case 'review':
      // These steps don't have completion criteria yet
      return true;
    default:
      return false;
  }
}

/**
 * Get step status: 'completed', 'incomplete', 'current', or 'pending'
 */
export function getStepStatus(stepId: ApplicationStepId, currentStepId: ApplicationStepId, state?: ApplicationState): 'completed' | 'incomplete' | 'current' | 'pending' {
  if (stepId === currentStepId) {
    return 'current';
  }
  
  // Import step definitions to get the order
  const stepOrder: ApplicationStepId[] = [
    'client-info',
    'employment',
    'income',
    'assets',
    'real-estate',
    'documents',
    'dictate',
    'review'
  ];
  
  const stepIndex = stepOrder.indexOf(stepId);
  const currentIndex = stepOrder.indexOf(currentStepId);
  
  if (stepIndex < 0 || currentIndex < 0) {
    return 'pending';
  }
  
  if (stepIndex < currentIndex) {
    // Step is before current - check if it's complete
    if (state) {
      return isStepComplete(stepId, state) ? 'completed' : 'incomplete';
    }
    // If no state provided, we can't determine - will be handled by caller
    return 'pending';
  }
  
  return 'pending';
}
