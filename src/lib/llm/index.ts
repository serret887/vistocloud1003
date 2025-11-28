// Main LLM processing module

// Core processing functions
export { processWithOpenAI } from './openaiProcessor'
export { processWithGemini } from './geminiProcessor'
export { resolveAddressesInActions } from './addressResolver'

// Utility functions
export { buildSystemPrompt } from './promptBuilder'
export { generateDefaultNextSteps } from './nextStepsGenerator'
export { filterDuplicateActions } from './duplicateFilter'
export { executeStoreAction } from './actionExecutor'

// Configuration and types
export { DEFAULT_LLM_CONFIG, getCurrentDateContext, calculateRelativeDate } from './config'
export type { LLMApplicationState, LLMConfig, DynamicIdMap, StoreActionResult } from './types'

// Store adapter
export { convertToLLMState, getCurrentLLMState } from './storeAdapter'
