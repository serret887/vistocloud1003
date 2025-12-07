/**
 * Type definitions for AI processing
 */

export interface LLMApplicationState {
  clients: Record<string, any>;
  activeClientId: string;
  employmentData: Record<string, any>;
  incomeData: {
    active: Record<string, any>;
    passive: Record<string, any>;
    totals: Record<string, any>;
  };
  realEstateData: Record<string, any>;
  assetsData: Record<string, any>;
  addressData: Record<string, any>;
}



