// Default documents data factories
import type { ClientDocumentsData, DocumentRecord, DocumentHistoryEntry } from '../types';
import { generateId } from '$lib/idGenerator';

export const createDefaultDocumentsData = (clientId: string): ClientDocumentsData => ({
  clientId,
  documents: [],
  history: [],
  conditionNotes: {}
});

export const createDocumentRecord = (
  conditionId: string,
  type: DocumentRecord['type'],
  file: File,
  uploadedBy?: string
): DocumentRecord => ({
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
});

export const createHistoryEntry = (
  documentId: string,
  action: DocumentHistoryEntry['action'],
  user: string,
  note?: string,
  filename?: string
): DocumentHistoryEntry => ({
  id: generateId('hist'),
  documentId,
  action,
  timestamp: new Date().toISOString(),
  user,
  note,
  filename
});


