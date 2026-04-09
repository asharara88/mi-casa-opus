import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-portal-source, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Portal email parsing patterns
const EMAIL_PATTERNS = {
  PropertyFinder: {
    senderPattern: /@propertyfinder\.(ae|com)/i,
    namePattern: /(?:Name|From|Sender):\s*(.+?)(?:\n|$)/i,
    emailPattern: /(?:Email|E-mail):\s*(\S+@\S+)/i,
    phonePattern: /(?:Phone|Mobile|Tel):\s*(\+?[\d\s\-()]+)/i,
    messagePattern: /(?:Message|Enquiry|Comments?):\s*([\s\S]+?)(?:(?:Property|Listing|Reference):|$)/i,
    listingRefPattern: /(?:Reference|Ref|Property ID):\s*(\S+)/i,
  },
  Bayut: {
    senderPattern: /@bayut\.com/i,
    namePattern: /(?:Name|Contact):\s*(.+?)(?:\n|$)/i,
    emailPattern: /(?:Email):\s*(\S+@\S+)/i,
    phonePattern: /(?:Phone|Mobile):\s*(\+?[\d\s\-()]+)/i,
    messagePattern: /(?:Message):\s*([\s\S]+?)(?:(?:Property|Listing):|$)/i,
    listingRefPattern: /(?:Property Reference|Ref):\s*(\S+)/i,
  },
  Dubizzle: {
    senderPattern: /@dubizzle\.com/i,
    namePattern: /(?:From|Name):\s*(.+?)(?:\n|$)/i,
    emailPattern: /(?:Reply to|Email):\s*(\S+@\S+)/i,
    phonePattern: /(?:Phone|Contact):\s*(\+?[\d\s\-()]+)/i,
    messagePattern: /(?:Message):\s*([\s\S]+?)(?:View listing|$)/i,
    listingRefPattern: /(?:Ad ID|Reference):\s*(\S+)/i,
  },
};

interface PortalWebhookPayload {
  portal: "PropertyFinder" | "Bayut" | "Dubizzle";
  inquiry_type?: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  listing_ref?: string;
  timestamp?: string;
}

interface EmailParsePayload {
  from: string;
  subject: string;
  body: string;
  html?: string;
}

function generateInquiryId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INQ-${timestamp}-${random}`;
}

function generateLeadId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LD-${timestamp}-${random}`;
}

function detectPortalFromEmail(from: string, body: string): "PropertyFinder" | "Bayut" | "Dubizzle" | null {
  for (const [portal, patterns] of Object.entries(EMAIL_PATTERNS)) {
    if (patterns.senderPattern.test(from) || patterns.senderPattern.test(body)) {
      return portal as "PropertyFinder" | "Bayut" | "Dubizzle";
    }
  }
  return null;
}

function parseEmailContent(portal: "PropertyFinder" | "Bayut" | "Dubizzle", body: string): Partial<PortalWebhookPayload> {
  const patterns = EMAIL_PATTERNS[portal];
  
  const nameMatch = body.match(patterns.namePattern);
  const emailMatch = body.match(patterns.emailPattern);
  const phoneMatch = body.match(patterns.phonePattern);
  const messageMatch = body.match(patterns.messagePattern);
  const refMatch = body.match(patterns.listingRefPattern);
  
  return {
    portal,
    name: nameMatch?.[1]?.trim() || "Unknown Inquirer",
    email: emailMatch?.[1]?.trim(),
    phone: phoneMatch?.[1]?.trim(),
    message: messageMatch?.[1]?.trim(),
    listing_ref: refMatch?.[1]?.trim(),
  };
}

async function findListingByRef(supabase: any, ref: string): Promise<string | null> {
  if (!ref) return null;
  
  // Try to find by external_ref in portal_publications
  const { data: pub } = await supabase
    .from("portal_publications")
    .select("listing_id")
    .eq("external_ref", ref)
    .maybeSingle();
  
  if (pub?.listing_id) return pub.listing_id;
  
  // Try to find by listing_id directly
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("listing_id", ref)
    .maybeSingle();
  
  return listing?.id || null;
}

async function createLeadFromInquiry(
  supabase: any,
  inquiry: {
    id: string;
    portal: string;
    inquirer_name: string;
    inquirer_email?: string;
    inquirer_phone?: string;
    message?: string;
    listing_id?: string;
  }
): Promise<{ id: string; lead_id: string } | null> {
  const leadId = generateLeadId();
  
  // Get listing details for notes if available
  let listingInfo = "";
  if (inquiry.listing_id) {
    const { data: listing } = await supabase
      .from("listings")
      .select("listing_id, listing_attributes")
      .eq("id", inquiry.listing_id)
      .maybeSingle();
    
    if (listing) {
      const attrs = listing.listing_attributes || {};
      listingInfo = `\n\nInterested in: ${listing.listing_id}`;
      if (attrs.location?.community) {
        listingInfo += ` - ${attrs.location.community}`;
      }
      if (attrs.bedrooms) {
        listingInfo += `, ${attrs.bedrooms} BR`;
      }
    }
  }
  
  const notes = `Portal inquiry from ${inquiry.portal}.${inquiry.message ? `\n\nMessage: ${inquiry.message}` : ""}${listingInfo}`;
  
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      lead_id: leadId,
      contact_name: inquiry.inquirer_name,
      contact_email: inquiry.inquirer_email,
      contact_phone: inquiry.inquirer_phone,
      source: inquiry.portal, // PropertyFinder, Bayut, or Dubizzle
      lead_state: "New",
      notes: notes.trim(),
      qualification_data: {
        portal_inquiry_id: inquiry.id,
        interested_listing_id: inquiry.listing_id,
      },
    })
    .select("id, lead_id")
    .single();
  
  if (error) {
    console.error("Failed to create lead:", error);
    return null;
  }
  
  return lead;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const webhookSecret = Deno.env.get("PORTAL_WEBHOOK_SECRET");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const contentType = req.headers.get("content-type") || "";
    const portalSource = req.headers.get("x-portal-source");
    const providedSecret = req.headers.get("x-webhook-secret");
    
    let inquiryData: Partial<PortalWebhookPayload>;
    let sourceType: "webhook" | "email_parse" = "webhook";
    let rawPayload: any;

    // Handle different input formats
    if (contentType.includes("application/json")) {
      rawPayload = await req.json();
      
      // Check if this is an email parse request
      if (rawPayload.from && rawPayload.body) {
        sourceType = "email_parse";
        const emailData = rawPayload as EmailParsePayload;
        const portal = detectPortalFromEmail(emailData.from, emailData.body);
        
        if (!portal) {
          return new Response(
            JSON.stringify({ error: "Could not detect portal from email" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        inquiryData = parseEmailContent(portal, emailData.body);
      } else {
        // Direct webhook payload - validate webhook secret
        if (webhookSecret) {
          if (!providedSecret || providedSecret !== webhookSecret) {
            console.error("Invalid webhook secret provided");
            return new Response(
              JSON.stringify({ error: "Invalid webhook secret" }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        
        inquiryData = rawPayload as PortalWebhookPayload;
        
        // Validate portal source
        if (portalSource && !inquiryData.portal) {
          inquiryData.portal = portalSource as any;
        }
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported content type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!inquiryData.portal || !inquiryData.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: portal and name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find linked listing if reference provided
    const listingId = await findListingByRef(supabase, inquiryData.listing_ref || "");

    // Check for duplicate inquiry (same email + portal + listing within 24h)
    if (inquiryData.email) {
      const { data: existing } = await supabase
        .from("portal_inquiries")
        .select("id")
        .eq("portal", inquiryData.portal)
        .eq("inquirer_email", inquiryData.email)
        .gte("received_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .maybeSingle();
      
      if (existing) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            duplicate: true,
            inquiry_id: existing.id,
            message: "Duplicate inquiry detected within 24h window"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create portal inquiry record
    const inquiryId = generateInquiryId();
    const { data: inquiry, error: inquiryError } = await supabase
      .from("portal_inquiries")
      .insert({
        inquiry_id: inquiryId,
        portal: inquiryData.portal,
        listing_id: listingId,
        external_listing_ref: inquiryData.listing_ref,
        inquirer_name: inquiryData.name,
        inquirer_email: inquiryData.email,
        inquirer_phone: inquiryData.phone,
        message: inquiryData.message,
        inquiry_type: inquiryData.inquiry_type || "general",
        source_type: sourceType,
        raw_payload: rawPayload,
      })
      .select()
      .single();

    if (inquiryError) {
      console.error("Failed to create inquiry:", inquiryError);
      return new Response(
        JSON.stringify({ error: "Failed to create inquiry", details: inquiryError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auto-create lead
    const lead = await createLeadFromInquiry(supabase, {
      id: inquiry.id,
      portal: inquiryData.portal,
      inquirer_name: inquiryData.name,
      inquirer_email: inquiryData.email,
      inquirer_phone: inquiryData.phone,
      message: inquiryData.message,
      listing_id: listingId || undefined,
    });

    // Update inquiry with lead reference
    if (lead) {
      await supabase
        .from("portal_inquiries")
        .update({ 
          lead_id: lead.id,
          processed_at: new Date().toISOString()
        })
        .eq("id", inquiry.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        inquiry_id: inquiryId,
        lead_id: lead?.lead_id,
        portal: inquiryData.portal,
        listing_matched: !!listingId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Portal lead sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
