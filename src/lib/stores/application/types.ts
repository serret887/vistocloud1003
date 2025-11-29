// Application Store Types
import type { ClientData } from '$lib/types/client-data';
import type { ClientEmploymentData } from '$lib/types/employment';
import type { ClientIncomeData } from '$lib/types/income';
import type { ClientAssetsData } from '$lib/types/assets';
import type { ClientRealEstateData } from '$lib/types/real-estate';
import type { ClientAddressData } from '$lib/types/address';
import type { ApplicationStepId } from '$lib/types/application';

// Local ValidationError type to avoid circular dependency
export interface ValidationError {
  field: string;
  message: string;
}

// Document types
export interface DocumentRecord {
  id: string;
  conditionId: string;
  type: 'id' | 'income' | 'bank' | 'employment';
  filename: string;
  sizeBytes: number;
  mimeType: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadedAt: string | null;
  uploadedBy?: string;
  verifiedAt: string | null;
  verifiedBy?: string;
  notes?: string;
  version?: number;
}

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
  history: DocumentHistoryEntry[];
  conditionNotes: Record<string, string[]>;
}

// Main application state interface
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
  
  // Validation per client
  validationErrors: Record<string, Record<ApplicationStepId, ValidationError[]>>;
  visitedSteps: Record<string, Set<ApplicationStepId>>;
  touchedFields: Record<string, Set<string>>;
}


