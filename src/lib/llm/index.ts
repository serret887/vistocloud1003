/**
 * LLM Processing Module
 * 
 * This module handles the client-side execution of AI responses:
 * - Converting store state to LLM format
 * - Executing pre-processed, validated actions returned from the server
 * 
 * Note: All AI processing, transformations, and validation happen server-side via Firebase Functions.
 * The server handles address resolution, duplicate filtering, and validation before returning actions.
 */

// Action execution
export { executeStoreAction } from './actionExecutor'

// Store adapter - converts store state to LLM format
export { convertToLLMState, getCurrentLLMState } from './storeAdapter'

// Types
export type { LLMApplicationState, DynamicIdMap, StoreActionResult, LLMResponse } from './types'
