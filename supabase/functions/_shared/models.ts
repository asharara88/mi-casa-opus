/**
 * AI Model Tiers for MiCasa BOS
 * 
 * Tier 1: CLASSIFICATION (SLM) - google/gemini-2.5-flash-lite
 * - Fastest, lowest cost
 * - Best for: structured output, classification, extraction
 * - Use cases: lead qualification, listing FAQ
 * 
 * Tier 2: REASONING (Balanced) - google/gemini-2.5-flash
 * - Good balance of speed and capability
 * - Best for: reasoning with constraints, semi-structured output
 * - Use cases: property matching, ops assistant
 * 
 * Tier 3: CREATIVE (LLM) - google/gemini-3-flash-preview
 * - Most capable, higher latency
 * - Best for: creative generation, complex reasoning
 * - Use cases: marketing copy, open-ended generation
 */
export const AI_MODELS = {
  /** SLM - Classification & Extraction tasks */
  CLASSIFICATION: "google/gemini-2.5-flash-lite",
  
  /** Balanced - Reasoning with constraints */
  REASONING: "google/gemini-2.5-flash",
  
  /** LLM - Creative generation */
  CREATIVE: "google/gemini-3-flash-preview",
} as const;

export type ModelTier = keyof typeof AI_MODELS;
export type ModelName = typeof AI_MODELS[ModelTier];
