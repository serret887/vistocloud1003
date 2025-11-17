import { collection, doc } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Centralized ID generator utility
 * Uses Firestore's auto-ID generation for guaranteed unique IDs
 */

/**
 * Generate a unique ID using Firestore's auto-ID mechanism
 * This is synchronous and doesn't require a write operation
 * @param collectionPath - The Firestore collection path (e.g., 'applications/{appId}/clients')
 * @returns A unique ID string
 */
export function generateFirestoreId(collectionPath: string): string {
  const ref = doc(collection(db, collectionPath))
  return ref.id
}

/**
 * Generate a unique ID for a client
 * @param applicationId - The application ID
 * @returns A unique client ID
 */
export function generateClientId(applicationId: string): string {
  return generateFirestoreId(`applications/${applicationId}/clients`)
}

/**
 * Generate a unique ID for an employment record
 * @param applicationId - The application ID
 * @returns A unique employment record ID
 */
export function generateEmploymentId(applicationId: string): string {
  return generateFirestoreId(`applications/${applicationId}/employment`)
}

/**
 * Generate a unique ID for an income record (active or passive)
 * @param applicationId - The application ID
 * @param type - 'active' or 'passive'
 * @returns A unique income record ID
 */
export function generateIncomeId(applicationId: string, type: 'active' | 'passive'): string {
  return generateFirestoreId(`applications/${applicationId}/income/${type}`)
}

/**
 * Generate a unique ID for an asset record
 * @param applicationId - The application ID
 * @returns A unique asset ID
 */
export function generateAssetId(applicationId: string): string {
  return generateFirestoreId(`applications/${applicationId}/assets`)
}

/**
 * Generate a unique ID for a real estate record
 * @param applicationId - The application ID
 * @returns A unique real estate ID
 */
export function generateRealEstateId(applicationId: string): string {
  return generateFirestoreId(`applications/${applicationId}/realEstate`)
}

/**
 * Generate a unique ID for a condition
 * @param applicationId - The application ID
 * @returns A unique condition ID
 */
export function generateConditionId(applicationId: string): string {
  return generateFirestoreId(`applications/${applicationId}/conditions`)
}

/**
 * Generate a unique ID for a chat message
 * @param applicationId - The application ID
 * @returns A unique chat message ID
 */
export function generateChatMessageId(applicationId: string): string {
  return generateFirestoreId(`applications/${applicationId}/chatHistory`)
}

/**
 * Generate a unique ID for a document
 * Uses Firestore auto-ID for consistency
 * @param applicationId - The application ID (optional, for consistency)
 * @returns A unique document ID
 */
export function generateDocumentId(applicationId?: string): string {
  if (applicationId) {
    return generateFirestoreId(`applications/${applicationId}/documents`)
  }
  // Fallback to enhanced ID generator if no applicationId
  return generateFallbackId('doc')
}

/**
 * Fallback ID generator for cases where Firestore path is not available
 * Uses timestamp + multiple random components + counter for enhanced uniqueness
 * Collision probability: Extremely low (timestamp + 2 random strings + performance counter)
 * @param prefix - Optional prefix for the ID (e.g., 'msg', 'doc')
 * @returns A unique ID string
 */
let fallbackCounter = 0;
export function generateFallbackId(prefix?: string): string {
  const timestamp = Date.now()
  const random1 = Math.random().toString(36).slice(2, 11) // 9 chars
  const random2 = Math.random().toString(36).slice(2, 11) // 9 chars
  const counter = (++fallbackCounter % 10000).toString(36).padStart(4, '0') // 4 chars, wraps at 10000
  const id = `${timestamp}-${random1}-${random2}-${counter}`
  return prefix ? `${prefix}-${id}` : id
}

