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

export type ApplicationState = {
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
};

export const useApplicationStore = create<ApplicationState>()(
  persist(
    devtools(
      (set, get) => ({
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
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      clients: { ...state.clients, [id]: { firstName: '', lastName: '', email: '', phone: '', ssn: '', dob: '', citizenship: 'US Citizen', maritalStatus: 'Unmarried', hasMilitaryService: false, militaryNote: null } },
      activeClientId: id,
      employmentCounters: { ...state.employmentCounters, [id]: 0 }
    }));
    return id;
  },
  
  removeClient: (id) => set((state) => {
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
    }
    
    return {
      clients: { ...state.clients, [id]: { ...state.clients[id], ...validationResult.data } },
    }
  }),

  // Employment helpers
  getNextEmploymentId: (clientId) => {
    const state = get();
    const current = state.employmentCounters[clientId] || 0;
    const next = current + 1;
    set({ employmentCounters: { ...state.employmentCounters, [clientId]: next } });
    return `emp-${clientId}-${next}`;
  },

  // Employment actions
  addEmploymentRecord: (clientId) => {
    const id = get().getNextEmploymentId(clientId);
    const now = new Date().toISOString();
    
    // Auto-fill endDate with the startDate of the previous employment to avoid gaps
    const state = get();
    const currentData = state.employmentData[clientId] || { clientId, records: [] };
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
    }

    const updatedRecords = currentData.records.map(record =>
      record.id === recordId 
        ? { ...record, ...validationResult.data, updatedAt: new Date().toISOString() }
        : record
    );

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

  // Income actions
  getNextIncomeId: (clientId) => {
    const state = get();
    const counter = (state.incomeCounters[clientId] || 0) + 1;
    set((state) => ({
      incomeCounters: { ...state.incomeCounters, [clientId]: counter }
    }));
    return `income-${clientId}-${counter}`;
  },

  addActiveIncome: (clientId) => {
    const id = get().getNextIncomeId(clientId);
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
    
    set((state) => ({
      activeIncomeData: {
        ...state.activeIncomeData,
        [clientId]: [...(state.activeIncomeData[clientId] || []), emptyRecord]
      }
    }));
    
    return id;
  },

  updateActiveIncome: (clientId, recordId, updates) => set((state) => {
    const currentRecords = state.activeIncomeData[clientId] || [];
    const updatedRecords = currentRecords.map(record =>
      record.id === recordId ? { ...record, ...updates } : record
    );
    return {
      activeIncomeData: {
        ...state.activeIncomeData,
        [clientId]: updatedRecords
      }
    };
  }),

  removeActiveIncome: (clientId, recordId) => set((state) => {
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
    const id = get().getNextIncomeId(clientId);
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
    
    set((state) => ({
      passiveIncomeData: {
        ...state.passiveIncomeData,
        [clientId]: [...(state.passiveIncomeData[clientId] || []), emptyRecord]
      }
    }));
    
    return id;
  },

  updatePassiveIncome: (clientId, recordId, updates) => set((state) => {
    const currentRecords = state.passiveIncomeData[clientId] || [];
    const updatedRecords = currentRecords.map(record =>
      record.id === recordId ? { ...record, ...updates } : record
    );
    return {
      passiveIncomeData: {
        ...state.passiveIncomeData,
        [clientId]: updatedRecords
      }
    };
  }),

  removePassiveIncome: (clientId, recordId) => set((state) => {
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

  updateIncomeTotal: (clientId, total) => set((state) => ({
    incomeTotals: {
      ...state.incomeTotals,
      [clientId]: {
        ...state.incomeTotals[clientId],
        id: `total-${clientId}`,
        clientId,
        totalMonthlyIncome: 0,
        ...total,
        updatedAt: new Date().toISOString()
      }
    }
  })),

  getIncomeTotal: (clientId) => {
    const state = get();
    return state.incomeTotals[clientId] || {
      id: `total-${clientId}`,
      clientId,
      totalMonthlyIncome: 0
    };
  },

  // Real estate helpers
  getNextRealEstateId: (clientId) => {
    const state = get();
    const current = state.realEstateCounters[clientId] || 0;
    const next = current + 1;
    set({ realEstateCounters: { ...state.realEstateCounters, [clientId]: next } });
    return `re-${clientId}-${next}`;
  },

  // Real estate actions
  addRealEstateRecord: (clientId) => {
    const id = get().getNextRealEstateId(clientId);
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

  // Assets helpers
  getNextAssetId: (clientId) => {
    const state = get();
    const current = state.assetCounters[clientId] || 0;
    const next = current + 1;
    set({ assetCounters: { ...state.assetCounters, [clientId]: next } });
    return `asset-${clientId}-${next}`;
  },

  // Assets actions
  addAsset: (clientId: string) => {
    const id = get().getNextAssetId(clientId);
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
      const list = state.assetsData[clientId] || [];
      return {
        assetsData: {
          ...state.assetsData,
          [clientId]: [...list, emptyRecord]
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
    return {
      assetsData: {
        ...state.assetsData,
        [clientId]: nextList
      }
    };
  }),

  removeAsset: (clientId, recordId) => set((state) => {
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
    
    const conditions = generateConditions(clientData);
    
    set((state) => ({
      conditionsData: {
        ...state.conditionsData,
        [clientId]: conditions
      }
    }));
  },
  
  updateConditionStatus: (clientId: string, conditionId: string, status: ConditionStatus) => set((state) => {
    const conditions = state.conditionsData[clientId] || [];
    const updatedConditions = conditions.map(condition => 
      condition.id === conditionId 
        ? updateConditionStatus(condition, status)
        : condition
    );
    
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
  addChatMessage: (message: ChatMessage) => set((state) => ({
    chatHistory: [...state.chatHistory, message]
  })),
  
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
  updateAddressData: (clientId, data) => set((state) => ({
    addressData: {
      ...state.addressData,
      [clientId]: data
    }
  })),
  
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
  })
      }),
      { name: 'application-store' }
    ),
    {
      name: 'application-store',
      version: 1,
    }
  )
);
