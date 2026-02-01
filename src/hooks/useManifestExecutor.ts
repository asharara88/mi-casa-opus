import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  ManifestExecutorRequest,
  ManifestExecutorResponse,
  ManifestPrompt,
  GeneratedDocument,
  WorkflowGateResult
} from "@/types/manifest";

interface UseManifestExecutorReturn {
  execute: (request: ManifestExecutorRequest) => Promise<ManifestExecutorResponse>;
  isLoading: boolean;
  error: string | null;
  lastResponse: ManifestExecutorResponse | null;
}

export function useManifestExecutor(): UseManifestExecutorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ManifestExecutorResponse | null>(null);

  const execute = useCallback(async (request: ManifestExecutorRequest): Promise<ManifestExecutorResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("bos-manifest-executor", {
        body: request
      });

      if (fnError) {
        const errorMsg = fnError.message || "Execution failed";
        setError(errorMsg);
        return { success: false, promptId: request.promptId, error: errorMsg };
      }

      const response = data as ManifestExecutorResponse;
      setLastResponse(response);
      
      if (!response.success) {
        setError(response.error || "Unknown error");
      }

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unexpected error";
      setError(errorMsg);
      return { success: false, promptId: request.promptId, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { execute, isLoading, error, lastResponse };
}

// =====================================================
// SPECIALIZED HOOKS FOR SPECIFIC USE CASES
// =====================================================

export function useWorkflowGate() {
  const { execute, isLoading, error } = useManifestExecutor();

  const evaluateGate = useCallback(async (
    gateId: "FLOW_SALES_GATE" | "FLOW_LEASING_GATE",
    documentsPresent: string[],
    requestedAction: string,
    dealId?: string
  ): Promise<{
    status: "APPROVED" | "BLOCKED";
    missing: string[];
    nextActions: string[];
  }> => {
    const response = await execute({
      promptId: gateId,
      inputPayload: {
        requested_action: requestedAction,
        documents_present: documentsPresent
      },
      dealId
    });

    return {
      status: response.gateStatus || "BLOCKED",
      missing: response.missing || [],
      nextActions: response.next_allowed_actions || []
    };
  }, [execute]);

  return { evaluateGate, isLoading, error };
}

export function useDocumentGenerator() {
  const { execute, isLoading, error, lastResponse } = useManifestExecutor();

  const generateDocument = useCallback(async (
    promptId: string,
    inputPayload: Record<string, unknown>,
    entityType?: string,
    entityId?: string
  ): Promise<{
    title: string;
    body: string;
    documentId?: string;
  } | null> => {
    const response = await execute({
      promptId,
      inputPayload,
      entityType,
      entityId
    });

    if (!response.success) return null;

    return {
      title: response.document_title || "Untitled Document",
      body: response.document_body || "",
      documentId: response.generatedDocumentId
    };
  }, [execute]);

  return { generateDocument, isLoading, error, lastResponse };
}

export function useAMLCheck() {
  const { execute, isLoading, error } = useManifestExecutor();

  const checkAML = useCallback(async (
    dealValueAed: number,
    paymentMethod: "cash" | "bank_transfer" | "mortgage" | "crypto" | "mixed" | "unknown",
    buyerFlags: {
      pep_declared?: boolean;
      unusual_urgency?: boolean;
      complex_structure?: boolean;
      sanctions_concern?: boolean;
    }
  ): Promise<{
    riskLevel: "Low" | "Medium" | "High";
    sourceOfFundsRequired: boolean;
    goamlTriggerLikely: boolean;
    requiredDocuments: string[];
    notes: string;
  }> => {
    const response = await execute({
      promptId: "AML_SALES_CHECK",
      inputPayload: {
        deal_value_aed: dealValueAed,
        payment_method: paymentMethod,
        buyer_profile_flags: buyerFlags
      }
    });

    return {
      riskLevel: response.risk_level || "Medium",
      sourceOfFundsRequired: response.source_of_funds_required ?? true,
      goamlTriggerLikely: response.goaml_trigger_likely ?? false,
      requiredDocuments: response.required_documents || [],
      notes: response.notes || ""
    };
  }, [execute]);

  return { checkAML, isLoading, error };
}

export function useKYCCheck() {
  const { execute, isLoading, error } = useManifestExecutor();

  const checkKYC = useCallback(async (
    landlordIdPresent: boolean,
    tenantIdPresent: boolean,
    ownershipProofPresent: boolean
  ): Promise<{
    status: "COMPLETE" | "INCOMPLETE";
    missing: string[];
  }> => {
    const response = await execute({
      promptId: "KYC_LEASING_CHECK",
      inputPayload: {
        landlord_id_present: landlordIdPresent,
        tenant_id_present: tenantIdPresent,
        ownership_proof_present: ownershipProofPresent
      }
    });

    return {
      status: response.kyc_status || "INCOMPLETE",
      missing: response.missing || []
    };
  }, [execute]);

  return { checkKYC, isLoading, error };
}

// =====================================================
// DATA FETCHING HOOKS
// =====================================================

export function useManifestPrompts() {
  const [prompts, setPrompts] = useState<ManifestPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch all prompts at once (no group filter for complete data)
  const fetchAllPrompts = useCallback(async () => {
    if (hasFetched) return prompts;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("bos_manifest_prompts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (queryError) {
        setError(queryError.message);
        return [];
      }

      const typedPrompts = (data || []) as unknown as ManifestPrompt[];
      setPrompts(typedPrompts);
      setHasFetched(true);
      return typedPrompts;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch prompts";
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched, prompts]);

  // Legacy: fetch by group (accumulates instead of replacing)
  const fetchPrompts = useCallback(async (group?: string) => {
    // If no group specified or we want all, use fetchAllPrompts
    if (!group) {
      return fetchAllPrompts();
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("bos_manifest_prompts")
        .select("*")
        .eq("is_active", true)
        .eq("group_name", group)
        .order("sort_order", { ascending: true });

      if (queryError) {
        setError(queryError.message);
        return [];
      }

      const typedPrompts = (data || []) as unknown as ManifestPrompt[];
      
      // Accumulate prompts instead of replacing
      setPrompts(prev => {
        const existingIds = new Set(prev.map(p => p.prompt_id));
        const newPrompts = typedPrompts.filter(p => !existingIds.has(p.prompt_id));
        return [...prev, ...newPrompts];
      });
      
      return typedPrompts;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch prompts";
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllPrompts]);

  return { prompts, fetchPrompts, fetchAllPrompts, isLoading, error };
}

export function useGeneratedDocuments() {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (entityType?: string, entityId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("generated_documents")
        .select("*")
        .order("generated_at", { ascending: false });

      if (entityType) {
        query = query.eq("entity_type", entityType);
      }
      if (entityId) {
        query = query.eq("entity_id", entityId);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        setError(queryError.message);
        return [];
      }

      const typedDocs = (data || []) as unknown as GeneratedDocument[];
      setDocuments(typedDocs);
      return typedDocs;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch documents";
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { documents, fetchDocuments, isLoading, error };
}

export function useGateResults() {
  const [results, setResults] = useState<WorkflowGateResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGateResults = useCallback(async (dealId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("workflow_gate_results")
        .select("*")
        .order("evaluated_at", { ascending: false });

      if (dealId) {
        query = query.eq("deal_id", dealId);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        setError(queryError.message);
        return [];
      }

      const typedResults = (data || []) as unknown as WorkflowGateResult[];
      setResults(typedResults);
      return typedResults;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch gate results";
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, fetchGateResults, isLoading, error };
}
