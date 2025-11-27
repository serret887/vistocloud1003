/**
 * Step validation and completion checking
 */

import type { ApplicationState } from './stores/application';
import type { ApplicationStepId } from './types/application';
import { get } from 'svelte/store';
import { applicationStore } from './stores/application';

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
 * Check if a step is complete for the active client
 */
export function isStepComplete(stepId: ApplicationStepId): boolean {
  const state = get(applicationStore);
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
export function getStepStatus(stepId: ApplicationStepId, currentStepId: ApplicationStepId): 'completed' | 'incomplete' | 'current' | 'pending' {
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
    return isStepComplete(stepId) ? 'completed' : 'incomplete';
  }
  
  return 'pending';
}

