/**
 * Condition Management Module
 * 
 * This module provides strongly-typed condition generation and management:
 * 
 * **Generation (organized by category):**
 * - ID: Government ID, Visa documentation
 * - Income: W-2s, Pay Stubs, Tax Returns
 * - Assets: Bank Statements, Investment Statements
 * - Property: Purchase Agreement, Appraisal, Title
 * - Credit: Credit Reports, Explanations
 * 
 * **Management:**
 * - Status updates
 * - Notes
 * - Statistics
 */

// Main generator
export { generateConditions, generateConditionsWithStats } from './conditionGenerator';
export type { ConditionGenerationResult } from './conditionGenerator';

// Category generators
export { generateIdConditions } from './idConditions';
export { generateIncomeConditions } from './incomeConditions';
export { generateAssetConditions } from './assetConditions';
export { generatePropertyConditions } from './propertyConditions';
export { generateCreditConditions } from './creditConditions';

// Status management
export { updateConditionStatus, getConditionStats, VALIDATION_RULES } from './conditionStatus';

// Notes management
export { addConditionNote } from './conditionNotes';

// Types
export type {
  ConditionGeneratorInput,
  ConditionBuilderContext,
  AddConditionFn,
  ConditionCategoryGenerator
} from './types';
