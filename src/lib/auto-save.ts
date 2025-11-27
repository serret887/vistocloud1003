/**
 * Auto-save functionality for application data
 * Saves to Firebase after 2 minutes of inactivity (only if data has changed)
 */

import { get } from 'svelte/store';
import { applicationStore } from './stores/application';
import type { ApplicationState } from './stores/application';
import { debug } from './debug';
import { browser } from '$app/environment';

// Auto-save delay: 2 minutes (120,000 milliseconds)
// In development, you can reduce this for testing (e.g., 10 seconds = 10000)
const AUTO_SAVE_DELAY = import.meta.env.DEV 
  ? (parseInt(import.meta.env.PUBLIC_AUTO_SAVE_DELAY || '120000', 10))
  : 2 * 60 * 1000;

// Store the last saved state hash to detect changes
let lastSavedStateHash: string | null = null;
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
let isAutoSaving = false;

/**
 * Generate a hash of the application state to detect changes
 * Excludes metadata fields that change on every update (like lastSaved, isSaving)
 */
function hashApplicationState(state: ApplicationState): string {
  // Create a simplified state object without metadata
  const stateToHash = {
    currentApplicationId: state.currentApplicationId,
    activeClientId: state.activeClientId,
    clientIds: state.clientIds,
    currentStepId: state.currentStepId,
    clientData: state.clientData,
    addressData: state.addressData,
    employmentData: state.employmentData,
    incomeData: state.incomeData,
    assetsData: state.assetsData,
    realEstateData: state.realEstateData
  };
  
  // Use full JSON string for more accurate change detection
  // Sort keys to ensure consistent hashing
  const jsonString = JSON.stringify(stateToHash, Object.keys(stateToHash).sort());
  return jsonString;
}

/**
 * Check if the application state has changed since last save
 */
function hasStateChanged(): boolean {
  const state = get(applicationStore);
  
  // If no application ID, nothing to save
  if (!state.currentApplicationId) {
    debug.log('⏭️ No application ID for change detection');
    return false;
  }
  
  const currentHash = hashApplicationState(state);
  
  // If we haven't saved yet, check if there's actual data
  if (lastSavedStateHash === null) {
    // Only consider it changed if there's actual data (not just empty state)
    const hasData = state.clientIds.length > 0 && 
                    Object.keys(state.clientData).length > 0;
    if (hasData) {
      debug.log('📝 First save detected (has data)');
      return true;
    }
    debug.log('⏭️ No data to save yet');
    return false;
  }
  
  const hasChanged = currentHash !== lastSavedStateHash;
  if (hasChanged) {
    debug.log('📝 State has changed since last save');
  } else {
    debug.log('⏭️ State unchanged since last save');
  }
  return hasChanged;
}

/**
 * Perform the auto-save operation
 */
async function performAutoSave(): Promise<void> {
  const state = get(applicationStore);
  
  // Don't save if no application ID
  if (!state.currentApplicationId) {
    debug.log('⏭️ Auto-save skipped: no application ID');
    return;
  }
  
  // Don't save if already saving
  if (state.isSaving || isAutoSaving) {
    debug.log('⏭️ Auto-save skipped: already saving');
    return;
  }
  
  // Check if state has actually changed
  if (!hasStateChanged()) {
    debug.log('⏭️ Auto-save skipped: no changes detected');
    return;
  }
  
  isAutoSaving = true;
  debug.log('💾 Auto-saving application (2-minute timeout)...');
  
  try {
    console.log('💾 [AUTO-SAVE] Starting save operation...');
    console.log('💾 [AUTO-SAVE] Application ID:', state.currentApplicationId);
    
    await applicationStore.saveToFirebase();
    
    // Wait a bit for the store to update after save
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Update the last saved hash after successful save
    const newState = get(applicationStore);
    lastSavedStateHash = hashApplicationState(newState);
    
    debug.log('✅ Auto-save completed successfully');
    console.log('✅ [AUTO-SAVE] Save completed successfully');
    console.log('✅ [AUTO-SAVE] Hash updated, next change will trigger new save');
  } catch (error) {
    debug.error('❌ Auto-save failed:', error);
    console.error('❌ [AUTO-SAVE] Save failed:', error);
    console.error('❌ [AUTO-SAVE] Error details:', error);
    // Don't throw - auto-save failures shouldn't break the app
  } finally {
    isAutoSaving = false;
  }
}

/**
 * Reset the auto-save timer (call this when state changes)
 */
function resetAutoSaveTimer(): void {
  // Clear existing timer
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
  
  // Don't set timer if no application ID
  const state = get(applicationStore);
  if (!state.currentApplicationId) {
    return;
  }
  
  // Set new timer
  autoSaveTimer = setTimeout(() => {
    performAutoSave();
  }, AUTO_SAVE_DELAY);
  
  const minutes = AUTO_SAVE_DELAY / 1000 / 60;
  debug.log(`⏱️ Auto-save timer reset (will save in ${minutes} minutes if unchanged)`);
}

/**
 * Initialize auto-save functionality
 * Call this once when the app loads
 */
export function initAutoSave(): (() => void) | undefined {
  if (!browser) {
    return; // Only run in browser
  }
  
  debug.log('🔄 Initializing auto-save (2-minute debounce)');
  
  let lastStateHash: string | null = null;
  
  // Subscribe to store changes
  const unsubscribe = applicationStore.subscribe((state) => {
    // Skip if no application ID
    if (!state.currentApplicationId) {
      return;
    }
    
    // Skip if this is just a metadata update (isSaving, lastSaved, etc.)
    // We only care about actual data changes
    const currentHash = hashApplicationState(state);
    
    // Only reset timer if the actual data changed (not just metadata)
    if (currentHash !== lastStateHash) {
      lastStateHash = currentHash;
      resetAutoSaveTimer();
      debug.log('📝 State changed, auto-save timer reset');
    }
  });
  
  // Return unsubscribe function for cleanup
  return unsubscribe;
}

/**
 * Manually trigger auto-save (useful for testing or manual saves)
 */
export async function triggerAutoSave(): Promise<void> {
  await performAutoSave();
}

/**
 * Clear the auto-save timer (useful for cleanup)
 */
export function clearAutoSaveTimer(): void {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
}

/**
 * Reset the last saved state hash (useful after manual saves)
 */
export function resetLastSavedHash(): void {
  const state = get(applicationStore);
  if (state.currentApplicationId) {
    lastSavedStateHash = hashApplicationState(state);
    debug.log('🔄 Last saved hash reset');
  }
}

