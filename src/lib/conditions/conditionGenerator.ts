/**
 * Main Condition Generator
 * 
 * Orchestrates the generation of all conditions across categories:
 * ID, Income, Assets, Property, and Credit
 */

import type { Condition } from '@/types/conditions';
import type { ConditionGeneratorInput } from './types';
import {
  generateIdConditions,
  generateIncomeConditions,
  generateAssetConditions,
  generatePropertyConditions,
  generateCreditConditions
} from './index';

export type { ConditionGeneratorInput } from './types';

export interface ConditionGenerationResult {
  conditions: Condition[];
  stats: {
    total: number;
    pending: number;
    completed: number;
  };
}

/**
 * Generate all conditions for a client based on their data
 * 
 * @param input - Client data including ID, citizenship, employment, and assets
 * @returns Array of generated conditions
 */
export function generateConditions(input: ConditionGeneratorInput): Condition[] {
  const conditions: Condition[] = [];
  let conditionCounter = 1;

  // Create a strongly-typed addCondition function
  const addCondition = (
    category: Condition['category'],
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    daysUntilDue: number = 14
  ): Condition => {
    const condition: Condition = {
      id: `${input.clientId}-condition-${conditionCounter++}`,
      clientId: input.clientId,
      category,
      title,
      description,
      status: 'pending',
      priority,
      dueDate: new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      notes: [],
      documents: []
    };
    
    conditions.push(condition);
    return condition;
  };

  // Generate conditions by category
  generateIdConditions(input, addCondition);
  generateIncomeConditions(input, addCondition);
  generateAssetConditions(input, addCondition);
  generatePropertyConditions(input, addCondition);
  generateCreditConditions(input, addCondition);

  return conditions;
}

/**
 * Generate conditions and return with statistics
 * 
 * @param input - Client data
 * @returns Conditions with statistics
 */
export function generateConditionsWithStats(input: ConditionGeneratorInput): ConditionGenerationResult {
  const conditions = generateConditions(input);
  
  const stats = {
    total: conditions.length,
    pending: conditions.filter(c => c.status === 'pending').length,
    completed: conditions.filter(c => c.status === 'completed').length
  };

  return { conditions, stats };
}

