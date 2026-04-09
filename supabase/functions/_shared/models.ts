/**
 * AI Model Tiers for MiCasa BOS
 * 
 * Using OpenAI GPT models via user's API key
 * 
 * Tier 1: CLASSIFICATION - openai/gpt-5-nano
 * - Fastest, lowest cost
 * - Best for: structured output, classification, extraction
 * - Use cases: lead qualification, listing FAQ
 * 
 * Tier 2: REASONING (Balanced) - openai/gpt-5-mini
 * - Good balance of speed and capability
 * - Best for: reasoning with constraints, semi-structured output
 * - Use cases: property matching, ops assistant
 * 
 * Tier 3: CREATIVE (LLM) - openai/gpt-5
 * - Most capable, higher latency
 * - Best for: creative generation, complex reasoning
 * - Use cases: marketing copy, open-ended generation
 */
export const AI_MODELS = {
  /** Fast - Classification & Extraction tasks */
  CLASSIFICATION: "openai/gpt-5-nano",
  
  /** Balanced - Reasoning with constraints */
  REASONING: "openai/gpt-5-mini",
  
  /** Full - Creative generation */
  CREATIVE: "openai/gpt-5",
} as const;

export type ModelTier = keyof typeof AI_MODELS;
export type ModelName = typeof AI_MODELS[ModelTier];
