import { writable, derived, get } from 'svelte/store';
import type { ClientData } from '$lib/types/client-data';
import type { ClientEmploymentData, EmploymentRecord } from '$lib/types/employment';
import type { ClientIncomeData, ActiveIncomeRecord, PassiveIncomeRecord, IncomeTotal } from '$lib/types/income';
import type { ClientAssetsData, AssetRecord } from '$lib/types/assets';
import type { ClientRealEstateData, RealEstateOwned } from '$lib/types/real-estate';
import type { ClientAddressData, AddressRecord } from '$lib/types/address';
import type { ApplicationStepId } from '$lib/types/application';
import { generateId } from '$lib/idGenerator';
// Validation is handled in UI components on blur, not in the store
import { debug } from '$lib/debug';
import { saveAllClientDataToFirebase, saveApplicationToFirebase, createApplicationInFirebase } from '$lib/firebase/save';

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
  militaryNote: null
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
  former: []
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
  
  // UI State
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
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
    
    isLoading: false,
    isSaving: false,
    lastSaved: null
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
    
    // Save entire application to Firebase
    saveToFirebase: async () => {
      const state = get(applicationStore);
      
      if (!state.currentApplicationId) {
        debug.warn('Cannot save: no application ID set');
        throw new Error('No application ID set');
      }
      
      debug.group('Saving application to Firebase');
      debug.log('Application ID:', state.currentApplicationId);
      
      update(s => ({ ...s, isSaving: true }));
      
      try {
        // Save all client data
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
        
        // Also save the main application document
        savePromises.push(saveApplicationToFirebase(state.currentApplicationId, state));
        
        await Promise.all(savePromises);
        
        debug.log('✅ Application saved successfully');
        update(s => ({ 
          ...s, 
          isSaving: false, 
          lastSaved: new Date().toISOString() 
        }));
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
    
    // Set current step (with auto-save)
    setCurrentStep: async (stepId: ApplicationStepId) => {
      const state = get(applicationStore);
      const previousStepId = state.currentStepId;
      
      // Update step first
      update(s => ({ ...s, currentStepId: stepId }));
      
      // Auto-save to Firebase when changing steps (if application ID exists)
      if (state.currentApplicationId && previousStepId !== stepId) {
        debug.log(`Step changed from ${previousStepId} to ${stepId} - auto-saving...`);
        try {
          await applicationStore.saveToFirebase();
          debug.log('✅ Auto-saved on step change');
        } catch (error) {
          debug.error('Failed to auto-save on step change:', error);
          // Don't throw - allow step change even if save fails
        }
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
          }
        };
      });
    },
    
    // Update client data with validation
    updateClientData: (clientId: string, data: Partial<ClientData>) => {
      // Don't validate here - validation happens in UI components on blur
      // Just store the data as-is
      update(state => {
        const updated = {
          ...state,
          clientData: {
            ...state.clientData,
            [clientId]: { ...state.clientData[clientId], ...data }
          }
        };
        
        debug.storeUpdate('updateClientData', { clientId, data });
        
        // Don't auto-save here - will save on step change
        return updated;
      });
    },
    
    // Employment actions
    addEmploymentRecord: (clientId: string) => {
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
        currentlyEmployed: true,
        startDate: '',
        endDate: null,
        hasOfferLetter: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        employmentData: {
          ...state.employmentData,
          [clientId]: {
            ...state.employmentData[clientId],
            records: [...state.employmentData[clientId].records, newRecord]
          }
        }
      }));
      
      return newRecord.id;
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

