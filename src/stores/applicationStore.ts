import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { EmploymentRecord, ClientEmploymentData } from '@/types/employment';
import type { ActiveIncomeRecord, PassiveIncomeRecord, IncomeTotal } from '@/types/income';
import type { RealEstateOwned, ClientRealEstateData } from '@/types/real-estate';
import type { AssetRecord } from '@/types/assets';
import type { Condition, ConditionNote, ConditionStatus, ConditionDocument } from '@/types/conditions';
import type { ClientAddressData, AddressRecord } from '@/types/address';
import { generateConditions, updateConditionStatus, getConditionStats, addConditionNote } from '@/lib/conditions';
import type { ConditionGeneratorInput } from '@/lib/conditions';
import type { ClientData } from '@/types/client-data';
import type { ChatMessage } from '@/types/voice-assistant';
import { validateClientData, validateEmploymentRecord, logValidationResults } from '@/lib/dataValidator';
import * as firestoreSync from './sync/firestoreSync';
import {
  generateClientId,
  generateEmploymentId,
  generateIncomeId,
  generateAssetId,
  generateRealEstateId,
  generateConditionId,
  generateChatMessageId,
  generateDocumentId,
  generateFallbackId,
} from '@/lib/idGenerator';

export type ApplicationState = {
  currentApplicationId: string | null;
  clients: { [id: string]: ClientData };
  activeClientId: string;
  employmentData: { [clientId: string]: ClientEmploymentData };
  employmentCounters: { [clientId: string]: number };
  // Income data
  activeIncomeData: { [clientId: string]: ActiveIncomeRecord[] };
  passiveIncomeData: { [clientId: string]: PassiveIncomeRecord[] };
  incomeTotals: { [clientId: string]: IncomeTotal };
  incomeCounters: { [clientId: string]: number };
  // Real estate data
  realEstateData: { [clientId: string]: ClientRealEstateData };
  realEstateCounters: { [clientId: string]: number };
  realEstateVisited: { [clientId: string]: boolean };
  // Assets data
  assetsData: { [clientId: string]: AssetRecord[] };
  assetCounters: { [clientId: string]: number };
  // Conditions data
  conditionsData: { [clientId: string]: Condition[] };
  conditionCounters: { [clientId: string]: number };
  // Document library data
  documentLibrary: ConditionDocument[];
  // Address data
  addressData: { [clientId: string]: ClientAddressData };
  // Voice chat history
  chatHistory: ChatMessage[];
  setActiveClient: (id: string) => void;
  addClient: () => string;
  removeClient: (id: string) => void;
  updateClientData: (id: string, updates: Partial<ClientData>) => void;
  // Employment actions
  getNextEmploymentId: (clientId: string) => string;
  addEmploymentRecord: (clientId: string) => string;
  updateEmploymentRecord: (clientId: string, recordId: string, updates: Partial<EmploymentRecord>) => void;
  removeEmploymentRecord: (clientId: string, recordId: string) => void;
  getEmploymentRecords: (clientId: string) => EmploymentRecord[];
  getClientEmploymentData: (clientId: string) => ClientEmploymentData;
  clearEmploymentData: (clientId: string) => void;
  updateEmploymentNote: (clientId: string, note: string | null) => void;
  // Income actions
  getNextIncomeId: (clientId: string) => string;
  addActiveIncome: (clientId: string) => string;
  updateActiveIncome: (clientId: string, recordId: string, updates: Partial<ActiveIncomeRecord>) => void;
  removeActiveIncome: (clientId: string, recordId: string) => void;
  getActiveIncomeRecords: (clientId: string) => ActiveIncomeRecord[];
  addPassiveIncome: (clientId: string) => string;
  updatePassiveIncome: (clientId: string, recordId: string, updates: Partial<PassiveIncomeRecord>) => void;
  removePassiveIncome: (clientId: string, recordId: string) => void;
  getPassiveIncomeRecords: (clientId: string) => PassiveIncomeRecord[];
  updateIncomeTotal: (clientId: string, total: Partial<IncomeTotal>) => void;
  getIncomeTotal: (clientId: string) => IncomeTotal;
  // Real estate actions
  getNextRealEstateId: (clientId: string) => string;
  addRealEstateRecord: (clientId: string) => string;
  updateRealEstateRecord: (clientId: string, recordId: string, updates: Partial<RealEstateOwned>) => void;
  removeRealEstateRecord: (clientId: string, recordId: string) => void;
  getRealEstateRecords: (clientId: string) => RealEstateOwned[];
  getClientRealEstateData: (clientId: string) => ClientRealEstateData;
  clearRealEstateData: (clientId: string) => void;
  markRealEstateVisited: (clientId: string) => void;
  isRealEstateVisited: (clientId: string) => boolean;
  // Assets actions
  getNextAssetId: (clientId: string) => string;
  addAsset: (clientId: string) => string;
  updateAsset: (clientId: string, recordId: string, updates: Partial<AssetRecord>) => void;
  removeAsset: (clientId: string, recordId: string) => void;
  getAssets: (clientId: string) => AssetRecord[];
  setSharedOwners: (clientId: string, recordId: string, sharedClientIds: string[]) => void;
  // Asset totals/selectors
  getAssetTotalForClient: (clientId: string) => number;
  getPerClientAssetTotals: () => { clientId: string; total: number }[];
  getOverallAssetsTotal: () => number;
  // Aliased selector names per spec
  selectAssetTotalForClient?: (clientId: string) => number;
  selectPerClientTotals?: () => { clientId: string; total: number }[];
  selectOverallAssetsTotal?: () => number;
  // Address actions
  updateAddressData: (clientId: string, data: ClientAddressData) => void;
  getAddressData: (clientId: string) => ClientAddressData;
  addFormerAddress: (clientId: string, address: AddressRecord) => void;
  updateFormerAddress: (clientId: string, addressId: string, updates: Partial<AddressRecord>) => void;
  removeFormerAddress: (clientId: string, addressId: string) => void;
  clearAddressData: (clientId: string) => void;
  // Condition actions
  generateConditionsForClient: (clientId: string) => void;
  getConditionsForClient: (clientId: string) => Condition[];
  getConditionStats: (clientId: string) => { total: number; pending: number; inProgress: number; completed: number; cancelled: number };
  addConditionNote: (clientId: string, conditionId: string, note: ConditionNote) => void;
  updateConditionStatus: (clientId: string, conditionId: string, status: ConditionStatus) => void;
  addConditionDocument: (clientId: string, conditionId: string, document: ConditionDocument) => void;
  removeConditionDocument: (clientId: string, conditionId: string, documentId: string) => void;
  getOpenConditionsCount: () => number;
  // Document library actions
  getDocumentLibrary: () => ConditionDocument[];
  addToDocumentLibrary: (document: ConditionDocument) => void;
  removeFromDocumentLibrary: (documentId: string) => void;
  // Chat history actions
  addChatMessage: (message: ChatMessage) => void;
  getChatHistory: () => ChatMessage[];
  clearChatHistory: () => void;
  // Firestore sync actions
  setCurrentApplicationId: (applicationId: string | null) => void;
  loadApplicationFromFirestore: (applicationId: string) => Promise<void>;
};

export const useApplicationStore = create<ApplicationState>()(
  persist(
    devtools(
      (set, get) => ({
  currentApplicationId: null,
  clients: { 'c1': { firstName: '', lastName: '', email: '', phone: '', ssn: '', dob: '', citizenship: 'US Citizen', maritalStatus: 'Unmarried', hasMilitaryService: false, militaryNote: null } },
  activeClientId: 'c1',
  employmentData: {},
  employmentCounters: {},
  // Income data
  activeIncomeData: {},
  passiveIncomeData: {},
  incomeTotals: {},
  incomeCounters: {},
  // Real estate data
  realEstateData: {},
  realEstateCounters: {},
  realEstateVisited: {},
  // Assets data
  assetsData: {},
  assetCounters: {},
  // Conditions data
  conditionsData: {},
  conditionCounters: {},
  // Document library data
  documentLibrary: [],
  // Address data
  addressData: {},
  // Voice chat history
  chatHistory: [],
  
  setActiveClient: (id) => set({ activeClientId: id }),
  
  addClient: () => {
    const state = get();
    // Use Firestore ID if we have an application, otherwise use fallback
    const id = state.currentApplicationId
      ? generateClientId(state.currentApplicationId)
      : generateFallbackId('client');
    const newClient: ClientData = { firstName: '', lastName: '', email: '', phone: '', ssn: '', dob: '', citizenship: 'US Citizen', maritalStatus: 'Unmarried', hasMilitaryService: false, militaryNote: null };
    set((state) => {
      const updatedClients = { ...state.clients, [id]: newClient };
      // Sync to Firestore
      if (state.currentApplicationId) {
        firestoreSync.saveClientToFirestore(state.currentApplicationId, id, newClient)
          .catch(err => console.error('Failed to sync client to Firestore:', err));
      }
      return {
        clients: updatedClients,
      activeClientId: id,
      employmentCounters: { ...state.employmentCounters, [id]: 0 }
      };
    });
    return id;
  },
  
  removeClient: (id) => set((state) => {
    // Sync deletion to Firestore
    if (state.currentApplicationId) {
      firestoreSync.deleteClientFromFirestore(state.currentApplicationId, id)
        .catch(err => console.error('Failed to delete client from Firestore:', err));
    }
    // Remove all client-related data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _, ...newClients } = state.clients;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: __, ...newEmploymentData } = state.employmentData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: ___, ...newEmploymentCounters } = state.employmentCounters;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: ____, ...newActiveIncomeData } = state.activeIncomeData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _____, ...newPassiveIncomeData } = state.passiveIncomeData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: ______, ...newIncomeTotals } = state.incomeTotals;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _______, ...newRealEstateData } = state.realEstateData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: ________, ...newRealEstateCounters } = state.realEstateCounters;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _________, ...newAssetsData } = state.assetsData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: __________, ...newAssetCounters } = state.assetCounters;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: ___________, ...newConditionsData } = state.conditionsData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: ____________, ...newConditionCounters } = state.conditionCounters;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _____________, ...newAddressData } = state.addressData;
    
    const newActive = state.activeClientId === id ? Object.keys(newClients)[0] || '' : state.activeClientId;
    
    return { 
      clients: newClients, 
      employmentData: newEmploymentData,
      employmentCounters: newEmploymentCounters,
      activeIncomeData: newActiveIncomeData,
      passiveIncomeData: newPassiveIncomeData,
      incomeTotals: newIncomeTotals,
      realEstateData: newRealEstateData,
      realEstateCounters: newRealEstateCounters,
      assetsData: newAssetsData,
      assetCounters: newAssetCounters,
      conditionsData: newConditionsData,
      conditionCounters: newConditionCounters,
      addressData: newAddressData,
      activeClientId: newActive 
    };
  }),
  
  updateClientData: (id, updates) => set((state) => {
    // Validate all client data before storing
    const validationResult = validateClientData(updates)
    logValidationResults(`Client ${id} data`, validationResult)
    
    if (!validationResult.isValid) {
      console.error('Client data validation failed, skipping update:', validationResult.errors)
      return state
    }
    
    const updatedClient = { ...state.clients[id], ...validationResult.data }
    const updatedClients = { ...state.clients, [id]: updatedClient }
    
    // Sync to Firestore
    if (state.currentApplicationId) {
      firestoreSync.saveClientToFirestore(state.currentApplicationId, id, updatedClient)
        .catch(err => console.error('Failed to sync client to Firestore:', err))
    }
    
    return { clients: updatedClients }
  }),

  // Employment helpers (kept for backward compatibility, but now uses Firestore IDs)
  getNextEmploymentId: (clientId) => {
    const state = get();
    // Use Firestore ID if we have an application, otherwise use fallback
    if (state.currentApplicationId) {
      return generateEmploymentId(state.currentApplicationId);
    }
    return generateFallbackId('emp');
  },

  // Employment actions
  addEmploymentRecord: (clientId) => {
    const currentState = get();
    const id = currentState.currentApplicationId
      ? generateEmploymentId(currentState.currentApplicationId)
      : generateFallbackId('emp');
    const now = new Date().toISOString();
    
    // Auto-fill endDate with the startDate of the previous employment to avoid gaps
    const currentData = currentState.employmentData[clientId] || { clientId, records: [] };
    let autoEndDate: string | null = null;
    
    if (currentData.records.length > 0) {
      // Find the most recent employment (either current or the most recent former employment)
      // Sort by startDate descending to get the most recent first
      const sortedRecords = [...currentData.records].sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return dateB - dateA;
      });
      
      // Use the startDate from the most recent employment
      const mostRecentRecord = sortedRecords[0];
      if (mostRecentRecord?.startDate) {
        autoEndDate = mostRecentRecord.startDate;
      }
    }
    
    const emptyRecord: EmploymentRecord = {
      id,
      employerName: '',
      phoneNumber: '',
      employerAddress: { address1: '', address2: '', formattedAddress: '', city: '', region: '', postalCode: '', country: '', lat: 0, lng: 0 },
      jobTitle: '',
      incomeType: 'Standard',
      selfEmployed: false,
      ownershipPercentage: false,
      relatedParty: false,
      currentlyEmployed: false,
      startDate: '',
      endDate: autoEndDate,
      hasOfferLetter: false,
      createdAt: now,
      updatedAt: now
    };
    
    set((state) => {
      const currentData = state.employmentData[clientId] || { clientId, records: [] };
      const updatedData = {
        ...currentData,
        records: [...currentData.records, emptyRecord]
      };
      // Sync to Firestore - save to client subcollection
      if (state.currentApplicationId) {
        firestoreSync.saveEmploymentToFirestore(state.currentApplicationId, clientId, id, emptyRecord)
          .catch(err => console.error('Failed to sync employment to Firestore:', err))
      }
      return {
        employmentData: {
          ...state.employmentData,
          [clientId]: updatedData
        }
      };
    });
    
    return id;
  },

  updateEmploymentRecord: (clientId, recordId, updates) => set((state) => {
    const currentData = state.employmentData[clientId];
    if (!currentData) return state as any;

    // Validate all employment data before storing
    const validationResult = validateEmploymentRecord(updates)
    logValidationResults(`Employment ${recordId} data`, validationResult)
    
    if (!validationResult.isValid) {
      console.error('Employment data validation failed, skipping update:', validationResult.errors)
      return state as any
    }

    const updatedRecords = currentData.records.map(record =>
      record.id === recordId 
        ? { ...record, ...validationResult.data, updatedAt: new Date().toISOString() }
        : record
    );

    const updatedRecord = updatedRecords.find(r => r.id === recordId)
    // Sync to Firestore - save to client subcollection
    if (state.currentApplicationId && updatedRecord) {
      firestoreSync.saveEmploymentToFirestore(state.currentApplicationId, clientId, recordId, updatedRecord)
        .catch(err => console.error('Failed to sync employment to Firestore:', err))
    }

    return {
      employmentData: {
        ...state.employmentData,
        [clientId]: {
          ...currentData,
          records: updatedRecords
        }
      }
    } as any;
  }),

  removeEmploymentRecord: (clientId, recordId) => set((state) => {
    const currentData = state.employmentData[clientId];
    if (!currentData) return state as any;

    // Sync deletion to Firestore - delete from client subcollection
    if (state.currentApplicationId) {
      firestoreSync.deleteEmploymentFromFirestore(state.currentApplicationId, clientId, recordId)
        .catch(err => console.error('Failed to delete employment from Firestore:', err))
    }

    const updatedRecords = currentData.records.filter(record => record.id !== recordId);

    return {
      employmentData: {
        ...state.employmentData,
        [clientId]: {
          ...currentData,
          records: updatedRecords
        }
      }
    } as any;
  }),

  getEmploymentRecords: (clientId) => {
    const state = get();
    return state.employmentData[clientId]?.records || [];
  },

  getClientEmploymentData: (clientId) => {
    const state = get();
    return state.employmentData[clientId] || {
      clientId,
      records: []
    };
  },

  clearEmploymentData: (clientId) => set((state) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [clientId]: _, ...newEmploymentData } = state.employmentData;
    return { employmentData: newEmploymentData } as any;
  }),

  updateEmploymentNote: (clientId, note) => set((state) => {
    const currentData = state.employmentData[clientId];
    if (!currentData) {
      // Create new employment data if it doesn't exist
      return {
        employmentData: {
          ...state.employmentData,
          [clientId]: {
            clientId,
            records: [],
            employmentNote: note
          }
        }
      } as any;
    }

    return {
      employmentData: {
        ...state.employmentData,
        [clientId]: {
          ...currentData,
          employmentNote: note
        }
      }
    } as any;
  }),

  // Income actions (kept for backward compatibility, but now uses Firestore IDs)
  getNextIncomeId: (clientId) => {
    const state = get();
    // Use Firestore ID if we have an application, otherwise use fallback
    if (state.currentApplicationId) {
      return generateIncomeId(state.currentApplicationId, 'active');
    }
    return generateFallbackId('income');
  },

  addActiveIncome: (clientId) => {
    const state = get();
    const id = state.currentApplicationId
      ? generateIncomeId(state.currentApplicationId, 'active')
      : generateFallbackId('income');
    const now = new Date().toISOString();
    const emptyRecord: ActiveIncomeRecord = {
      id,
      clientId,
      employmentRecordId: '',
      companyName: '',
      position: '',
      monthlyAmount: 0,
      bonus: 0,
      commissions: 0,
      overtime: 0,
      notes: '',
      createdAt: now,
      updatedAt: now
    };
    
    set((state) => {
      const updatedRecords = [...(state.activeIncomeData[clientId] || []), emptyRecord];
      // Sync to Firestore
      if (state.currentApplicationId) {
        firestoreSync.saveActiveIncomeToFirestore(state.currentApplicationId, id, emptyRecord)
          .catch(err => console.error('Failed to sync active income to Firestore:', err))
      }
      return {
      activeIncomeData: {
        ...state.activeIncomeData,
          [clientId]: updatedRecords
      }
      };
    });
    
    return id;
  },

  updateActiveIncome: (clientId, recordId, updates) => set((state) => {
    const currentRecords = state.activeIncomeData[clientId] || [];
    const updatedRecords = currentRecords.map(record =>
      record.id === recordId ? { ...record, ...updates, updatedAt: new Date().toISOString() } : record
    );
    const updatedRecord = updatedRecords.find(r => r.id === recordId);
    // Sync to Firestore
    if (state.currentApplicationId && updatedRecord) {
      firestoreSync.saveActiveIncomeToFirestore(state.currentApplicationId, recordId, updatedRecord)
        .catch(err => console.error('Failed to sync active income to Firestore:', err))
    }
    return {
      activeIncomeData: {
        ...state.activeIncomeData,
        [clientId]: updatedRecords
      }
    };
  }),

  removeActiveIncome: (clientId, recordId) => set((state) => {
    // Sync deletion to Firestore
    if (state.currentApplicationId) {
      firestoreSync.deleteActiveIncomeFromFirestore(state.currentApplicationId, recordId)
        .catch(err => console.error('Failed to delete active income from Firestore:', err))
    }
    const currentRecords = state.activeIncomeData[clientId] || [];
    const updatedRecords = currentRecords.filter(record => record.id !== recordId);
    return {
      activeIncomeData: {
        ...state.activeIncomeData,
        [clientId]: updatedRecords
      }
    };
  }),

  getActiveIncomeRecords: (clientId) => {
    const state = get();
    return state.activeIncomeData[clientId] || [];
  },

  addPassiveIncome: (clientId) => {
    const state = get();
    const id = state.currentApplicationId
      ? generateIncomeId(state.currentApplicationId, 'passive')
      : generateFallbackId('income');
    const now = new Date().toISOString();
    const emptyRecord: PassiveIncomeRecord = {
      id,
      clientId,
      sourceType: 'alimony',
      sourceName: '',
      monthlyAmount: 0,
      notes: '',
      createdAt: now,
      updatedAt: now
    };
    
    set((state) => {
      const updatedRecords = [...(state.passiveIncomeData[clientId] || []), emptyRecord];
      // Sync to Firestore
      if (state.currentApplicationId) {
        firestoreSync.savePassiveIncomeToFirestore(state.currentApplicationId, id, emptyRecord)
          .catch(err => console.error('Failed to sync passive income to Firestore:', err))
      }
      return {
      passiveIncomeData: {
        ...state.passiveIncomeData,
          [clientId]: updatedRecords
      }
      };
    });
    
    return id;
  },

  updatePassiveIncome: (clientId, recordId, updates) => set((state) => {
    const currentRecords = state.passiveIncomeData[clientId] || [];
    const updatedRecords = currentRecords.map(record =>
      record.id === recordId ? { ...record, ...updates, updatedAt: new Date().toISOString() } : record
    );
    const updatedRecord = updatedRecords.find(r => r.id === recordId);
    // Sync to Firestore
    if (state.currentApplicationId && updatedRecord) {
      firestoreSync.savePassiveIncomeToFirestore(state.currentApplicationId, recordId, updatedRecord)
        .catch(err => console.error('Failed to sync passive income to Firestore:', err))
    }
    return {
      passiveIncomeData: {
        ...state.passiveIncomeData,
        [clientId]: updatedRecords
      }
    };
  }),

  removePassiveIncome: (clientId, recordId) => set((state) => {
    // Sync deletion to Firestore
    if (state.currentApplicationId) {
      firestoreSync.deletePassiveIncomeFromFirestore(state.currentApplicationId, recordId)
        .catch(err => console.error('Failed to delete passive income from Firestore:', err))
    }
    const currentRecords = state.passiveIncomeData[clientId] || [];
    const updatedRecords = currentRecords.filter(record => record.id !== recordId);
    return {
      passiveIncomeData: {
        ...state.passiveIncomeData,
        [clientId]: updatedRecords
      }
    };
  }),

  getPassiveIncomeRecords: (clientId) => {
    const state = get();
    return state.passiveIncomeData[clientId] || [];
  },

  updateIncomeTotal: (clientId, total) => set((state) => {
    const updatedTotal = {
        ...state.incomeTotals[clientId],
        id: `total-${clientId}`,
        clientId,
        totalMonthlyIncome: 0,
        ...total,
        updatedAt: new Date().toISOString()
    };
    // Sync to Firestore
    if (state.currentApplicationId) {
      firestoreSync.saveIncomeTotalToFirestore(state.currentApplicationId, clientId, updatedTotal)
        .catch(err => console.error('Failed to sync income total to Firestore:', err))
      }
    return {
      incomeTotals: {
        ...state.incomeTotals,
        [clientId]: updatedTotal
    }
    };
  }),

  getIncomeTotal: (clientId) => {
    const state = get();
    return state.incomeTotals[clientId] || {
      id: `total-${clientId}`,
      clientId,
      totalMonthlyIncome: 0
    };
  },

  // Real estate helpers (kept for backward compatibility, but now uses Firestore IDs)
  getNextRealEstateId: (clientId) => {
    const state = get();
    // Use Firestore ID if we have an application, otherwise use fallback
    if (state.currentApplicationId) {
      return generateRealEstateId(state.currentApplicationId);
    }
    return generateFallbackId('re');
  },

  // Real estate actions
  addRealEstateRecord: (clientId) => {
    const state = get();
    const id = state.currentApplicationId
      ? generateRealEstateId(state.currentApplicationId)
      : generateFallbackId('re');
    const now = new Date().toISOString();
    const emptyRecord: RealEstateOwned = {
      id,
      clientId,
      address: { address1: '', address2: '', formattedAddress: '', city: '', region: '', postalCode: '', country: '', lat: 0, lng: 0 },
      propertyType: 'Single Family',
      propertyStatus: 'Retained',
      occupancyType: 'Primary Residence',
      monthlyTaxes: 0,
      monthlyInsurance: 0,
      currentResidence: false,
      propertyValue: 0,
      createdAt: now,
      updatedAt: now
    };
    
    set((state) => {
      const currentData = state.realEstateData[clientId] || { clientId, records: [] };
      const updatedData = {
        ...currentData,
        records: [...currentData.records, emptyRecord]
      };
      // Sync to Firestore
      if (state.currentApplicationId) {
        firestoreSync.saveRealEstateToFirestore(state.currentApplicationId, id, emptyRecord)
          .catch(err => console.error('Failed to sync real estate to Firestore:', err))
      }
      return {
        realEstateData: {
          ...state.realEstateData,
          [clientId]: updatedData
        }
      };
    });
    
    return id;
  },

  updateRealEstateRecord: (clientId, recordId, updates) => set((state) => {
    const currentData = state.realEstateData[clientId];
    if (!currentData) return state as any;

    const updatedRecords = currentData.records.map(record =>
      record.id === recordId 
        ? { ...record, ...updates, updatedAt: new Date().toISOString() }
        : record
    );

    const updatedRecord = updatedRecords.find(r => r.id === recordId);
    // Sync to Firestore
    if (state.currentApplicationId && updatedRecord) {
      firestoreSync.saveRealEstateToFirestore(state.currentApplicationId, recordId, updatedRecord)
        .catch(err => console.error('Failed to sync real estate to Firestore:', err))
    }

    return {
      realEstateData: {
        ...state.realEstateData,
        [clientId]: {
          ...currentData,
          records: updatedRecords
        }
      }
    } as any;
  }),

  removeRealEstateRecord: (clientId, recordId) => set((state) => {
    const currentData = state.realEstateData[clientId];
    if (!currentData) return state as any;

    // Sync deletion to Firestore
    if (state.currentApplicationId) {
      firestoreSync.deleteRealEstateFromFirestore(state.currentApplicationId, recordId)
        .catch(err => console.error('Failed to delete real estate from Firestore:', err))
    }

    const updatedRecords = currentData.records.filter(record => record.id !== recordId);

    return {
      realEstateData: {
        ...state.realEstateData,
        [clientId]: {
          ...currentData,
          records: updatedRecords
        }
      }
    } as any;
  }),

  getRealEstateRecords: (clientId) => {
    const state = get();
    return state.realEstateData[clientId]?.records || [];
  },

  getClientRealEstateData: (clientId) => {
    const state = get();
    return state.realEstateData[clientId] || {
      clientId,
      records: []
    };
  },

  clearRealEstateData: (clientId) => set((state) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [clientId]: _, ...newRealEstateData } = state.realEstateData;
    return { realEstateData: newRealEstateData } as any;
  }),

  markRealEstateVisited: (clientId) => set((state) => ({
    realEstateVisited: { ...state.realEstateVisited, [clientId]: true }
  })),

  isRealEstateVisited: (clientId) => {
    const state = get();
    return state.realEstateVisited[clientId] || false;
  },

  // Assets helpers (kept for backward compatibility, but now uses Firestore IDs)
  getNextAssetId: (clientId) => {
    const state = get();
    // Use Firestore ID if we have an application, otherwise use fallback
    if (state.currentApplicationId) {
      return generateAssetId(state.currentApplicationId);
    }
    return generateFallbackId('asset');
  },

  // Assets actions
  addAsset: (clientId: string) => {
    const state = get();
    const id = state.currentApplicationId
      ? generateAssetId(state.currentApplicationId)
      : generateFallbackId('asset');
    const now = new Date().toISOString();
    const emptyRecord: AssetRecord = {
      id,
      clientId,
      category: 'BankAccount',
      type: 'Checking',
      amount: 0,
      institutionName: '',
      accountNumber: '',
      source: '',
      createdAt: now,
      updatedAt: now
    };
    
    set((state) => {
      const updatedList = [...(state.assetsData[clientId] || []), emptyRecord];
      // Sync to Firestore
      if (state.currentApplicationId) {
        firestoreSync.saveAssetToFirestore(state.currentApplicationId, id, emptyRecord)
          .catch(err => console.error('Failed to sync asset to Firestore:', err))
      }
      return {
        assetsData: {
          ...state.assetsData,
          [clientId]: updatedList
        }
      };
    });
    
    return id;
  },

  updateAsset: (clientId, recordId, updates) => set((state) => {
    const list = state.assetsData[clientId] || [];
    const nextList = list.map(r => r.id === recordId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r);
    // If accountNumber updated, enforce duplicate rule
    const updated = nextList.find(r => r.id === recordId);
    const acc = (updated?.accountNumber || '').trim();
    if (acc) {
      const anyDuplicate = Object.entries(state.assetsData).some(([cid, l]) => {
        const arr = cid === clientId ? nextList : (l || []);
        return arr.some(r => r.id !== recordId && (r.accountNumber || '').trim() === acc);
      });
      if (anyDuplicate) {
        return state as any;
      }
    }
    // Sync to Firestore
    if (state.currentApplicationId && updated) {
      firestoreSync.saveAssetToFirestore(state.currentApplicationId, recordId, updated)
        .catch(err => console.error('Failed to sync asset to Firestore:', err))
    }
    return {
      assetsData: {
        ...state.assetsData,
        [clientId]: nextList
      }
    };
  }),

  removeAsset: (clientId, recordId) => set((state) => {
    // Sync deletion to Firestore
    if (state.currentApplicationId) {
      firestoreSync.deleteAssetFromFirestore(state.currentApplicationId, recordId)
        .catch(err => console.error('Failed to delete asset from Firestore:', err))
    }
    const list = state.assetsData[clientId] || [];
    const nextList = list.filter(r => r.id !== recordId);
    return {
      assetsData: {
        ...state.assetsData,
        [clientId]: nextList
      }
    };
  }),

  setSharedOwners: (clientId, recordId, sharedClientIds) => set((state) => {
    const list = state.assetsData[clientId] || [];
    const nextList = list.map(r => r.id === recordId ? { ...r, sharedClientIds, updatedAt: new Date().toISOString() } : r);
    const updated = nextList.find(r => r.id === recordId);
    // Sync to Firestore
    if (state.currentApplicationId && updated) {
      firestoreSync.saveAssetToFirestore(state.currentApplicationId, recordId, updated)
        .catch(err => console.error('Failed to sync asset to Firestore:', err))
    }
    return {
      assetsData: {
        ...state.assetsData,
        [clientId]: nextList
      }
    };
  }),

  getAssets: (clientId) => {
    const state = get();
    return state.assetsData[clientId] || [];
  },

  // Totals/selectors
  getAssetTotalForClient: (clientId) => {
    const state = get();
    const list = state.assetsData[clientId] || [];
    return list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  },

  getPerClientAssetTotals: () => {
    const state = get();
    return Object.keys(state.clients).map(clientId => ({
      clientId,
      total: (state.assetsData[clientId] || []).reduce((s, r) => s + (Number(r.amount) || 0), 0)
    }));
  },

  getOverallAssetsTotal: () => {
    const state = get();
    return Object.values(state.assetsData).reduce((sum, list) => sum + (list || []).reduce((s, r) => s + (Number(r.amount) || 0), 0), 0);
  },
  // Aliases to satisfy spec/test naming
  selectAssetTotalForClient: (clientId) => get().getAssetTotalForClient(clientId),
  selectPerClientTotals: () => get().getPerClientAssetTotals(),
  selectOverallAssetsTotal: () => get().getOverallAssetsTotal(),
  
  // Condition actions
  generateConditionsForClient: (clientId: string) => {
    const state = get();
    const client = state.clients[clientId];
    if (!client) return;
    
    // Convert client data to the format expected by condition generator
    const clientData: ConditionGeneratorInput = {
      clientId,
      client,
      employmentData: state.employmentData[clientId]?.records || [],
      assets: state.assetsData[clientId] || []
    };
    
    // Pass applicationId to condition generator for Firestore ID generation
    const conditions = generateConditions(clientData, state.currentApplicationId || undefined);
    
    set((state) => {
      // Sync each condition to Firestore
      if (state.currentApplicationId) {
        conditions.forEach(condition => {
          firestoreSync.saveConditionToFirestore(state.currentApplicationId!, condition.id, condition)
            .catch(err => console.error('Failed to sync condition to Firestore:', err))
        })
      }
      return {
      conditionsData: {
        ...state.conditionsData,
        [clientId]: conditions
      }
      };
    });
  },
  
  updateConditionStatus: (clientId: string, conditionId: string, status: ConditionStatus) => set((state) => {
    const conditions = state.conditionsData[clientId] || [];
    const updatedConditions = conditions.map(condition => 
      condition.id === conditionId 
        ? updateConditionStatus(condition, status)
        : condition
    );
    
    const updatedCondition = updatedConditions.find(c => c.id === conditionId);
    // Sync to Firestore
    if (state.currentApplicationId && updatedCondition) {
      firestoreSync.saveConditionToFirestore(state.currentApplicationId, conditionId, updatedCondition)
        .catch(err => console.error('Failed to sync condition to Firestore:', err))
    }
    
    return {
      conditionsData: {
        ...state.conditionsData,
        [clientId]: updatedConditions
      }
    };
  }),
  
  addConditionNote: (clientId: string, conditionId: string, note: ConditionNote) => set((state) => {
    const conditions = state.conditionsData[clientId] || [];
    const updatedConditions = conditions.map(condition => 
      condition.id === conditionId 
        ? addConditionNote(condition, note)
        : condition
    );
    
    const updatedCondition = updatedConditions.find(c => c.id === conditionId);
    // Sync to Firestore
    if (state.currentApplicationId && updatedCondition) {
      firestoreSync.saveConditionToFirestore(state.currentApplicationId, conditionId, updatedCondition)
        .catch(err => console.error('Failed to sync condition to Firestore:', err))
    }
    
    return {
      conditionsData: {
        ...state.conditionsData,
        [clientId]: updatedConditions
      }
    };
  }),
  
  addConditionDocument: (clientId: string, conditionId: string, document: ConditionDocument) => set((state) => {
    const conditions = state.conditionsData[clientId] || [];
    const updatedConditions = conditions.map(condition => 
      condition.id === conditionId 
        ? { ...condition, documents: [...condition.documents, document], updatedAt: new Date().toISOString() }
        : condition
    );
    
    const updatedCondition = updatedConditions.find(c => c.id === conditionId);
    // Sync to Firestore
    if (state.currentApplicationId && updatedCondition) {
      firestoreSync.saveConditionToFirestore(state.currentApplicationId, conditionId, updatedCondition)
        .catch(err => console.error('Failed to sync condition to Firestore:', err))
    }
    
    return {
      conditionsData: {
        ...state.conditionsData,
        [clientId]: updatedConditions
      }
    };
  }),
  
  removeConditionDocument: (clientId: string, conditionId: string, documentId: string) => set((state) => {
    const conditions = state.conditionsData[clientId] || [];
    const updatedConditions = conditions.map(condition => 
      condition.id === conditionId 
        ? { ...condition, documents: condition.documents.filter(doc => doc.id !== documentId), updatedAt: new Date().toISOString() }
        : condition
    );
    
    const updatedCondition = updatedConditions.find(c => c.id === conditionId);
    // Sync to Firestore
    if (state.currentApplicationId && updatedCondition) {
      firestoreSync.saveConditionToFirestore(state.currentApplicationId, conditionId, updatedCondition)
        .catch(err => console.error('Failed to sync condition to Firestore:', err))
    }
    
    return {
      conditionsData: {
        ...state.conditionsData,
        [clientId]: updatedConditions
      }
    };
  }),
  
  getConditionsForClient: (clientId: string) => {
    const state = get();
    return state.conditionsData[clientId] || [];
  },
  
  getConditionStats: (clientId: string) => {
    const state = get();
    const conditions = state.conditionsData[clientId] || [];
    return getConditionStats(conditions);
  },
  
  getOpenConditionsCount: () => {
    const state = get();
    return Object.values(state.conditionsData).reduce((total, conditions) => {
      return total + conditions.filter(c => c.status === "pending" || c.status === "in_progress").length;
    }, 0);
  },
  
  // Document library actions
  getDocumentLibrary: () => {
    const state = get();
    return state.documentLibrary || [];
  },
  
  addToDocumentLibrary: (document: ConditionDocument) => set((state) => ({
    documentLibrary: [...state.documentLibrary, document]
  })),
  
  removeFromDocumentLibrary: (documentId: string) => set((state) => ({
    documentLibrary: state.documentLibrary.filter(doc => doc.id !== documentId)
  })),
  
  // Chat history actions
  addChatMessage: (message: ChatMessage) => set((state) => {
    // Ensure message has an id - generate one if missing
    const messageId = message.id || (state.currentApplicationId
      ? generateChatMessageId(state.currentApplicationId)
      : generateFallbackId('msg'));
    const messageWithId = { ...message, id: messageId };
    const updatedHistory = [...state.chatHistory, messageWithId];
    // Sync to Firestore - chatHistory collection with application ID
    if (state.currentApplicationId) {
      firestoreSync.saveChatMessageToFirestore(state.currentApplicationId, messageId, messageWithId)
        .catch(err => console.error('Failed to sync chat message to Firestore:', err))
    }
    return {
      chatHistory: updatedHistory
    };
  }),
  
  getChatHistory: () => {
    const state = get();
    return state.chatHistory;
  },
  
  clearChatHistory: () => set({ chatHistory: [] }),
  
  clearConditionsForClient: (clientId: string) => set((state) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [clientId]: _, ...newConditionsData } = state.conditionsData;
    return {
      conditionsData: newConditionsData
    };
  }),
  
  // Address actions
  updateAddressData: (clientId, data) => set((state) => {
    // Sync to Firestore
    if (state.currentApplicationId) {
      firestoreSync.saveAddressToFirestore(state.currentApplicationId, clientId, data)
        .catch(err => console.error('Failed to sync address to Firestore:', err))
    }
    return {
    addressData: {
      ...state.addressData,
      [clientId]: data
    }
    };
  }),
  
  getAddressData: (clientId) => {
    const state = get();
    return state.addressData[clientId] || {
      present: {
        id: 'present',
        fromDate: '',
        toDate: '',
        addr: {
          address1: '',
          address2: '',
          formattedAddress: '',
          city: '',
          region: '',
          postalCode: '',
          country: '',
          lat: 0,
          lng: 0,
        },
        isPresent: true
      },
      former: []
    };
  },
  
  addFormerAddress: (clientId, address) => set((state) => {
    const currentData = state.addressData[clientId] || { present: { id: 'present', fromDate: '', toDate: '', addr: { address1: '', address2: '', formattedAddress: '', city: '', region: '', postalCode: '', country: '', lat: 0, lng: 0 }, isPresent: true }, former: [] };
    return {
      addressData: {
        ...state.addressData,
        [clientId]: {
          ...currentData,
          former: [...currentData.former, address]
        }
      }
    };
  }),
  
  updateFormerAddress: (clientId, addressId, updates) => set((state) => {
    const currentData = state.addressData[clientId];
    if (!currentData) return state;
    
    return {
      addressData: {
        ...state.addressData,
        [clientId]: {
          ...currentData,
          former: currentData.former.map(addr => 
            addr.id === addressId ? { ...addr, ...updates } : addr
          )
        }
      }
    };
  }),
  
  removeFormerAddress: (clientId, addressId) => set((state) => {
    const currentData = state.addressData[clientId];
    if (!currentData) return state;
    
    return {
      addressData: {
        ...state.addressData,
        [clientId]: {
          ...currentData,
          former: currentData.former.filter(addr => addr.id !== addressId)
        }
      }
    };
  }),
  
  clearAddressData: (clientId) => set((state) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [clientId]: _, ...newAddressData } = state.addressData;
    return {
      addressData: newAddressData
    };
  }),

  // Firestore sync actions
  setCurrentApplicationId: (applicationId) => set({ currentApplicationId: applicationId }),

  loadApplicationFromFirestore: async (applicationId) => {
    try {
      console.log(`[Store] Loading application ${applicationId} from Firestore...`)
      const data = await firestoreSync.loadApplicationDataFromFirestore(applicationId);
      
      console.log(`[Store] Loaded data:`, {
        clientCount: Object.keys(data.clients).length,
        employmentDataKeys: Object.keys(data.employmentData),
        employmentDataDetails: Object.entries(data.employmentData).map(([clientId, empData]) => ({
          clientId,
          recordCount: empData.records.length
        }))
      })
      
      // Initialize counters for all clients (counters are no longer used for ID generation
      // since we use Firestore auto-IDs, but kept for backward compatibility)
      const employmentCounters: { [clientId: string]: number } = {};
      const incomeCounters: { [clientId: string]: number } = {};
      const realEstateCounters: { [clientId: string]: number } = {};
      const assetCounters: { [clientId: string]: number } = {};
      const conditionCounters: { [clientId: string]: number } = {};
      
      // Initialize counters for all loaded clients
      Object.keys(data.clients).forEach(clientId => {
        employmentCounters[clientId] = 0;
        incomeCounters[clientId] = 0;
        realEstateCounters[clientId] = 0;
        assetCounters[clientId] = 0;
        conditionCounters[clientId] = 0;
      });
      
      set({
        currentApplicationId: applicationId,
        clients: data.clients,
        employmentData: data.employmentData,
        employmentCounters,
        activeIncomeData: data.activeIncomeData,
        passiveIncomeData: data.passiveIncomeData,
        incomeTotals: data.incomeTotals,
        incomeCounters,
        assetsData: data.assetsData,
        assetCounters,
        realEstateData: data.realEstateData,
        realEstateCounters,
        addressData: data.addressData,
        conditionsData: data.conditionsData,
        conditionCounters,
        chatHistory: data.chatHistory,
        // Set active client to first client if exists
        activeClientId: Object.keys(data.clients)[0] || 'c1',
      });
      
      console.log(`[Store] Application ${applicationId} loaded successfully. Active client: ${Object.keys(data.clients)[0] || 'c1'}`)
    } catch (error) {
      console.error('Failed to load application from Firestore:', error);
      throw error;
    }
  }
      }),
      { name: 'application-store' }
    ),
    {
      name: 'application-store',
      version: 1,
    }
  )
);
