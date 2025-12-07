// Documents-related store actions
import type { Writable } from 'svelte/store';
import type { ApplicationState, DocumentRecord, DocumentHistoryEntry } from '../types';
import { generateId } from '$lib/idGenerator';
import { createDefaultDocumentsData, createDocumentRecord, createHistoryEntry } from '../defaults';

export function createDocumentsActions(
  update: Writable<ApplicationState>['update']
) {
  return {
    uploadDocument: (clientId: string, conditionId: string, type: DocumentRecord['type'], file: File, uploadedBy?: string) => {
      const newDocument = createDocumentRecord(conditionId, type, file, uploadedBy);
      
      update(state => {
        const currentDocs = state.documentsData[clientId] || createDefaultDocumentsData(clientId);
        
        // Determine version
        const existingDocs = currentDocs.documents.filter(d => d.conditionId === conditionId);
        if (existingDocs.length > 0) {
          const maxVersion = Math.max(...existingDocs.map(d => d.version || 1));
          newDocument.version = maxVersion + 1;
        }
        
        const historyEntry = createHistoryEntry(
          newDocument.id,
          'uploaded',
          uploadedBy || 'user',
          undefined,
          file.name
        );
        
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
    
    addConditionNote: (clientId: string, conditionId: string, note: string, user?: string) => {
      update(state => {
        const currentDocs = state.documentsData[clientId] || createDefaultDocumentsData(clientId);
        const notes = currentDocs.conditionNotes[conditionId] || [];
        
        const historyEntry = createHistoryEntry(conditionId, 'note_added', user || 'user', note);
        
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
        
        const historyEntry = createHistoryEntry(
          documentId,
          'removed',
          user || 'user',
          undefined,
          document?.filename
        );
        
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
    }
  };
}



