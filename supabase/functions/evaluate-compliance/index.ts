import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RuleRequirement {
  field?: string;
  operator: string;
  value?: unknown;
  valueField?: string;
  anyOf?: RuleRequirement[];
  ifCondition?: RuleRequirement;
  then?: RuleRequirement[];
  ifPresentField?: string;
  compareField?: string;
  tolerancePercent?: number;
}

interface ComplianceRule {
  id: string;
  rule_id: string;
  module_id: string;
  name: string;
  type: string;
  severity: "BLOCK" | "ESCALATE";
  applies_to: string[];
  requirements: RuleRequirement[];
  action_on_fail: {
    status: string;
    requiredAction: string;
  };
  is_active: boolean;
}

interface ComplianceModule {
  id: string;
  module_id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

interface ChecklistItem {
  module: string;
  item: string;
  passed: boolean;
  bosField: string | null;
  requiredAction: string | null;
}

interface RuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: "BLOCK" | "ESCALATE";
  message?: string;
  requiredAction?: string;
  bosField?: string;
}

interface ModuleResult {
  moduleId: string;
  moduleName: string;
  passed: boolean;
  rules: RuleResult[];
}

interface ComplianceOutput {
  complianceStatus: "APPROVED" | "BLOCKED" | "ESCALATED";
  canProceed: boolean;
  checklist: ChecklistItem[];
  blockingReasons: string[];
  requiredActions: string[];
  completionConfirmation: {
    isCompliant: boolean;
    remainingItems: string[];
  };
  escalationReason: string | null;
  modules: ModuleResult[]; // Keep for detailed UI
}

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current: unknown, key: string) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Evaluate a single requirement
function evaluateRequirement(
  req: RuleRequirement,
  payload: Record<string, unknown>
): boolean {
  const { operator, field, value, valueField, anyOf, ifCondition, then, ifPresentField, compareField, tolerancePercent } = req;

  switch (operator) {
    case "exists": {
      const val = getNestedValue(payload, field!);
      return val !== undefined && val !== null && val !== "";
    }

    case "date_in_future": {
      const dateStr = getNestedValue(payload, field!) as string;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date > new Date();
    }

    case "equals": {
      const fieldVal = getNestedValue(payload, field!);
      if (valueField) {
        const compareVal = getNestedValue(payload, valueField);
        return fieldVal === compareVal;
      }
      return fieldVal === value;
    }

    case "in": {
      const fieldVal = getNestedValue(payload, field!);
      return Array.isArray(value) && value.includes(fieldVal);
    }

    case "gt": {
      const fieldVal = getNestedValue(payload, field!) as number;
      return typeof fieldVal === "number" && fieldVal > (value as number);
    }

    case "gte": {
      const fieldVal = getNestedValue(payload, field!) as number;
      return typeof fieldVal === "number" && fieldVal >= (value as number);
    }

    case "any_of": {
      if (!anyOf) return true;
      return anyOf.some((subReq) => evaluateRequirement(subReq, payload));
    }

    case "if": {
      if (!ifCondition) return true;
      const conditionMet = evaluateRequirement(ifCondition, payload);
      if (!conditionMet) return true; // Condition not met, rule passes
      if (!then) return true;
      return then.every((subReq) => evaluateRequirement(subReq, payload));
    }

    case "if_present_then_match_within_tolerance": {
      const refPrice = getNestedValue(payload, ifPresentField!) as number;
      if (refPrice === undefined || refPrice === null) return true; // Not present, rule passes
      const listingPrice = getNestedValue(payload, compareField!) as number;
      if (listingPrice === undefined || listingPrice === null) return false;
      const tolerance = (tolerancePercent ?? 0) / 100;
      const diff = Math.abs(refPrice - listingPrice) / refPrice;
      return diff <= tolerance;
    }

    case "does_not_contain_any": {
      const text = getNestedValue(payload, field!) as string;
      if (!text || typeof text !== "string") return true;
      const forbidden = value as string[];
      return !forbidden.some((word) => text.toLowerCase().includes(word.toLowerCase()));
    }

    default:
      return true;
  }
}

// Evaluate a single rule
function evaluateRule(rule: ComplianceRule, payload: Record<string, unknown>): RuleResult {
  const requirements = rule.requirements || [];
  const allPassed = requirements.every((req) => evaluateRequirement(req, payload));

  return {
    ruleId: rule.rule_id,
    ruleName: rule.name,
    passed: allPassed,
    severity: rule.severity,
    message: allPassed ? undefined : rule.action_on_fail?.requiredAction,
    requiredAction: allPassed ? undefined : rule.action_on_fail?.requiredAction,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // SECURITY: Validate authentication (now required)
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[evaluate-compliance] Auth validation failed:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[evaluate-compliance] Authenticated user: ${user.id}`);

    const body = await req.json();
    const { contextType, entityType, entityId, payload } = body;

    if (!contextType || !entityType || !entityId || !payload) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: contextType, entityType, entityId, payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch active modules
    const { data: modules, error: modulesError } = await supabase
      .from("compliance_modules")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (modulesError) {
      throw new Error(`Failed to fetch modules: ${modulesError.message}`);
    }

    // Fetch active rules for this context type
    const { data: rules, error: rulesError } = await supabase
      .from("compliance_rules")
      .select("*")
      .eq("is_active", true)
      .contains("applies_to", [contextType])
      .order("sort_order");

    if (rulesError) {
      throw new Error(`Failed to fetch rules: ${rulesError.message}`);
    }

    // Group rules by module
    const rulesByModule = new Map<string, ComplianceRule[]>();
    for (const rule of (rules || [])) {
      const moduleRules = rulesByModule.get(rule.module_id) || [];
      moduleRules.push(rule as ComplianceRule);
      rulesByModule.set(rule.module_id, moduleRules);
    }

    // Evaluate each module
    const moduleResults: ModuleResult[] = [];
    const failedModules: string[] = [];
    const failedRules: string[] = [];
    const requiredActions: string[] = [];
    let hasEscalation = false;
    let escalationReason: string | null = null;

    for (const module of (modules || []) as ComplianceModule[]) {
      const moduleRules = rulesByModule.get(module.id) || [];
      const ruleResults: RuleResult[] = [];

      for (const rule of moduleRules) {
        const result = evaluateRule(rule, payload);
        ruleResults.push(result);

        if (!result.passed) {
          failedRules.push(rule.rule_id);
          if (result.requiredAction) {
            requiredActions.push(result.requiredAction);
          }
          if (rule.severity === "ESCALATE") {
            hasEscalation = true;
            escalationReason = result.requiredAction || "Rule requires escalation";
          }
        }
      }

      const modulePassed = ruleResults.every((r) => r.passed);
      if (!modulePassed) {
        failedModules.push(module.module_id);
      }

      moduleResults.push({
        moduleId: module.module_id,
        moduleName: module.name,
        passed: modulePassed,
        rules: ruleResults,
      });
    }

    // Build checklist for output
    const checklist: ChecklistItem[] = [];
    const blockingReasons: string[] = [];
    
    for (const module of moduleResults) {
      for (const rule of module.rules) {
        checklist.push({
          module: module.moduleName,
          item: rule.ruleName,
          passed: rule.passed,
          bosField: rule.bosField || null,
          requiredAction: rule.requiredAction || null,
        });
        
        if (!rule.passed && rule.severity === "BLOCK") {
          blockingReasons.push(`${module.moduleName}: ${rule.ruleName}`);
        }
      }
    }

    // Determine final status
    let complianceStatus: "APPROVED" | "BLOCKED" | "ESCALATED";
    if (failedRules.length === 0) {
      complianceStatus = "APPROVED";
    } else if (hasEscalation) {
      complianceStatus = "ESCALATED";
    } else {
      complianceStatus = "BLOCKED";
    }

    const canProceed = complianceStatus === "APPROVED";
    const remainingItems = requiredActions.filter(Boolean);

    // Store the result
    const { data: storedResult, error: storeError } = await supabase
      .from("compliance_results")
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        context_type: contextType,
        status: complianceStatus,
        failed_modules: failedModules,
        failed_rules: failedRules,
        required_actions: requiredActions,
        escalation_reason: escalationReason,
        modules_detail: moduleResults,
        payload_snapshot: payload,
        evaluated_by: user.id,
      })
      .select()
      .single();

    if (storeError) {
      console.error("Failed to store compliance result:", storeError);
    }

    // Build output matching spec exactly
    const output: ComplianceOutput = {
      complianceStatus,
      canProceed,
      checklist,
      blockingReasons,
      requiredActions,
      completionConfirmation: {
        isCompliant: canProceed,
        remainingItems,
      },
      escalationReason,
      modules: moduleResults,
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: output,
        resultId: storedResult?.id,
        entityType,
        entityId,
        contextType,
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: user.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Compliance evaluation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
