export type Application = {
  id: string; // Firestore doc id
  applicationNumber: string; // GUID/UUID
  createdAt: unknown; // Firestore Timestamp or ISO string depending on layer
  status: 'draft';
  ownerId: string;
  ownerWorkspace: string;
  source?: string;
  currentStepId?: string;
  overallProgress?: number;
  updatedAt?: unknown;
};




