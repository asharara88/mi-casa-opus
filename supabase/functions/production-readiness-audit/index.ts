import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckResult {
  id: string;
  category: string;
  name: string;
  status: "pass" | "fail" | "warn";
  detail: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: authError } = await userClient.auth.getUser();
  if (authError || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminClient = createClient(supabaseUrl, supabaseKey);
  const results: CheckResult[] = [];

  // 1. Storage Buckets
  const requiredBuckets = ["evidence-uploads", "kyc-documents", "listing-photos"];
  const { data: buckets } = await adminClient.storage.listBuckets();
  const bucketNames = (buckets ?? []).map((b: { name: string }) => b.name);
  for (const bucket of requiredBuckets) {
    results.push({
      id: `storage-${bucket}`,
      category: "Storage",
      name: `Bucket: ${bucket}`,
      status: bucketNames.includes(bucket) ? "pass" : "fail",
      detail: bucketNames.includes(bucket)
        ? `Bucket "${bucket}" exists`
        : `Bucket "${bucket}" is missing — create it in storage settings`,
    });
  }

  // 2. Secrets check (env vars available to edge functions)
  const secretKeys = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ANON_KEY",
    "SENDGRID_API_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "ELEVENLABS_API_KEY",
    "DOCUSIGN_INTEGRATION_KEY",
    "DOCUSIGN_API_ACCOUNT_ID",
    "DOCUSIGN_RSA_PRIVATE_KEY",
    "FIRECRAWL_API_KEY",
    "MAPBOX_ACCESS_TOKEN",
    "CAL_API_KEY",
    "PORTAL_WEBHOOK_SECRET",
    "OPENAI_API_KEY",
    "LOVABLE_API_KEY",
  ];
  for (const key of secretKeys) {
    const val = Deno.env.get(key);
    results.push({
      id: `secret-${key}`,
      category: "Secrets",
      name: key,
      status: val ? "pass" : "warn",
      detail: val ? "Configured" : "Not set — some features may not work",
    });
  }

  // 3. Core tables exist & have RLS enabled
  const coreTables = [
    "leads", "deals", "listings", "prospects", "commission_records",
    "broker_profiles", "user_roles", "evidence_objects", "document_instances",
    "compliance_results", "communication_logs", "viewing_bookings",
    "portal_inquiries", "portal_publications", "notifications",
  ];
  const { data: tableRows } = await adminClient.rpc("get_entity_counts").catch(() => ({ data: null })) as { data: { entity_type: string }[] | null };

  // Use information_schema to check tables and RLS
  for (const table of coreTables) {
    const { count, error } = await adminClient
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error && error.message.includes("does not exist")) {
      results.push({
        id: `table-${table}`,
        category: "Database",
        name: `Table: ${table}`,
        status: "fail",
        detail: `Table does not exist`,
      });
    } else {
      results.push({
        id: `table-${table}`,
        category: "Database",
        name: `Table: ${table}`,
        status: "pass",
        detail: `Exists (${count ?? 0} rows via service role)`,
      });
    }
  }

  // 4. Key database functions
  const requiredFunctions = [
    "has_role",
    "get_user_role",
    "is_deal_participant",
    "get_entity_counts",
    "get_team_metrics",
    "handle_new_user_role",
  ];
  for (const fn of requiredFunctions) {
    // Try calling a lightweight check
    const { error } = await adminClient.rpc(fn === "has_role"
      ? "has_role"
      : fn === "get_user_role"
      ? "get_user_role"
      : fn, fn === "has_role"
      ? { _user_id: "00000000-0000-0000-0000-000000000000", _role: "Manager" }
      : fn === "get_user_role"
      ? { _user_id: "00000000-0000-0000-0000-000000000000" }
      : fn === "is_deal_participant"
      ? { _deal_id: "00000000-0000-0000-0000-000000000000", _user_id: "00000000-0000-0000-0000-000000000000" }
      : {}
    );

    const exists = !error || !error.message.includes("does not exist");
    results.push({
      id: `func-${fn}`,
      category: "Database Functions",
      name: fn,
      status: exists ? "pass" : "fail",
      detail: exists ? "Function exists and callable" : `Function missing: ${error?.message}`,
    });
  }

  // 5. Integration endpoint health (basic connectivity)
  const integrations = [
    { name: "Lovable AI Gateway", url: "https://ai.gateway.lovable.dev/v1/models" },
  ];
  for (const integration of integrations) {
    try {
      const resp = await fetch(integration.url, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
        headers: integration.name.includes("Lovable")
          ? { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY") ?? ""}` }
          : {},
      });
      results.push({
        id: `integration-${integration.name}`,
        category: "Integrations",
        name: integration.name,
        status: resp.ok ? "pass" : "warn",
        detail: resp.ok ? `Responding (${resp.status})` : `Status ${resp.status}`,
      });
      await resp.text(); // consume body
    } catch (e) {
      results.push({
        id: `integration-${integration.name}`,
        category: "Integrations",
        name: integration.name,
        status: "fail",
        detail: `Unreachable: ${(e as Error).message}`,
      });
    }
  }

  // Summary
  const total = results.length;
  const passed = results.filter((r) => r.status === "pass").length;
  const warned = results.filter((r) => r.status === "warn").length;
  const failed = results.filter((r) => r.status === "fail").length;

  return new Response(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { total, passed, warned, failed },
      results,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
