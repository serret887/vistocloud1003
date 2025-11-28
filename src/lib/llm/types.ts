/**
 * Type definitions for LLM processing
 * These types are used for communication between client and server
 */

/**
 * Current application state format for LLM context
 * This is sent to the server for processing
 */
export interface LLMApplicationState {
  clients: Record<string, any>
  activeClientId: string
  employmentData: Record<string, any>
  incomeData: {
    active: Record<string, any>
    passive: Record<string, any>
    totals: Record<string, any>
  }
  realEstateData: Record<string, any>
  assetsData: Record<string, any>
  addressData: Record<string, any>
}

/**
 * Dynamic ID mapping for reference resolution
 * Used to map temporary IDs (like "$c2") to actual store IDs
 */
export type DynamicIdMap = Map<string, string>

/**
 * Store action execution result
 */
export interface StoreActionResult {
  success: boolean
  update?: import('$lib/types/voice-assistant').VoiceUpdate
  error?: string
}

/**
 * LLM Response type (re-exported for convenience)
 */
export type { LLMResponse } from '$lib/types/voice-assistant'
