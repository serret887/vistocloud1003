/**
 * LLM Processing Module
 * 
 * This module handles the client-side processing of AI responses:
 * - Converting store state to LLM format
 * - Executing actions returned from the server
 * - Resolving addresses and filtering duplicates
 * 
 * Note: Actual AI processing happens server-side via Firebase Functions
 */

// Action execution and processing
export { executeStoreAction } from './actionExecutor'
export { resolveAddressesInActions } from './addressResolver'
export { filterDuplicateActions } from './duplicateFilter'

// Store adapter - converts store state to LLM format
export { convertToLLMState, getCurrentLLMState } from './storeAdapter'

// Types
export type { LLMApplicationState, DynamicIdMap, StoreActionResult, LLMResponse } from './types'
