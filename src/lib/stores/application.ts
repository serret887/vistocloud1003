import { writable, derived, get } from 'svelte/store';
import type { ClientData } from '$lib/types/client-data';
import type { ClientEmploymentData, EmploymentRecord } from '$lib/types/employment';
import type { ClientIncomeData, ActiveIncomeRecord, PassiveIncomeRecord, IncomeTotal } from '$lib/types/income';
import type { ClientAssetsData, AssetRecord } from '$lib/types/assets';
import type { ClientRealEstateData, RealEstateOwned } from '$lib/types/real-estate';
import type { ClientAddressData, AddressRecord } from '$lib/types/address';
import type { ApplicationStepId } from '$lib/types/application';
import type { ValidationError } from '$lib/stepValidation';
import { validateStep } from '$lib/stepValidation';
import { generateId } from '$lib/idGenerator';
// Validation is handled in UI components on blur, not in the store
import { debug } from '$lib/debug';
import { saveAllClientDataToFirebase, saveApplicationToFirebase, createApplicationInFirebase } from '$lib/firebase/save';
import { loadApplicationFromFirebase } from '$lib/firebase/load';
import { resetLastSavedHash } from '$lib/auto-save';

// Default empty address
const createEmptyAddress = () => ({
  address1: '',
  address2: '',
  formattedAddress: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  lat: 0,
  lng: 0
});

// Default client data
const createDefaultClientData = (): ClientData => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  ssn: '',
  dob: '',
  citizenship: '',
  maritalStatus: '',
  hasMilitaryService: false,
  militaryNote: null,
  generalNotes: ''
});

// Default address data
const createDefaultAddressData = (clientId: string): ClientAddressData => ({
  present: {
    id: generateId('addr'),
    fromDate: '',
    toDate: '',
    addr: createEmptyAddress(),
    isPresent: true
  },
  former: [],
  mailing: {
    id: generateId('addr'),
    fromDate: '',
    toDate: '',
    addr: createEmptyAddress(),
    isPresent: false
  }
});

// Default employment data
const createDefaultEmploymentData = (clientId: string): ClientEmploymentData => ({
  clientId,
  records: [],
  totalCoverageMonths: 0,
  hasGaps: false,
  isComplete: false,
  employmentNote: null
});

// Default income data
const createDefaultIncomeData = (clientId: string): ClientIncomeData => ({
  clientId,
  activeIncomeRecords: [],
  passiveIncomeRecords: [],
  totals: {
    id: generateId('income-total'),
    clientId,
    totalMonthlyIncome: 0
  },
  completionStatus: 'empty',
  lastUpdated: new Date().toISOString(),
  validationErrors: []
});

// Default assets data
const createDefaultAssetsData = (clientId: string): ClientAssetsData => ({
  clientId,
  records: []
});

// Default real estate data
const createDefaultRealEstateData = (clientId: string): ClientRealEstateData => ({
  clientId,
  records: [],
  totalValue: 0,
  hasCurrentResidence: false,
  isComplete: false
});

// Document types
export interface DocumentRecord {
  id: string;
  conditionId: string; // Links to condition ID
  type: 'id' | 'income' | 'bank' | 'employment';
  filename: string;
  sizeBytes: number;
  mimeType: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadedAt: string | null;
  uploadedBy?: string; // Who uploaded it
  verifiedAt: string | null;
  verifiedBy?: string; // Who verified it
  notes?: string;
  version?: number; // Track multiple uploads of same document
}

// Document history entry
export interface DocumentHistoryEntry {
  id: string;
  documentId: string;
  action: 'uploaded' | 'removed' | 'verified' | 'rejected' | 'note_added';
  timestamp: string;
  user: string;
  note?: string;
  filename?: string;
}

export interface ClientDocumentsData {
  clientId: string;
  documents: DocumentRecord[];
  history: DocumentHistoryEntry[]; // History of all document actions
  conditionNotes: Record<string, string[]>; // Notes per condition ID
}

// Default documents data
const createDefaultDocumentsData = (clientId: string): ClientDocumentsData => ({
  clientId,
  documents: [],
  history: [],
  conditionNotes: {}
});

// Application state interface
export interface ApplicationState {
  currentApplicationId: string | null;
  activeClientId: string;
  clientIds: string[];
  currentStepId: ApplicationStepId;
  
  // Client data by ID
  clientData: Record<string, ClientData>;
  addressData: Record<string, ClientAddressData>;
  employmentData: Record<string, ClientEmploymentData>;
  incomeData: Record<string, ClientIncomeData>;
  assetsData: Record<string, ClientAssetsData>;
  realEstateData: Record<string, ClientRealEstateData>;
  documentsData: Record<string, ClientDocumentsData>;
  
  // UI State
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  
  // Validation errors by client and step
  validationErrors: Record<string, Record<ApplicationStepId, ValidationError[]>>; // clientId -> stepId -> errors
  
  // Track which steps have been visited (navigated away from) per client
  visitedSteps: Record<string, Set<ApplicationStepId>>; // clientId -> Set of visited steps
  
  // Track which fields have been touched (blurred) - only show errors for touched fields per client
  touchedFields: Record<string, Set<string>>; // clientId -> Set of "stepId.fieldPath"
}

// Initial state
const createInitialState = (): ApplicationState => {
  const primaryClientId = 'client-1';
  return {
    currentApplicationId: null,
    activeClientId: primaryClientId,
    clientIds: [primaryClientId],
    currentStepId: 'client-info',
    
    clientData: {
      [primaryClientId]: createDefaultClientData()
    },
    addressData: {
      [primaryClientId]: createDefaultAddressData(primaryClientId)
    },
    employmentData: {
      [primaryClientId]: createDefaultEmploymentData(primaryClientId)
    },
    incomeData: {
      [primaryClientId]: createDefaultIncomeData(primaryClientId)
    },
    assetsData: {
      [primaryClientId]: createDefaultAssetsData(primaryClientId)
    },
    realEstateData: {
      [primaryClientId]: createDefaultRealEstateData(primaryClientId)
    },
    documentsData: {
      [primaryClientId]: createDefaultDocumentsData(primaryClientId)
    },
    
    isLoading: false,
    isSaving: false,
    lastSaved: null,
    validationErrors: {} as Record<string, Record<ApplicationStepId, ValidationError[]>>,
    visitedSteps: {} as Record<string, Set<ApplicationStepId>>,
    touchedFields: {} as Record<string, Set<string>>
  };
};

// Create the main store
function createApplicationStore() {
  const { subscribe, set, update } = writable<ApplicationState>(createInitialState());
  
  return {
    subscribe,
    
    // Reset store
    reset: () => set(createInitialState()),
    
    // Create a new application in Firestore and set the returned ID
    createApplication: async () => {
      const state = get(applicationStore);
      
      try {
        // Create application in Firestore (Firestore will auto-generate the ID)
        const appId = await createApplicationInFirebase(state);
        
        // Update store with the Firestore-generated ID
        update(s => {
          debug.log('Application created with Firestore ID:', appId);
          return { ...s, currentApplicationId: appId };
        });
        
        debug.log('✅ Application created in Firestore with ID:', appId);
        return appId;
      } catch (error) {
        debug.error('Failed to create application in Firestore:', error);
        throw error;
      }
    },
    
    // Set application ID (for loading existing applications)
    setApplicationId: (appId: string) => {
      update(state => {
        debug.log('Setting application ID:', appId);
        return { ...state, currentApplicationId: appId };
      });
    },
    
    // Load application from Firestore and hydrate the store
    loadApplication: async (applicationId: string) => {
      update(s => ({ ...s, isLoading: true }));
      
      try {
        debug.group(`Loading application ${applicationId} from Firestore`);
        console.log('📥 [STORE] Loading application:', applicationId);
        
        const loadedState = await loadApplicationFromFirebase(applicationId);
        
        if (!loadedState) {
          debug.warn(`Application ${applicationId} not found`);
          console.warn('⚠️ [STORE] Application not found:', applicationId);
          update(s => ({ ...s, isLoading: false }));
          throw new Error(`Application ${applicationId} not found`);
        }
        
        // Update store with loaded state
        set(loadedState);
        
        // Reset auto-save hash to match loaded state
        resetLastSavedHash();
        
        // Validate all steps after loading to ensure status is correct (per client)
        const stepIds: ApplicationStepId[] = ['client-info', 'employment', 'income', 'assets', 'real-estate', 'documents'];
        const freshValidationErrors: Record<string, Record<ApplicationStepId, ValidationError[]>> = {};
        const visitedSteps: Record<string, Set<ApplicationStepId>> = {};
        
        // Validate for each client
        for (const clientId of loadedState.clientIds) {
          if (!visitedSteps[clientId]) {
            visitedSteps[clientId] = new Set<ApplicationStepId>();
          }
          if (!freshValidationErrors[clientId]) {
            freshValidationErrors[clientId] = {} as Record<ApplicationStepId, ValidationError[]>;
          }
          
          // Temporarily set active client for validation
          const originalActiveClientId = loadedState.activeClientId;
          loadedState.activeClientId = clientId;
          
          for (const stepId of stepIds) {
            try {
              const validation = validateStep(stepId, loadedState);
              freshValidationErrors[clientId][stepId] = validation.errors;
              
              // If step has errors, mark it as visited so errors will show when user navigates to it
              if (validation.errors.length > 0) {
                visitedSteps[clientId].add(stepId);
              }
            } catch (error) {
              console.warn(`Failed to validate step ${stepId} for client ${clientId} after load:`, error);
              freshValidationErrors[clientId][stepId] = [];
            }
          }
          
          // Restore original active client
          loadedState.activeClientId = originalActiveClientId;
        }
        
        // Update store with fresh validation errors and visited steps
        update(s => ({
          ...s,
          validationErrors: freshValidationErrors,
          visitedSteps
        }));
        
        debug.log('✅ Application loaded and store hydrated');
        console.log('✅ [STORE] Application loaded successfully');
        debug.groupEnd();
        
        update(s => ({ ...s, isLoading: false }));
      } catch (error) {
        debug.error('❌ Failed to load application:', error);
        console.error('❌ [STORE] Failed to load application:', error);
        update(s => ({ ...s, isLoading: false }));
        debug.groupEnd();
        throw error;
      }
    },
    
    // Save entire application to Firebase
    saveToFirebase: async () => {
      const state = get(applicationStore);
      
      if (!state.currentApplicationId) {
        debug.warn('Cannot save: no application ID set');
        throw new Error('No application ID set');
      }
      
      debug.group('Saving application to Firebase');
      debug.log('Application ID:', state.currentApplicationId);
      console.log('💾 [STORE] Starting saveToFirebase...');
      console.log('💾 [STORE] Application ID:', state.currentApplicationId);
      console.log('💾 [STORE] Client IDs:', state.clientIds);
      console.log('💾 [STORE] Has client data:', Object.keys(state.clientData).length > 0);
      
      update(s => ({ ...s, isSaving: true }));
      
      try {
        console.log('💾 [STORE] Creating save promises for', state.clientIds.length, 'clients');
        
        // Save all client data
        const savePromises = state.clientIds.map(clientId => {
          const clientData = state.clientData[clientId];
          console.log('💾 [STORE] Saving data for client:', clientId);
          console.log('💾 [STORE] Client data being saved:', {
            citizenship: clientData?.citizenship,
            maritalStatus: clientData?.maritalStatus,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName,
            email: clientData?.email,
            phone: clientData?.phone,
            ssn: clientData?.ssn,
            dob: clientData?.dob,
            hasMilitaryService: clientData?.hasMilitaryService
          });
          return saveAllClientDataToFirebase(state.currentApplicationId!, clientId, {
            clientData: clientData,
            addressData: state.addressData[clientId],
            employmentData: state.employmentData[clientId],
            incomeData: state.incomeData[clientId],
            assetsData: state.assetsData[clientId],
            realEstateData: state.realEstateData[clientId]
          });
        });
        
        // Also save the main application document
        console.log('💾 [STORE] Adding main application document save');
        savePromises.push(saveApplicationToFirebase(state.currentApplicationId, state));
        
        console.log('💾 [STORE] Executing', savePromises.length, 'save operations...');
        await Promise.all(savePromises);
        console.log('✅ [STORE] All save operations completed');
        
        debug.log('✅ Application saved successfully');
        update(s => ({ 
          ...s, 
          isSaving: false, 
          lastSaved: new Date().toISOString() 
        }));
        
        // Reset auto-save hash after successful save
        resetLastSavedHash();
        
        debug.groupEnd();
      } catch (error) {
        debug.error('❌ Failed to save application:', error);
        update(s => ({ ...s, isSaving: false }));
        debug.groupEnd();
        throw error;
      }
    },
    
    // Set active client
    setActiveClient: (clientId: string) => {
      update(state => ({ ...state, activeClientId: clientId }));
    },
    
    // Set current step (with validation and auto-save)
    setCurrentStep: async (stepId: ApplicationStepId) => {
      const state = get(applicationStore);
      const previousStepId = state.currentStepId;
      
      const activeClientId = state.activeClientId;
      
      // Validate previous step before leaving (if we're moving to a different step)
      // Only validate if we have a valid previous step and it's not the initial load
      if (previousStepId !== stepId && previousStepId && state.currentApplicationId && activeClientId) {
        try {
          const validation = validateStep(previousStepId, state);
          
          // Store validation errors for the previous step per client
          // Mark the previous step as visited (user navigated away from it)
          update(s => {
            const visitedSteps = { ...s.visitedSteps };
            if (!visitedSteps[activeClientId]) {
              visitedSteps[activeClientId] = new Set<ApplicationStepId>();
            }
            visitedSteps[activeClientId].add(previousStepId);
            
            const validationErrors = { ...s.validationErrors };
            if (!validationErrors[activeClientId]) {
              validationErrors[activeClientId] = {} as Record<ApplicationStepId, ValidationError[]>;
            }
            validationErrors[activeClientId][previousStepId] = validation.errors;
            
            return {
              ...s,
              validationErrors,
              visitedSteps
            };
          });
          
          // Log validation results
          if (!validation.isValid) {
            console.warn(`⚠️ [VALIDATION] Step ${previousStepId} for client ${activeClientId} has ${validation.errors.length} error(s):`, validation.errors);
          }
        } catch (error) {
          // Don't block navigation if validation fails
          console.error('Validation error:', error);
        }
      }
      
      // Update step first
      update(s => ({ ...s, currentStepId: stepId }));
      
      // When entering a step, validate it immediately if it's been visited before
      // This ensures errors are shown when revisiting
      if (stepId !== previousStepId && activeClientId) {
        try {
          // Get fresh state after updating currentStepId
          const newState = get(applicationStore);
          const validation = validateStep(stepId, newState);
          
          update(s => {
            const validationErrors = { ...s.validationErrors };
            if (!validationErrors[activeClientId]) {
              validationErrors[activeClientId] = {} as Record<ApplicationStepId, ValidationError[]>;
            }
            validationErrors[activeClientId][stepId] = validation.errors;
            
            return {
              ...s,
              validationErrors
            };
          });
        } catch (error) {
          console.error('Validation error on step entry:', error);
        }
      }
      
      // Auto-save to Firebase when changing steps (if application ID exists)
      if (state.currentApplicationId && previousStepId !== stepId) {
        debug.log(`Step changed from ${previousStepId} to ${stepId} - auto-saving...`);
        console.log(`💾 [STORE] Step changed from ${previousStepId} to ${stepId} - saving...`);
        try {
          await applicationStore.saveToFirebase();
          debug.log('✅ Auto-saved on step change');
          console.log('✅ [STORE] Auto-saved on step change');
        } catch (error) {
          debug.error('Failed to auto-save on step change:', error);
          console.error('❌ [STORE] Failed to auto-save on step change:', error);
          // Don't throw - allow step change even if save fails
        }
      }
    },
    
    // Clear validation errors for a step (per client)
    clearValidationErrors: (stepId: ApplicationStepId) => {
      update(s => {
        const clientId = s.activeClientId;
        if (!clientId) return s;
        
        const validationErrors = { ...s.validationErrors };
        if (validationErrors[clientId]) {
          const clientErrors = { ...validationErrors[clientId] };
          delete clientErrors[stepId];
          validationErrors[clientId] = clientErrors;
        }
        return { ...s, validationErrors };
      });
    },
    
    // Mark a field as touched (blurred) - only show errors for touched fields
    markFieldTouched: (fieldPath: string) => {
      update(s => {
        const clientId = s.activeClientId;
        if (!clientId) return s;
        
        const touchedFields = { ...s.touchedFields };
        if (!touchedFields[clientId]) {
          touchedFields[clientId] = new Set<string>();
        }
        touchedFields[clientId].add(`${s.currentStepId}.${fieldPath}`);
        return { ...s, touchedFields };
      });
    },
    
    // Re-validate current step (called on blur for individual fields)
    // This updates errors for field-level validation (red borders) but doesn't mark step as visited
    // Only updates errors if the step has been visited (navigated away from)
    revalidateCurrentStep: () => {
      const state = get(applicationStore);
      const currentStepId = state.currentStepId;
      const clientId = state.activeClientId;
      
      if (!currentStepId || !clientId) return;
      
      try {
        const validation = validateStep(currentStepId, state);
        
        // Only update validation errors if the step has been visited (navigated away from)
        // This prevents showing the big error box while actively typing
        // Field-level errors (red borders) will still work via hasFieldError()
        const clientVisitedSteps = state.visitedSteps[clientId];
        if (clientVisitedSteps?.has(currentStepId)) {
          update(s => {
            const validationErrors = { ...s.validationErrors };
            if (!validationErrors[clientId]) {
              validationErrors[clientId] = {} as Record<ApplicationStepId, ValidationError[]>;
            }
            validationErrors[clientId][currentStepId] = validation.errors;
            
            return {
              ...s,
              validationErrors
            };
          });
        }
      } catch (error) {
        console.error('Re-validation error:', error);
      }
    },
    
    // Add a new client (co-borrower)
    addClient: () => {
      update(state => {
        const newClientId = `client-${state.clientIds.length + 1}`;
        return {
          ...state,
          clientIds: [...state.clientIds, newClientId],
          clientData: {
            ...state.clientData,
            [newClientId]: createDefaultClientData()
          },
          addressData: {
            ...state.addressData,
            [newClientId]: createDefaultAddressData(newClientId)
          },
          employmentData: {
            ...state.employmentData,
            [newClientId]: createDefaultEmploymentData(newClientId)
          },
          incomeData: {
            ...state.incomeData,
            [newClientId]: createDefaultIncomeData(newClientId)
          },
          assetsData: {
            ...state.assetsData,
            [newClientId]: createDefaultAssetsData(newClientId)
          },
          realEstateData: {
            ...state.realEstateData,
            [newClientId]: createDefaultRealEstateData(newClientId)
          },
          documentsData: {
            ...state.documentsData,
            [newClientId]: createDefaultDocumentsData(newClientId)
          }
        };
      });
    },
    
    // Remove a client (co-borrower) - cannot remove if it's the only client
    removeClient: (clientId: string) => {
      update(state => {
        // Don't allow removing the last client
        if (state.clientIds.length <= 1) {
          console.warn('Cannot remove the last client');
          return state;
        }
        
        // If removing the active client, switch to the first remaining client
        let newActiveClientId = state.activeClientId;
        if (state.activeClientId === clientId) {
          newActiveClientId = state.clientIds.find(id => id !== clientId) || state.clientIds[0];
        }
        
        // Remove client from all data structures
        const newClientIds = state.clientIds.filter(id => id !== clientId);
        const newClientData = { ...state.clientData };
        const newAddressData = { ...state.addressData };
        const newEmploymentData = { ...state.employmentData };
        const newIncomeData = { ...state.incomeData };
        const newAssetsData = { ...state.assetsData };
        const newRealEstateData = { ...state.realEstateData };
        const newDocumentsData = { ...state.documentsData };
        const newValidationErrors = { ...state.validationErrors };
        const newVisitedSteps = { ...state.visitedSteps };
        const newTouchedFields = { ...state.touchedFields };
        
        delete newClientData[clientId];
        delete newAddressData[clientId];
        delete newEmploymentData[clientId];
        delete newIncomeData[clientId];
        delete newAssetsData[clientId];
        delete newRealEstateData[clientId];
        delete newDocumentsData[clientId];
        delete newValidationErrors[clientId];
        delete newVisitedSteps[clientId];
        delete newTouchedFields[clientId];
        
        return {
          ...state,
          clientIds: newClientIds,
          activeClientId: newActiveClientId,
          clientData: newClientData,
          addressData: newAddressData,
          employmentData: newEmploymentData,
          incomeData: newIncomeData,
          assetsData: newAssetsData,
          realEstateData: newRealEstateData,
          documentsData: newDocumentsData,
          validationErrors: newValidationErrors,
          visitedSteps: newVisitedSteps,
          touchedFields: newTouchedFields
        };
      });
    },
    
    // Update client data with validation
    updateClientData: (clientId: string, data: Partial<ClientData>) => {
      // Don't validate here - validation happens in UI components on blur
      // Just store the data as-is
      update(state => {
        const currentClientData = state.clientData[clientId] || {};
        const updatedClientData = { ...currentClientData, ...data };
        
        const updated = {
          ...state,
          clientData: {
            ...state.clientData,
            [clientId]: updatedClientData
          }
        };
        
        debug.storeUpdate('updateClientData', { clientId, data });
        console.log('📝 [STORE] updateClientData called:', {
          clientId,
          field: Object.keys(data)[0],
          value: Object.values(data)[0],
          updatedClientData: {
            citizenship: updatedClientData.citizenship,
            maritalStatus: updatedClientData.maritalStatus,
            firstName: updatedClientData.firstName,
            lastName: updatedClientData.lastName
          }
        });
        
        // Don't auto-save here - will save on step change
        return updated;
      });
    },
    
    // Employment actions
    addEmploymentRecord: (clientId: string) => {
      let newRecordId = '';
      
      update(state => {
        const existingRecords = state.employmentData[clientId]?.records || [];
        let mostRecentStartDate: string | null = null;
        
        // Find the most recent job's start date to auto-fill end date
        if (existingRecords.length > 0) {
          // First, check for currently employed jobs
          const currentJob = existingRecords.find(r => r.currentlyEmployed && r.startDate);
          if (currentJob && currentJob.startDate) {
            mostRecentStartDate = currentJob.startDate;
          } else {
            // Otherwise, find the job with the latest start date
            const sortedByStartDate = existingRecords
              .filter(r => r.startDate)
              .sort((a, b) => {
                const dateA = new Date(a.startDate!).getTime();
                const dateB = new Date(b.startDate!).getTime();
                return dateB - dateA; // Descending order (most recent first)
              });
            
            if (sortedByStartDate.length > 0) {
              mostRecentStartDate = sortedByStartDate[0].startDate!;
            }
          }
        }
        
        const newRecord: EmploymentRecord = {
          id: generateId('emp'),
          employerName: '',
          phoneNumber: '',
          employerAddress: createEmptyAddress(),
          jobTitle: '',
          incomeType: '',
          selfEmployed: false,
          ownershipPercentage: false,
          relatedParty: false,
          currentlyEmployed: false,
          startDate: '',
          endDate: mostRecentStartDate, // Auto-fill with most recent job's start date
          hasOfferLetter: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        newRecordId = newRecord.id;
        
        return {
          ...state,
          employmentData: {
            ...state.employmentData,
            [clientId]: {
              ...state.employmentData[clientId],
              records: [...state.employmentData[clientId].records, newRecord]
            }
          }
        };
      });
      
      return newRecordId;
    },
    
    updateEmploymentRecord: (clientId: string, recordId: string, updates: Partial<EmploymentRecord>) => {
      // Don't validate here - validation happens in UI components on blur
      // Just store the data as-is
      update(state => {
        const updated = {
          ...state,
          employmentData: {
            ...state.employmentData,
            [clientId]: {
              ...state.employmentData[clientId],
              records: state.employmentData[clientId].records.map(r =>
                r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
              )
            }
          }
        };
        
        debug.storeUpdate('updateEmploymentRecord', { clientId, recordId, updates });
        
        // Don't auto-save here - will save on step change
        return updated;
      });
    },
    
    removeEmploymentRecord: (clientId: string, recordId: string) => {
      update(state => ({
        ...state,
        employmentData: {
          ...state.employmentData,
          [clientId]: {
            ...state.employmentData[clientId],
            records: state.employmentData[clientId].records.filter(r => r.id !== recordId)
          }
        }
      }));
    },
    
    // Assets actions
    addAssetRecord: (clientId: string, category: AssetRecord['category']) => {
      const newRecord: AssetRecord = {
        id: generateId('asset'),
        clientId,
        category,
        type: '',
        amount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        assetsData: {
          ...state.assetsData,
          [clientId]: {
            ...state.assetsData[clientId],
            records: [...state.assetsData[clientId].records, newRecord]
          }
        }
      }));
      
      return newRecord.id;
    },
    
    updateAssetRecord: (clientId: string, recordId: string, updates: Partial<AssetRecord>) => {
      update(state => ({
        ...state,
        assetsData: {
          ...state.assetsData,
          [clientId]: {
            ...state.assetsData[clientId],
            records: state.assetsData[clientId].records.map(r =>
              r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
          }
        }
      }));
    },
    
    removeAssetRecord: (clientId: string, recordId: string) => {
      update(state => ({
        ...state,
        assetsData: {
          ...state.assetsData,
          [clientId]: {
            ...state.assetsData[clientId],
            records: state.assetsData[clientId].records.filter(r => r.id !== recordId)
          }
        }
      }));
    },
    
    // Real Estate actions
    addRealEstateRecord: (clientId: string) => {
      const newRecord: RealEstateOwned = {
        id: generateId('reo'),
        clientId,
        address: createEmptyAddress(),
        propertyType: 'Single Family',
        propertyStatus: 'Retained',
        occupancyType: 'Primary Residence',
        monthlyTaxes: 0,
        monthlyInsurance: 0,
        currentResidence: false,
        propertyValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        realEstateData: {
          ...state.realEstateData,
          [clientId]: {
            ...state.realEstateData[clientId],
            records: [...state.realEstateData[clientId].records, newRecord]
          }
        }
      }));
      
      return newRecord.id;
    },
    
    updateRealEstateRecord: (clientId: string, recordId: string, updates: Partial<RealEstateOwned>) => {
      update(state => ({
        ...state,
        realEstateData: {
          ...state.realEstateData,
          [clientId]: {
            ...state.realEstateData[clientId],
            records: state.realEstateData[clientId].records.map(r =>
              r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
          }
        }
      }));
    },
    
    removeRealEstateRecord: (clientId: string, recordId: string) => {
      update(state => ({
        ...state,
        realEstateData: {
          ...state.realEstateData,
          [clientId]: {
            ...state.realEstateData[clientId],
            records: state.realEstateData[clientId].records.filter(r => r.id !== recordId)
          }
        }
      }));
    },
    
    // Documents actions
    uploadDocument: (clientId: string, conditionId: string, type: DocumentRecord['type'], file: File, uploadedBy?: string) => {
      const newDocument: DocumentRecord = {
        id: generateId('doc'),
        conditionId,
        type,
        filename: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
        status: 'uploaded',
        uploadedAt: new Date().toISOString(),
        uploadedBy: uploadedBy || 'user',
        verifiedAt: null,
        version: 1
      };
      
      update(state => {
        const currentDocs = state.documentsData[clientId] || createDefaultDocumentsData(clientId);
        
        // Find existing documents for this condition to determine version
        const existingDocs = currentDocs.documents.filter(d => d.conditionId === conditionId);
        if (existingDocs.length > 0) {
          const maxVersion = Math.max(...existingDocs.map(d => d.version || 1));
          newDocument.version = maxVersion + 1;
        }
        
        // Add history entry
        const historyEntry: DocumentHistoryEntry = {
          id: generateId('hist'),
          documentId: newDocument.id,
          action: 'uploaded',
          timestamp: new Date().toISOString(),
          user: uploadedBy || 'user',
          filename: file.name
        };
        
        return {
          ...state,
          documentsData: {
            ...state.documentsData,
            [clientId]: {
              ...currentDocs,
              documents: [...currentDocs.documents, newDocument],
              history: [...currentDocs.history, historyEntry]
            }
          }
        };
      });
      
      return newDocument.id;
    },
    
    // Add note to a condition
    addConditionNote: (clientId: string, conditionId: string, note: string, user?: string) => {
      update(state => {
        const currentDocs = state.documentsData[clientId] || createDefaultDocumentsData(clientId);
        const notes = currentDocs.conditionNotes[conditionId] || [];
        
        // Add history entry
        const historyEntry: DocumentHistoryEntry = {
          id: generateId('hist'),
          documentId: conditionId,
          action: 'note_added',
          timestamp: new Date().toISOString(),
          user: user || 'user',
          note
        };
        
        return {
          ...state,
          documentsData: {
            ...state.documentsData,
            [clientId]: {
              ...currentDocs,
              conditionNotes: {
                ...currentDocs.conditionNotes,
                [conditionId]: [...notes, note]
              },
              history: [...currentDocs.history, historyEntry]
            }
          }
        };
      });
    },
    
    removeDocument: (clientId: string, documentId: string, user?: string) => {
      update(state => {
        const currentDocs = state.documentsData[clientId] || createDefaultDocumentsData(clientId);
        const document = currentDocs.documents.find(d => d.id === documentId);
        
        // Add history entry
        const historyEntry: DocumentHistoryEntry = {
          id: generateId('hist'),
          documentId,
          action: 'removed',
          timestamp: new Date().toISOString(),
          user: user || 'user',
          filename: document?.filename
        };
        
        return {
          ...state,
          documentsData: {
            ...state.documentsData,
            [clientId]: {
              ...currentDocs,
              documents: currentDocs.documents.filter(d => d.id !== documentId),
              history: [...currentDocs.history, historyEntry]
            }
          }
        };
      });
    },
    
    // Address actions
    updatePresentAddress: (clientId: string, address: Partial<AddressRecord>) => {
      update(state => ({
        ...state,
        addressData: {
          ...state.addressData,
          [clientId]: {
            ...state.addressData[clientId],
            present: { ...state.addressData[clientId].present, ...address }
          }
        }
      }));
    },
    
    // Update mailing address
    updateMailingAddress: (clientId: string, address: Partial<AddressRecord>) => {
      update(state => {
        const currentAddressData = state.addressData[clientId] || createDefaultAddressData(clientId);
        const currentMailing = currentAddressData.mailing || {
          id: generateId(),
          fromDate: '',
          toDate: '',
          addr: createEmptyAddress(),
          isPresent: false
        };
        
        return {
          ...state,
          addressData: {
            ...state.addressData,
            [clientId]: {
              ...currentAddressData,
              mailing: { ...currentMailing, ...address }
            }
          }
        };
      });
    },
    
    addFormerAddress: (clientId: string) => {
      const newAddress: AddressRecord = {
        id: generateId('addr'),
        fromDate: '',
        toDate: '',
        addr: createEmptyAddress(),
        isPresent: false
      };
      
      update(state => ({
        ...state,
        addressData: {
          ...state.addressData,
          [clientId]: {
            ...state.addressData[clientId],
            former: [...state.addressData[clientId].former, newAddress]
          }
        }
      }));
      
      return newAddress.id;
    },
    
    updateFormerAddress: (clientId: string, addressId: string, updates: Partial<AddressRecord>) => {
      update(state => ({
        ...state,
        addressData: {
          ...state.addressData,
          [clientId]: {
            ...state.addressData[clientId],
            former: state.addressData[clientId].former.map(addr =>
              addr.id === addressId ? { ...addr, ...updates } : addr
            )
          }
        }
      }));
    },
    
    // Income actions
    addActiveIncome: (clientId: string, employmentRecordId: string) => {
      const newRecord: ActiveIncomeRecord = {
        id: generateId('active-income'),
        clientId,
        employmentRecordId,
        companyName: '',
        position: '',
        monthlyAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        incomeData: {
          ...state.incomeData,
          [clientId]: {
            ...state.incomeData[clientId],
            activeIncomeRecords: [...state.incomeData[clientId].activeIncomeRecords, newRecord]
          }
        }
      }));
      
      return newRecord.id;
    },
    
    addPassiveIncome: (clientId: string) => {
      const newRecord: PassiveIncomeRecord = {
        id: generateId('passive-income'),
        clientId,
        sourceType: 'social_security',
        sourceName: '',
        monthlyAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        incomeData: {
          ...state.incomeData,
          [clientId]: {
            ...state.incomeData[clientId],
            passiveIncomeRecords: [...state.incomeData[clientId].passiveIncomeRecords, newRecord]
          }
        }
      }));
      
      return newRecord.id;
    },
    
    updateActiveIncomeRecord: (clientId: string, recordId: string, updates: Partial<ActiveIncomeRecord>) => {
      update(state => ({
        ...state,
        incomeData: {
          ...state.incomeData,
          [clientId]: {
            ...state.incomeData[clientId],
            activeIncomeRecords: state.incomeData[clientId].activeIncomeRecords.map(r =>
              r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
          }
        }
      }));
    },
    
    updatePassiveIncomeRecord: (clientId: string, recordId: string, updates: Partial<PassiveIncomeRecord>) => {
      update(state => ({
        ...state,
        incomeData: {
          ...state.incomeData,
          [clientId]: {
            ...state.incomeData[clientId],
            passiveIncomeRecords: state.incomeData[clientId].passiveIncomeRecords.map(r =>
              r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
          }
        }
      }));
    },
    
    // Loading state
    setLoading: (loading: boolean) => {
      update(state => ({ ...state, isLoading: loading }));
    },
    
    setSaving: (saving: boolean) => {
      update(state => ({ ...state, isSaving: saving }));
    },
    
    setLastSaved: (timestamp: string) => {
      update(state => ({ ...state, lastSaved: timestamp }));
    }
  };
}

// Export the store singleton
export const applicationStore = createApplicationStore();

// Derived stores for common selections
export const activeClientId = derived(applicationStore, $state => $state.activeClientId);
export const currentStepId = derived(applicationStore, $state => $state.currentStepId);
export const clientIds = derived(applicationStore, $state => $state.clientIds);

// Helper to get current client data
export const activeClientData = derived(applicationStore, $state => 
  $state.clientData[$state.activeClientId]
);

export const activeEmploymentData = derived(applicationStore, $state =>
  $state.employmentData[$state.activeClientId]
);

export const activeAssetsData = derived(applicationStore, $state =>
  $state.assetsData[$state.activeClientId]
);

export const activeRealEstateData = derived(applicationStore, $state =>
  $state.realEstateData[$state.activeClientId]
);

export const activeAddressData = derived(applicationStore, $state =>
  $state.addressData[$state.activeClientId]
);

export const activeIncomeData = derived(applicationStore, $state =>
  $state.incomeData[$state.activeClientId]
);

// Validation errors for current step - only show if step has been visited (navigated away from)
// When revisiting, show ALL errors. When actively working, only show errors for touched fields
// Errors are per client (per borrower)
export const currentStepValidationErrors = derived(
  [applicationStore, currentStepId, activeClientId],
  ([$store, $stepId, $clientId]) => {
    if (!$clientId) return [];
    
    const clientVisitedSteps = $store.visitedSteps[$clientId];
    const clientValidationErrors = $store.validationErrors[$clientId];
    const clientTouchedFields = $store.touchedFields[$clientId];
    
    // Only show errors if the step has been visited (user navigated away and came back)
    // This prevents showing the big error box while actively typing on first visit
    // Ensure clientVisitedSteps is a Set before calling .has()
    if (clientVisitedSteps instanceof Set && clientVisitedSteps.has($stepId)) {
      const allErrors = clientValidationErrors?.[$stepId] || [];
      
      // When revisiting (current step and has been visited), show ALL errors
      if ($store.currentStepId === $stepId) {
        // Show all errors when revisiting
        return allErrors;
      } else {
        // Filter to only show errors for fields that have been touched (blurred)
        return allErrors.filter(error => {
          const fieldPath = `${$stepId}.${error.field}`;
          return clientTouchedFields instanceof Set && clientTouchedFields.has(fieldPath);
        });
      }
    }
    return [];
  }
);

