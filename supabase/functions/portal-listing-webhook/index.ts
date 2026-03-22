import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface WebhookPayload {
  event: string;
  listing_id: string;
  reference: string;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * Verify portal webhook secret from Authorization header.
 */
function verifyPortalSecret(req: Request, expectedSecret: string): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === expectedSecret;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PORTAL_WEBHOOK_SECRET = Deno.env.get("PORTAL_WEBHOOK_SECRET");

    // Verify authentication
    if (PORTAL_WEBHOOK_SECRET) {
      if (!verifyPortalSecret(req, PORTAL_WEBHOOK_SECRET)) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.warn("PORTAL_WEBHOOK_SECRET not configured — skipping auth");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { event, listing_id } = body;

    if (!event || !listing_id) {
      return new Response(
        JSON.stringify({ error: "Missing event or listing_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch listing data
    const { data: listing, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listing_id)
      .single();

    if (error || !listing) {
      return new Response(
        JSON.stringify({ error: "Listing not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build webhook payload
    const payload: WebhookPayload = {
      event,
      listing_id: listing.id,
      reference: listing.listing_id,
      timestamp: new Date().toISOString(),
      data: {
        type: listing.listing_type,
        status: listing.status,
        verified: listing.madhmoun_status === "VERIFIED",
        attributes: listing.listing_attributes,
        terms: listing.asking_terms,
      },
    };

    // Store in event log for audit
    await supabase.from("event_log_entries").insert({
      event_id: `WH-${Date.now().toString(36).toUpperCase()}`,
      entity_type: "listing",
      entity_id: listing_id,
      action: `webhook.${event}`,
      after_state: payload,
    });

    return new Response(
      JSON.stringify({ success: true, event, listing_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
