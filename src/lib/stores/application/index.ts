// Main Application Store - Refactored
import { writable, get } from 'svelte/store';
import type { ApplicationState, ValidationError } from './types';
import type { ApplicationStepId } from '$lib/types/application';
import { validateStep } from '$lib/validation/index';
import { debug } from '$lib/debug';
import { saveAllClientDataToFirebase, saveApplicationToFirebase, createApplicationInFirebase } from '$lib/firebase/save';
import { loadApplicationFromFirebase } from '$lib/firebase/load';
import { resetLastSavedHash } from '$lib/auto-save';

// Import defaults and actions
import * as defaults from './defaults';
import { createClientActions, createAddressActions, createEmploymentActions, createIncomeActions, createAssetsActions, createRealEstateActions, createDocumentsActions, createValidationActions } from './actions';
import { createDerivedStores } from './derived';

// Re-export types
export type { ApplicationState, DocumentRecord, DocumentHistoryEntry, ClientDocumentsData } from './types';

// Create initial state
function createInitialState(): ApplicationState {
  const primaryClientId = 'client-1';
  return {
    currentApplicationId: null,
    activeClientId: primaryClientId,
    clientIds: [primaryClientId],
    currentStepId: 'client-info',
    clientData: { [primaryClientId]: defaults.createDefaultClientData() },
    addressData: { [primaryClientId]: defaults.createDefaultAddressData(primaryClientId) },
    employmentData: { [primaryClientId]: defaults.createDefaultEmploymentData(primaryClientId) },
    incomeData: { [primaryClientId]: defaults.createDefaultIncomeData(primaryClientId) },
    assetsData: { [primaryClientId]: defaults.createDefaultAssetsData(primaryClientId) },
    realEstateData: { [primaryClientId]: defaults.createDefaultRealEstateData(primaryClientId) },
    documentsData: { [primaryClientId]: defaults.createDefaultDocumentsData(primaryClientId) },
    isLoading: false,
    isSaving: false,
    lastSaved: null,
    validationErrors: {},
    visitedSteps: {},
    touchedFields: {}
  };
}

// Create the main store
function createApplicationStore() {
  const { subscribe, set, update } = writable<ApplicationState>(createInitialState());
  const getStore = () => get({ subscribe });
  
  // Compose all actions
  const clientActions = createClientActions(update);
  const addressActions = createAddressActions(update);
  const employmentActions = createEmploymentActions(update);
  const incomeActions = createIncomeActions(update);
  const assetsActions = createAssetsActions(update);
  const realEstateActions = createRealEstateActions(update);
  const documentsActions = createDocumentsActions(update);
  const validationActions = createValidationActions(update, getStore);
  
  return {
    subscribe,
    reset: () => set(createInitialState()),
    
    // Firebase operations
    createApplication: async () => {
      const state = getStore();
      try {
        const appId = await createApplicationInFirebase(state);
        update(s => ({ ...s, currentApplicationId: appId }));
        debug.log('✅ Application created:', appId);
        return appId;
      } catch (error) {
        debug.error('Failed to create application:', error);
        throw error;
      }
    },
    
    setApplicationId: (appId: string) => {
      update(state => ({ ...state, currentApplicationId: appId }));
    },
    
    loadApplication: async (applicationId: string) => {
      update(s => ({ ...s, isLoading: true }));
      try {
        const loadedState = await loadApplicationFromFirebase(applicationId);
        if (!loadedState) throw new Error(`Application ${applicationId} not found`);
        
        set(loadedState);
        resetLastSavedHash();
        
        // On fresh load, always start with NO visited steps and NO validation errors
        // This gives users a clean experience each session
        // Validation kicks in naturally as they navigate between steps
        const visitedSteps: Record<string, Set<ApplicationStepId>> = {};
        const validationErrors: Record<string, Record<ApplicationStepId, ValidationError[]>> = {};
        const touchedFields: Record<string, Set<string>> = {};
        
        for (const clientId of loadedState.clientIds) {
          visitedSteps[clientId] = new Set();
          validationErrors[clientId] = {} as Record<ApplicationStepId, ValidationError[]>;
          touchedFields[clientId] = new Set();
        }
        
        update(s => ({ ...s, validationErrors, visitedSteps, touchedFields, isLoading: false }));
        debug.log('✅ Application loaded');
      } catch (error) {
        update(s => ({ ...s, isLoading: false }));
        throw error;
      }
    },
    
    saveToFirebase: async () => {
      const state = getStore();
      if (!state.currentApplicationId) throw new Error('No application ID set');
      
      update(s => ({ ...s, isSaving: true }));
      try {
        const savePromises = state.clientIds.map(clientId =>
          saveAllClientDataToFirebase(state.currentApplicationId!, clientId, {
            clientData: state.clientData[clientId],
            addressData: state.addressData[clientId],
            employmentData: state.employmentData[clientId],
            incomeData: state.incomeData[clientId],
            assetsData: state.assetsData[clientId],
            realEstateData: state.realEstateData[clientId]
          })
        );
        savePromises.push(saveApplicationToFirebase(state.currentApplicationId, state));
        await Promise.all(savePromises);
        
        update(s => ({ ...s, isSaving: false, lastSaved: new Date().toISOString() }));
        resetLastSavedHash();
        debug.log('✅ Application saved');
      } catch (error) {
        update(s => ({ ...s, isSaving: false }));
        throw error;
      }
    },
    
    // Navigation
    setCurrentStep: async (stepId: ApplicationStepId) => {
      const state = getStore();
      const previousStepId = state.currentStepId;
      const activeClientId = state.activeClientId;
      
      // When LEAVING a step, validate it and mark as visited
      // Skip validation for dictate/review - they're not data steps
      if (previousStepId !== stepId && previousStepId && state.currentApplicationId && activeClientId) {
        if (previousStepId !== 'dictate' && previousStepId !== 'review') {
          try {
            const validation = validateStep(previousStepId, state);
            update(s => {
              const visitedSteps = { ...s.visitedSteps };
              if (!visitedSteps[activeClientId]) visitedSteps[activeClientId] = new Set();
              visitedSteps[activeClientId].add(previousStepId);
              
              const validationErrors = { ...s.validationErrors };
              if (!validationErrors[activeClientId]) validationErrors[activeClientId] = {} as Record<ApplicationStepId, ValidationError[]>;
              validationErrors[activeClientId][previousStepId] = validation.errors;
              
              return { ...s, validationErrors, visitedSteps };
            });
          } catch (error) {
            console.error('Validation error:', error);
          }
        }
      }
      
      update(s => ({ ...s, currentStepId: stepId }));
      
      // Only validate on ENTERING if this step was ALREADY visited before (revisiting)
      // First visit = no validation shown
      if (stepId !== previousStepId && activeClientId && stepId !== 'dictate' && stepId !== 'review') {
        const newState = getStore();
        const visitedSteps = newState.visitedSteps?.[activeClientId];
        const hasBeenVisited = visitedSteps instanceof Set && visitedSteps.has(stepId);
        
        if (hasBeenVisited) {
          try {
            const validation = validateStep(stepId, newState);
            update(s => {
              const validationErrors = { ...s.validationErrors };
              if (!validationErrors[activeClientId]) validationErrors[activeClientId] = {} as Record<ApplicationStepId, ValidationError[]>;
              validationErrors[activeClientId][stepId] = validation.errors;
              return { ...s, validationErrors };
            });
          } catch (error) {
            console.error('Validation error on step entry:', error);
          }
        }
      }
      
      if (state.currentApplicationId && previousStepId !== stepId) {
        try { await applicationStore.saveToFirebase(); } catch (error) { console.error('Auto-save failed:', error); }
      }
    },
    
    // UI State
    setLoading: (loading: boolean) => update(state => ({ ...state, isLoading: loading })),
    setSaving: (saving: boolean) => update(state => ({ ...state, isSaving: saving })),
    setLastSaved: (timestamp: string) => update(state => ({ ...state, lastSaved: timestamp })),
    
    // Spread all domain actions
    ...clientActions,
    ...addressActions,
    ...employmentActions,
    ...incomeActions,
    ...assetsActions,
    ...realEstateActions,
    ...documentsActions,
    ...validationActions
  };
}

// Export the store singleton
export const applicationStore = createApplicationStore();

// Create and export derived stores
const derivedStores = createDerivedStores(applicationStore);

export const activeClientId = derivedStores.activeClientId;
export const currentStepId = derivedStores.currentStepId;
export const clientIds = derivedStores.clientIds;
export const activeClientData = derivedStores.activeClientData;
export const activeEmploymentData = derivedStores.activeEmploymentData;
export const activeAssetsData = derivedStores.activeAssetsData;
export const activeRealEstateData = derivedStores.activeRealEstateData;
export const activeAddressData = derivedStores.activeAddressData;
export const activeIncomeData = derivedStores.activeIncomeData;
export const currentStepValidationErrors = derivedStores.currentStepValidationErrors;


