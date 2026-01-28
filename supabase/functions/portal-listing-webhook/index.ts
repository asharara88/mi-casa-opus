import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

interface WebhookPayload {
  event: string;
  listing_id: string;
  reference: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// In-memory webhook subscriptions (in production, store in database)
const WEBHOOK_SUBSCRIPTIONS: WebhookSubscription[] = [];

async function sendWebhook(subscription: WebhookSubscription, payload: WebhookPayload): Promise<boolean> {
  try {
    const signature = await generateSignature(JSON.stringify(payload), subscription.secret);
    
    const response = await fetch(subscription.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": payload.event,
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error(`Webhook delivery failed to ${subscription.url}:`, error);
    return false;
  }
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    // Handle different webhook actions
    if (req.method === "POST") {
      const body = await req.json();

      switch (action) {
        case "notify": {
          // Internal endpoint to trigger webhooks when listings change
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

          // Send to all active subscriptions for this event
          const results = await Promise.all(
            WEBHOOK_SUBSCRIPTIONS
              .filter((sub) => sub.active && sub.events.includes(event))
              .map((sub) => sendWebhook(sub, payload))
          );

          // Also store in event log for audit
          await supabase.from("event_log_entries").insert({
            event_id: `WH-${Date.now().toString(36).toUpperCase()}`,
            entity_type: "listing",
            entity_id: listing_id,
            action: `webhook.${event}`,
            after_state: payload,
          });

          return new Response(
            JSON.stringify({
              success: true,
              event,
              listing_id,
              webhooks_sent: results.filter(Boolean).length,
              webhooks_failed: results.filter((r) => !r).length,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        case "subscribe": {
          // Register a new webhook subscription
          const { url: webhookUrl, events, secret } = body;

          if (!webhookUrl || !events || !Array.isArray(events)) {
            return new Response(
              JSON.stringify({ error: "Missing url or events array" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const subscription: WebhookSubscription = {
            id: crypto.randomUUID(),
            url: webhookUrl,
            events,
            secret: secret || crypto.randomUUID(),
            active: true,
          };

          WEBHOOK_SUBSCRIPTIONS.push(subscription);

          return new Response(
            JSON.stringify({
              success: true,
              subscription_id: subscription.id,
              secret: subscription.secret,
              events: subscription.events,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        case "unsubscribe": {
          const { subscription_id } = body;
          const index = WEBHOOK_SUBSCRIPTIONS.findIndex((s) => s.id === subscription_id);
          
          if (index === -1) {
            return new Response(
              JSON.stringify({ error: "Subscription not found" }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          WEBHOOK_SUBSCRIPTIONS.splice(index, 1);

          return new Response(
            JSON.stringify({ success: true, message: "Subscription removed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        default:
          return new Response(
            JSON.stringify({ error: "Unknown action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
