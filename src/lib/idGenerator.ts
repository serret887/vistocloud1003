import { browser } from '$app/environment';

/**
 * Centralized ID generator utility
 */

// Lazy-loaded Firebase for SSR compatibility
let firestoreModule: typeof import('firebase/firestore') | null = null;
let dbModule: typeof import('./firebase') | null = null;

async function getFirestore() {
  if (!browser) return null;
  if (!firestoreModule || !dbModule) {
    firestoreModule = await import('firebase/firestore');
    dbModule = await import('./firebase');
  }
  return { firestore: firestoreModule, db: dbModule.db };
}

/**
 * Generate a unique ID using Firestore's auto-ID mechanism (async)
 * Falls back to local ID generation in SSR
 */
export async function generateFirestoreId(collectionPath: string): Promise<string> {
  const modules = await getFirestore();
  if (modules) {
    const { firestore, db } = modules;
    const ref = firestore.doc(firestore.collection(db, collectionPath));
    return ref.id;
  }
  return generateFallbackId();
}

/**
 * Generate a unique ID with an optional prefix (synchronous, no Firebase)
 * Use this for local-only ID generation
 */
export function generateId(prefix?: string): string {
  return generateFallbackId(prefix);
}

/**
 * Generate a unique ID for a client
 */
export async function generateClientId(applicationId: string): Promise<string> {
  return generateFirestoreId(`applications/${applicationId}/clients`);
}

/**
 * Generate a unique ID for an employment record
 */
export async function generateEmploymentId(applicationId: string): Promise<string> {
  return generateFirestoreId(`applications/${applicationId}/employment`);
}

/**
 * Generate a unique ID for an income record
 */
export async function generateIncomeId(applicationId: string, type: 'active' | 'passive'): Promise<string> {
  return generateFirestoreId(`applications/${applicationId}/income/${type}`);
}

/**
 * Generate a unique ID for an asset record
 */
export async function generateAssetId(applicationId: string): Promise<string> {
  return generateFirestoreId(`applications/${applicationId}/assets`);
}

/**
 * Generate a unique ID for a real estate record
 */
export async function generateRealEstateId(applicationId: string): Promise<string> {
  return generateFirestoreId(`applications/${applicationId}/realEstate`);
}

/**
 * Generate a unique ID for a condition
 */
export async function generateConditionId(applicationId: string): Promise<string> {
  return generateFirestoreId(`applications/${applicationId}/conditions`);
}

/**
 * Generate a unique ID for a chat message
 */
export async function generateChatMessageId(applicationId: string): Promise<string> {
  return generateFirestoreId(`applications/${applicationId}/chatHistory`);
}

/**
 * Generate a unique ID for a document
 */
export async function generateDocumentId(applicationId?: string): Promise<string> {
  if (applicationId) {
    return generateFirestoreId(`applications/${applicationId}/documents`);
  }
  return generateFallbackId('doc');
}

/**
 * Fallback ID generator (synchronous, no external dependencies)
 * Uses timestamp + multiple random components + counter for enhanced uniqueness
 */
let fallbackCounter = 0;
export function generateFallbackId(prefix?: string): string {
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).slice(2, 11);
  const random2 = Math.random().toString(36).slice(2, 11);
  const counter = (++fallbackCounter % 10000).toString(36).padStart(4, '0');
  const id = `${timestamp}-${random1}-${random2}-${counter}`;
  return prefix ? `${prefix}-${id}` : id;
}
