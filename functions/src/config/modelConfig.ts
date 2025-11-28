/**
 * Model configuration for easy model swapping
 * Supports both Vertex AI (with Express Mode or ADC) and Google AI (Gemini Developer API)
 */

export interface ModelConfig {
  provider: 'vertex' | 'vertexExpress' | 'googleAI';
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  location?: string; // For Vertex AI (default: 'global')
}

/**
 * Default model configuration
 * Can be easily swapped by changing these values
 */
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  provider: 'vertexExpress', // 'vertex' (ADC), 'vertexExpress' (API key), or 'googleAI' (Gemini Developer API)
  model: 'gemini-1.5-flash', // Can be: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash, etc.
  temperature: 0.3,
  maxOutputTokens: 4000,
  location: 'global', // For Vertex AI: 'global', 'us-central1', etc.
};

/**
 * Get model configuration from environment or use defaults
 */
export function getModelConfig(): ModelConfig {
  return {
    provider: (process.env.AI_PROVIDER as 'vertex' | 'vertexExpress' | 'googleAI') || DEFAULT_MODEL_CONFIG.provider,
    model: process.env.AI_MODEL || DEFAULT_MODEL_CONFIG.model,
    temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : DEFAULT_MODEL_CONFIG.temperature,
    maxOutputTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : DEFAULT_MODEL_CONFIG.maxOutputTokens,
    location: process.env.VERTEX_AI_LOCATION || DEFAULT_MODEL_CONFIG.location,
  };
}

