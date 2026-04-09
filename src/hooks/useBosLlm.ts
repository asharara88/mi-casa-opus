import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type OperationalMode = "OPS" | "LEAD_QUALIFY" | "LISTING_FAQ" | "MARKETING_COPY" | "PROPERTY_MATCH";
type ContextType = "listing" | "lead" | "transaction" | "marketing";

// Helper to extract HTTP status from Supabase invoke errors
function getInvokeStatus(error: unknown): number | undefined {
  const anyErr = error as { context?: { status?: number }; status?: number; cause?: { status?: number } };
  return anyErr?.context?.status ?? anyErr?.status ?? anyErr?.cause?.status;
}

interface RouterRequest {
  modeHint?: OperationalMode | null;
  userIntent: string;
  contextType?: ContextType | null;
  bosPayload: Record<string, unknown>;
  complianceResult?: Record<string, unknown>;
}

export interface LeadQualification {
  score: number;
  tier: "HOT" | "WARM" | "COOL" | "COLD";
  routing: "ASSIGN_SENIOR" | "ASSIGN_AVAILABLE" | "NURTURE" | "DISQUALIFY";
  gaps: string[];
  next_action: string;
  rationale: string;
}

export interface MarketingCopy {
  headline: string;
  body: string;
  identifiers?: {
    brokerage_license?: string;
    broker_name?: string;
    broker_license?: string;
    madhmoun_id?: string;
  };
  compliance_flags?: string[];
  is_compliant: boolean;
}

export interface PropertyMatch {
  listing_id: string;
  match_score: number;
  match_tier: "EXCELLENT" | "GOOD" | "PARTIAL" | "STRETCH";
  match_reasons: string[];
  concerns: string[];
  negotiation_angle?: string;
  broker_talking_points?: string[];
}

export interface PropertyMatchResult {
  matches: PropertyMatch[];
  summary: string;
  recommendation: string;
}

// Route to the appropriate mode
export function useBosLlmRouter() {
  const [isRouting, setIsRouting] = useState(false);

  const routeRequest = useCallback(async (request: RouterRequest): Promise<OperationalMode> => {
    setIsRouting(true);
    try {
      const { data, error } = await supabase.functions.invoke('bos-llm-router', {
        body: request,
      });

      if (error) throw error;
      return data.selectedMode as OperationalMode;
    } catch (error) {
      console.error('[BOS LLM Router] Error:', error);
      const status = getInvokeStatus(error);
      if (status === 429) toast.error('Rate limit exceeded. Please try again later.');
      else if (status === 402) toast.error('AI credits depleted. Please add funds.');
      else toast.error('Failed to route request');
      return 'OPS'; // Default fallback
    } finally {
      setIsRouting(false);
    }
  }, []);

  return { routeRequest, isRouting };
}

// OPS mode - streaming responses
export function useBosLlmOps() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [response, setResponse] = useState('');

  const askOps = useCallback(async (
    userIntent: string,
    bosPayload?: Record<string, unknown>,
    complianceResult?: Record<string, unknown>,
    conversationHistory?: Array<{ role: string; content: string }>
  ) => {
    setIsStreaming(true);
    setResponse('');

    try {
      // Get user session for authenticated calls
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) headers['apikey'] = apiKey;
      
      // Prefer user JWT for authenticated calls
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bos-llm-ops`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ userIntent, bosPayload, complianceResult, conversationHistory }),
        }
      );

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
          return;
        }
        if (resp.status === 402) {
          toast.error('AI credits depleted. Please add funds.');
          return;
        }
        throw new Error('Failed to get response');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            // Incomplete JSON, re-buffer
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('[BOS OPS] Error:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { askOps, isStreaming, response };
}

// Lead Qualification mode
export function useBosLlmLeadQualify() {
  const [isQualifying, setIsQualifying] = useState(false);
  const [qualification, setQualification] = useState<LeadQualification | null>(null);

  const qualifyLead = useCallback(async (
    userIntent: string,
    leadData: Record<string, unknown>
  ): Promise<LeadQualification | null> => {
    setIsQualifying(true);
    setQualification(null);

    try {
      const { data, error } = await supabase.functions.invoke('bos-llm-lead-qualify', {
        body: { userIntent, bosPayload: { lead: leadData } },
      });

      if (error) throw error;

      if (data.qualification) {
        setQualification(data.qualification);
        return data.qualification;
      }
      return null;
    } catch (error) {
      console.error('[BOS Lead Qualify] Error:', error);
      const status = getInvokeStatus(error);
      if (status === 429) toast.error('Rate limit exceeded. Please try again later.');
      else if (status === 402) toast.error('AI credits depleted. Please add funds.');
      else toast.error('Failed to qualify lead');
      return null;
    } finally {
      setIsQualifying(false);
    }
  }, []);

  return { qualifyLead, isQualifying, qualification };
}

// Listing FAQ mode
export function useBosLlmListingFaq() {
  const [isAnswering, setIsAnswering] = useState(false);
  const [answer, setAnswer] = useState('');

  const askAboutListing = useCallback(async (
    question: string,
    listingData: Record<string, unknown>
  ): Promise<string> => {
    setIsAnswering(true);
    setAnswer('');

    try {
      const { data, error } = await supabase.functions.invoke('bos-llm-listing-faq', {
        body: { userIntent: question, bosPayload: { listing: listingData } },
      });

      if (error) throw error;

      if (data.answer) {
        setAnswer(data.answer);
        return data.answer;
      }
      return 'Unable to answer question.';
    } catch (error) {
      console.error('[BOS Listing FAQ] Error:', error);
      const status = getInvokeStatus(error);
      if (status === 429) toast.error('Rate limit exceeded. Please try again later.');
      else if (status === 402) toast.error('AI credits depleted. Please add funds.');
      else toast.error('Failed to get answer');
      return 'Error getting answer.';
    } finally {
      setIsAnswering(false);
    }
  }, []);

  return { askAboutListing, isAnswering, answer };
}

// Marketing Copy mode
export function useBosLlmMarketingCopy() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copy, setCopy] = useState<MarketingCopy | null>(null);

  const generateCopy = useCallback(async (
    userIntent: string,
    bosPayload: {
      listing?: Record<string, unknown>;
      broker?: { name?: string; license_number?: string };
      brokerage?: { license_number?: string; name?: string };
      madhmoun_id?: string;
      format?: "HEADLINE" | "DESCRIPTION" | "SOCIAL_POST" | "EMAIL" | "AD_COPY";
      platform?: string;
    }
  ): Promise<MarketingCopy | null> => {
    setIsGenerating(true);
    setCopy(null);

    try {
      const { data, error } = await supabase.functions.invoke('bos-llm-marketing-copy', {
        body: { userIntent, bosPayload },
      });

      if (error) throw error;

      if (data.copy) {
        setCopy(data.copy);
        return data.copy;
      }
      return null;
    } catch (error) {
      console.error('[BOS Marketing Copy] Error:', error);
      const status = getInvokeStatus(error);
      if (status === 429) toast.error('Rate limit exceeded. Please try again later.');
      else if (status === 402) toast.error('AI credits depleted. Please add funds.');
      else toast.error('Failed to generate marketing copy');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateCopy, isGenerating, copy };
}

// Property Matching mode
export function useBosLlmPropertyMatch() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<PropertyMatchResult | null>(null);

  const matchProperties = useCallback(async (
    leadRequirements: {
      budget_min?: number;
      budget_max?: number;
      property_types?: string[];
      locations?: string[];
      bedrooms_min?: number;
    },
    availableListings: Array<{
      id: string;
      listing_id: string;
      listing_type: string;
      status: string;
      listing_attributes?: Record<string, unknown>;
      asking_terms?: Record<string, unknown>;
    }>
  ): Promise<PropertyMatchResult | null> => {
    setIsMatching(true);
    setMatchResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('bos-llm-property-match', {
        body: { leadRequirements, availableListings },
      });

      if (error) throw error;

      if (data.result) {
        setMatchResult(data.result);
        return data.result;
      }
      return null;
    } catch (error) {
      console.error('[BOS Property Match] Error:', error);
      const status = getInvokeStatus(error);
      if (status === 429) toast.error('Rate limit exceeded. Please try again later.');
      else if (status === 402) toast.error('AI credits depleted. Please add funds.');
      else toast.error('Failed to match properties');
      return null;
    } finally {
      setIsMatching(false);
    }
  }, []);

  return { matchProperties, isMatching, matchResult };
}

// Combined hook that routes and executes
export function useBosLlm() {
  const { routeRequest, isRouting } = useBosLlmRouter();
  const { askOps, isStreaming: isOpsStreaming, response: opsResponse } = useBosLlmOps();
  const { qualifyLead, isQualifying, qualification } = useBosLlmLeadQualify();
  const { askAboutListing, isAnswering, answer } = useBosLlmListingFaq();
  const { generateCopy, isGenerating, copy } = useBosLlmMarketingCopy();
  const { matchProperties, isMatching, matchResult } = useBosLlmPropertyMatch();

  const isLoading = isRouting || isOpsStreaming || isQualifying || isAnswering || isGenerating || isMatching;

  return {
    routeRequest,
    askOps,
    qualifyLead,
    askAboutListing,
    generateCopy,
    matchProperties,
    isLoading,
    isRouting,
    isOpsStreaming,
    isQualifying,
    isAnswering,
    isGenerating,
    isMatching,
    opsResponse,
    qualification,
    answer,
    copy,
    matchResult,
  };
}
