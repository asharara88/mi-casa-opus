import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { AI_MODELS } from "../_shared/models.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ManifestPrompt {
  id: string;
  prompt_id: string;
  group_name: string;
  title: string;
  purpose: string;
  prompt: string;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  refusal_policy: { must_refuse_if: string[]; refusal_style: string } | null;
  depends_on: string[];
  tags: string[];
  is_active: boolean;
}

interface ExecutorRequest {
  promptId: string;
  inputPayload: Record<string, unknown>;
  entityType?: string;
  entityId?: string;
  dealId?: string;
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === "object" && current !== null) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function validateRequiredFields(
  schema: Record<string, unknown>,
  payload: Record<string, unknown>
): { valid: boolean; missing: string[] } {
  const required = (schema.required as string[]) || [];
  const missing: string[] = [];

  for (const field of required) {
    const value = getNestedValue(payload, field);
    if (value === undefined || value === null || value === "") {
      missing.push(field);
    }
  }

  // Validate nested objects
  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (properties) {
    for (const [key, propSchema] of Object.entries(properties)) {
      if (propSchema.type === "object" && propSchema.required && payload[key]) {
        const nestedResult = validateRequiredFields(
          propSchema as Record<string, unknown>,
          payload[key] as Record<string, unknown>
        );
        for (const nestedMissing of nestedResult.missing) {
          missing.push(`${key}.${nestedMissing}`);
        }
      }
    }
  }

  return { valid: missing.length === 0, missing };
}

function checkRefusalPolicy(
  policy: { must_refuse_if: string[]; refusal_style: string } | null,
  _input: Record<string, unknown>
): { refused: boolean; reason: string | null } {
  if (!policy) return { refused: false, reason: null };

  // Simple keyword-based refusal check
  const inputStr = JSON.stringify(_input).toLowerCase();

  for (const condition of policy.must_refuse_if) {
    const condLower = condition.toLowerCase();
    
    // Check for legal advice requests
    if (condLower.includes("legal advice") && 
        (inputStr.includes("legal advice") || inputStr.includes("lawyer") || inputStr.includes("attorney"))) {
      return { refused: true, reason: condition };
    }
    
    // Check for fabrication/backdating
    if ((condLower.includes("fabrication") || condLower.includes("backdating")) &&
        (inputStr.includes("backdate") || inputStr.includes("fabricate") || inputStr.includes("fake"))) {
      return { refused: true, reason: condition };
    }
    
    // Check for missing required fields referenced in refusal
    if (condLower.includes("missing") || condLower.includes("not specified") || condLower.includes("not provided")) {
      // This is handled by validation, skip
      continue;
    }
  }

  return { refused: false, reason: null };
}

// =====================================================
// PROMPT CONSTRUCTION
// =====================================================

function buildPrompt(manifest: ManifestPrompt, input: Record<string, unknown>): string {
  return `${manifest.prompt}

INPUT DATA:
${JSON.stringify(input, null, 2)}

OUTPUT REQUIREMENTS:
- Follow the output schema exactly: ${JSON.stringify(manifest.output_schema)}
- Document must be copy-paste ready
- No filler text or unnecessary legal language
- If uncertain about any ADM requirement, output: VERIFY WITH ADM
- Output valid JSON only`;
}

// =====================================================
// GATE EVALUATION (deterministic, no AI needed)
// =====================================================

const SALES_REQUIRED_DOCS = [
  "signed_brokerage_contract",
  "ownership_proof",
  "kyc_folder",
  "aml_assessment"
];

const LEASING_REQUIRED_DOCS = [
  "signed_brokerage_contract",
  "ownership_proof",
  "tenant_id"
];

function evaluateGate(
  gateId: string,
  documentsPresent: string[]
): { status: "APPROVED" | "BLOCKED"; missing: string[]; next_allowed_actions: string[] } {
  const docsLower = documentsPresent.map(d => d.toLowerCase().replace(/[^a-z0-9]/g, "_"));
  
  let requiredDocs: string[];
  let nextActions: string[];
  
  if (gateId === "FLOW_SALES_GATE") {
    requiredDocs = SALES_REQUIRED_DOCS;
    nextActions = ["submit_offer", "schedule_viewing", "request_mortgage_preapproval", "generate_commission_invoice"];
  } else if (gateId === "FLOW_LEASING_GATE") {
    requiredDocs = LEASING_REQUIRED_DOCS;
    nextActions = ["submit_tenant_offer", "schedule_viewing", "draft_tenancy_contract", "generate_commission_invoice"];
  } else {
    return { status: "BLOCKED", missing: ["Unknown gate type"], next_allowed_actions: [] };
  }
  
  const missing: string[] = [];
  for (const req of requiredDocs) {
    const found = docsLower.some(d => d.includes(req.replace(/_/g, "")) || d.includes(req));
    if (!found) {
      missing.push(req.replace(/_/g, " "));
    }
  }
  
  if (missing.length === 0) {
    return { status: "APPROVED", missing: [], next_allowed_actions: nextActions };
  }
  
  return { status: "BLOCKED", missing, next_allowed_actions: [] };
}

// =====================================================
// MAIN HANDLER
// =====================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    const body: ExecutorRequest = await req.json();
    const { promptId, inputPayload, entityType, entityId, dealId } = body;

    if (!promptId) {
      return new Response(
        JSON.stringify({ success: false, error: "promptId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the manifest prompt
    const { data: manifest, error: manifestError } = await supabase
      .from("bos_manifest_prompts")
      .select("*")
      .eq("prompt_id", promptId)
      .eq("is_active", true)
      .single();

    if (manifestError || !manifest) {
      return new Response(
        JSON.stringify({ success: false, error: `Prompt not found: ${promptId}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input against schema
    const validation = validateRequiredFields(
      manifest.input_schema as Record<string, unknown>,
      inputPayload
    );
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
          missing: validation.missing,
          refused: true,
          refusal_reason: `Missing required inputs: ${validation.missing.join(", ")}`
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check refusal policy
    const refusalCheck = checkRefusalPolicy(manifest.refusal_policy, inputPayload);
    if (refusalCheck.refused) {
      return new Response(
        JSON.stringify({
          success: false,
          refused: true,
          refusal_reason: refusalCheck.reason,
          error: `Request refused: ${refusalCheck.reason}`
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================
    // HANDLE WORKFLOW GATES (deterministic)
    // =====================================================
    if (manifest.group_name === "WORKFLOW_GATES") {
      const gateInput = inputPayload as { requested_action: string; documents_present: string[] };
      const gateResult = evaluateGate(promptId, gateInput.documents_present || []);

      // Store gate result if dealId provided
      if (dealId) {
        const resultId = `GR-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        await supabase.from("workflow_gate_results").insert({
          result_id: resultId,
          gate_id: promptId,
          deal_id: dealId,
          requested_action: gateInput.requested_action || "unknown",
          documents_present: gateInput.documents_present || [],
          status: gateResult.status,
          missing: gateResult.missing,
          next_allowed_actions: gateResult.next_allowed_actions,
          evaluated_by: userId
        });

        return new Response(
          JSON.stringify({
            success: true,
            promptId,
            gateStatus: gateResult.status,
            missing: gateResult.missing,
            next_allowed_actions: gateResult.next_allowed_actions,
            gateResultId: resultId
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          promptId,
          gateStatus: gateResult.status,
          missing: gateResult.missing,
          next_allowed_actions: gateResult.next_allowed_actions
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================
    // HANDLE KYC CHECK (deterministic)
    // =====================================================
    if (promptId === "KYC_LEASING_CHECK") {
      const kycInput = inputPayload as {
        landlord_id_present: boolean;
        tenant_id_present: boolean;
        ownership_proof_present: boolean;
      };

      const missing: string[] = [];
      if (!kycInput.landlord_id_present) missing.push("Landlord ID");
      if (!kycInput.tenant_id_present) missing.push("Tenant ID");
      if (!kycInput.ownership_proof_present) missing.push("Ownership/Authority Proof");

      return new Response(
        JSON.stringify({
          success: true,
          promptId,
          kyc_status: missing.length === 0 ? "COMPLETE" : "INCOMPLETE",
          missing
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================
    // HANDLE AI-POWERED PROMPTS
    // =====================================================
    const fullPrompt = buildPrompt(manifest as ManifestPrompt, inputPayload);

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai-gateway.lovable.dev/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        "x-supabase-project-id": supabaseUrl.split("//")[1].split(".")[0]
      },
      body: JSON.stringify({
        model: AI_MODELS.REASONING, // gpt-5-mini for balanced reasoning
        messages: [
          {
            role: "system",
            content: "You are MiCasa BOS, an Abu Dhabi real estate operations system. Output valid JSON only. No markdown code blocks."
          },
          { role: "user", content: fullPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse the AI response
    let parsedOutput: Record<string, unknown>;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      parsedOutput = JSON.parse(cleanContent.trim());
    } catch {
      // If JSON parsing fails, treat as plain text document
      parsedOutput = {
        document_title: manifest.title,
        document_body: content
      };
    }

    // =====================================================
    // HANDLE DOCUMENT TEMPLATES
    // =====================================================
    if (manifest.group_name === "DOCUMENT_TEMPLATES") {
      const documentId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      // Store the generated document
      if (entityType && entityId) {
        await supabase.from("generated_documents").insert({
          document_id: documentId,
          prompt_id: promptId,
          entity_type: entityType,
          entity_id: entityId,
          input_payload: inputPayload,
          output: parsedOutput,
          document_title: (parsedOutput.document_title as string) || manifest.title,
          document_body: (parsedOutput.document_body as string) || content,
          status: "Draft",
          generated_by: userId
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          promptId,
          document_title: parsedOutput.document_title || manifest.title,
          document_body: parsedOutput.document_body || content,
          generatedDocumentId: entityType && entityId ? documentId : undefined,
          status: "Draft"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================
    // HANDLE COMPLIANCE CHECKS (AML)
    // =====================================================
    if (promptId === "AML_SALES_CHECK") {
      return new Response(
        JSON.stringify({
          success: true,
          promptId,
          risk_level: parsedOutput.risk_level || "Medium",
          source_of_funds_required: parsedOutput.source_of_funds_required ?? true,
          goaml_trigger_likely: parsedOutput.goaml_trigger_likely ?? false,
          required_documents: parsedOutput.required_documents || [],
          notes: parsedOutput.notes || ""
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================
    // HANDLE ADMIN OPS
    // =====================================================
    if (manifest.group_name === "ADMIN_OPS") {
      if (promptId === "ADMIN_DOC_INDEX") {
        return new Response(
          JSON.stringify({
            success: true,
            promptId,
            index_title: parsedOutput.index_title || "Deal Document Index",
            index_body: parsedOutput.index_body || content
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (promptId === "ADMIN_AUDIT_EXPORT") {
        return new Response(
          JSON.stringify({
            success: true,
            promptId,
            audit_status: parsedOutput.status || "INCOMPLETE",
            bundle_list: parsedOutput.bundle_list || [],
            missing: parsedOutput.missing || [],
            closeout_steps: parsedOutput.closeout_steps || []
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Default response for other prompts
    return new Response(
      JSON.stringify({
        success: true,
        promptId,
        output: parsedOutput
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Executor error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
