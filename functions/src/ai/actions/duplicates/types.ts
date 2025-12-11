/**
 * Types for duplicate filtering
 */

export interface LLMAction {
  action: string;
  params?: any;
  returnId?: string;
}

export interface ApplicationState {
  clients?: Record<string, any>;
  employmentData?: Record<string, any>;
  incomeData?: {
    active?: Record<string, any>;
  };
  assetsData?: Record<string, any>;
}


