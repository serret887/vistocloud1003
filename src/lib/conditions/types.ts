import type { Condition, ConditionCategory } from '$lib/types/conditions';
import type { EmploymentRecord } from '$lib/types/employment';
import type { ClientData } from '$lib/types/client-data';
import type { AssetRecord } from '$lib/types/assets';

/**
 * Input data for condition generation
 */
export interface ConditionGeneratorInput {
  clientId: string;
  client: ClientData;
  employmentData: EmploymentRecord[];
  assets: AssetRecord[];
}

/**
 * Context for building a single condition
 */
export interface ConditionBuilderContext {
  clientId: string;
  client: ClientData;
  conditionCounter: number;
}

/**
 * Function signature for adding a condition
 */
export type AddConditionFn = (
  category: ConditionCategory,
  title: string,
  description: string,
  priority: 'high' | 'medium' | 'low',
  daysUntilDue?: number
) => Condition;

/**
 * Generator function for a specific category of conditions
 */
export type ConditionCategoryGenerator = (
  input: ConditionGeneratorInput,
  addCondition: AddConditionFn
) => void;

