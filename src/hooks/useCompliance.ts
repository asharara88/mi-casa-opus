import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  ComplianceResult,
  CompliancePayload,
  ContextType,
  ModuleResult,
  OverridePayload,
} from "@/types/compliance";
import { toast } from "@/hooks/use-toast";

// Transform database result to frontend type
function transformDbResult(dbResult: any): ComplianceResult {
  const modulesDetail = (dbResult.modules_detail || []) as ModuleResult[];
  const failedModulesCount = modulesDetail.filter(m => !m.passed).length;
  
  // Build checklist from modules
  const checklist = modulesDetail.flatMap(m => 
    m.rules.map(r => ({
      module: m.moduleName,
      item: r.ruleName,
      passed: r.passed,
      bosField: r.bosField || null,
      requiredAction: r.requiredAction || null,
    }))
  );
  
  const blockingReasons = dbResult.failed_rules?.map((ruleId: string) => {
    for (const mod of modulesDetail) {
      const rule = mod.rules.find(r => r.ruleId === ruleId);
      if (rule) return `${mod.moduleName}: ${rule.ruleName}`;
    }
    return ruleId;
  }) || [];

  return {
    complianceStatus: dbResult.status,
    canProceed: dbResult.status === "APPROVED",
    checklist,
    blockingReasons,
    requiredActions: dbResult.required_actions || [],
    completionConfirmation: {
      isCompliant: dbResult.status === "APPROVED",
      remainingItems: dbResult.required_actions || [],
    },
    escalationReason: dbResult.escalation_reason || null,
    modules: modulesDetail,
    resultId: dbResult.id,
    entityType: dbResult.entity_type,
    entityId: dbResult.entity_id,
    contextType: dbResult.context_type as ContextType,
    evaluatedAt: dbResult.evaluated_at,
    evaluatedBy: dbResult.evaluated_by,
  };
}

// Fetch the latest compliance result for an entity
export function useComplianceResult(entityType: string, entityId: string | null) {
  return useQuery({
    queryKey: ["compliance-result", entityType, entityId],
    queryFn: async () => {
      if (!entityId) return null;

      const { data, error } = await supabase
        .from("compliance_results")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("evaluated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return transformDbResult(data);
    },
    enabled: !!entityId,
  });
}

// Run compliance evaluation
export function useRunCompliance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contextType,
      entityType,
      entityId,
      payload,
    }: {
      contextType: ContextType;
      entityType: string;
      entityId: string;
      payload: CompliancePayload;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("evaluate-compliance", {
        body: { contextType, entityType, entityId, payload },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });

      if (response.error) {
        throw new Error(response.error.message || "Compliance evaluation failed");
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Compliance evaluation failed");
      }

      return response.data.result as ComplianceResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["compliance-result", result.entityType, result.entityId],
      });
      
      const statusMessages = {
        APPROVED: "All compliance checks passed",
        BLOCKED: `${result.blockingReasons.length} compliance issue(s) require attention`,
        ESCALATED: "Compliance review escalated for approval",
      };

      toast({
        title: `Compliance: ${result.complianceStatus}`,
        description: statusMessages[result.complianceStatus],
        variant: result.complianceStatus === "APPROVED" ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Compliance check failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Submit override request
export function useSubmitOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      complianceResultId,
      payload,
    }: {
      complianceResultId: string;
      payload: OverridePayload;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("compliance_overrides")
        .insert({
          compliance_result_id: complianceResultId,
          overrider_name: payload.name,
          reason: payload.reason,
          authorization_document_url: payload.authorizationDocumentUrl,
          approved_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-result"] });
      toast({
        title: "Override submitted",
        description: "Compliance override has been recorded",
      });
    },
    onError: (error) => {
      toast({
        title: "Override failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Fetch compliance modules
export function useComplianceModules() {
  return useQuery({
    queryKey: ["compliance-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_modules")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
  });
}

// Fetch compliance rules
export function useComplianceRules(contextType?: ContextType) {
  return useQuery({
    queryKey: ["compliance-rules", contextType],
    queryFn: async () => {
      let query = supabase
        .from("compliance_rules")
        .select("*, compliance_modules!inner(module_id, name)")
        .eq("is_active", true)
        .order("sort_order");

      if (contextType) {
        query = query.contains("applies_to", [contextType]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Check if user can override
export function useCanOverride() {
  return useQuery({
    queryKey: ["can-override"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      // Only Managers and Owners can override
      return data?.role === "Manager" || data?.role === "Owner";
    },
  });
}
