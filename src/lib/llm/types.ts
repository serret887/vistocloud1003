import type { VoiceUpdate, LLMAction, LLMResponse } from '@/types/voice-assistant'

/**
 * Current application state for LLM context
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
 * Configuration for LLM processing
 */
export interface LLMConfig {
  apiKey?: string
  model: string
  temperature: number
  maxTokens?: number
}

/**
 * Dynamic ID mapping for reference resolution
 */
export type DynamicIdMap = Map<string, string>

/**
 * Store action execution result
 */
export interface StoreActionResult {
  success: boolean
  update?: VoiceUpdate
  error?: string
}
