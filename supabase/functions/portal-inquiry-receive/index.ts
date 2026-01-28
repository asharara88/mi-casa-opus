import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-portal-source",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CustomerInquiry {
  // Customer details
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  
  // Inquiry details
  listing_id: string;
  message?: string;
  inquiry_type?: "general" | "viewing" | "offer" | "mortgage";
  
  // Preferences (optional)
  preferred_contact?: "email" | "phone" | "whatsapp";
  preferred_time?: string;
  budget_range?: { min: number; max: number };
  
  // UTM tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  // Consent
  marketing_consent?: boolean;
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const inquiry: CustomerInquiry = await req.json();
    const portalSource = req.headers.get("x-portal-source") || "CustomerPortal";

    // Validate required fields
    if (!inquiry.name || !inquiry.email || !inquiry.listing_id) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          required: ["name", "email", "listing_id"] 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiry.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate inquiry (same email + listing within 24h)
    const { data: existingInquiry } = await supabase
      .from("portal_inquiries")
      .select("id, inquiry_id")
      .eq("inquirer_email", inquiry.email)
      .eq("listing_id", inquiry.listing_id)
      .gte("received_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (existingInquiry) {
      return new Response(
        JSON.stringify({
          success: true,
          duplicate: true,
          inquiry_id: existingInquiry.inquiry_id,
          message: "Inquiry already received. Our team will contact you shortly.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch listing details
    const { data: listing } = await supabase
      .from("listings")
      .select("id, listing_id, listing_type, listing_attributes, status")
      .eq("id", inquiry.listing_id)
      .single();

    if (!listing) {
      return new Response(
        JSON.stringify({ error: "Listing not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create portal inquiry record
    const inquiryId = generateInquiryId();
    const { data: portalInquiry, error: inquiryError } = await supabase
      .from("portal_inquiries")
      .insert({
        inquiry_id: inquiryId,
        portal: portalSource,
        listing_id: listing.id,
        external_listing_ref: listing.listing_id,
        inquirer_name: inquiry.name,
        inquirer_email: inquiry.email,
        inquirer_phone: inquiry.phone,
        message: inquiry.message,
        inquiry_type: inquiry.inquiry_type || "general",
        source_type: "webhook",
        raw_payload: {
          ...inquiry,
          utm: {
            source: inquiry.utm_source,
            medium: inquiry.utm_medium,
            campaign: inquiry.utm_campaign,
          },
          preferences: {
            contact_method: inquiry.preferred_contact,
            contact_time: inquiry.preferred_time,
            budget: inquiry.budget_range,
          },
          consent: {
            marketing: inquiry.marketing_consent || false,
            timestamp: new Date().toISOString(),
          },
        },
      })
      .select()
      .single();

    if (inquiryError) {
      console.error("Failed to create inquiry:", inquiryError);
      throw new Error("Failed to create inquiry");
    }

    // Auto-create lead
    const leadId = generateLeadId();
    const attrs = listing.listing_attributes || {};
    
    let notes = `Customer inquiry from ${portalSource}.\n`;
    notes += `Inquiry type: ${inquiry.inquiry_type || "general"}\n`;
    if (inquiry.message) {
      notes += `\nMessage: ${inquiry.message}\n`;
    }
    notes += `\nInterested in: ${listing.listing_id}`;
    if (attrs.location?.community) {
      notes += ` - ${attrs.location.community}`;
    }
    if (attrs.bedrooms) {
      notes += `, ${attrs.bedrooms} BR`;
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        lead_id: leadId,
        contact_name: inquiry.name,
        contact_email: inquiry.email,
        contact_phone: inquiry.phone,
        source: portalSource as any,
        lead_state: "New",
        notes: notes.trim(),
        consents: {
          marketing: inquiry.marketing_consent || false,
          timestamp: new Date().toISOString(),
        },
        qualification_data: {
          portal_inquiry_id: portalInquiry.id,
          inquiry_type: inquiry.inquiry_type,
          interested_listing_id: listing.id,
          interested_listing_ref: listing.listing_id,
          nationality: inquiry.nationality,
          preferred_contact: inquiry.preferred_contact,
          budget_range: inquiry.budget_range,
          utm: {
            source: inquiry.utm_source,
            medium: inquiry.utm_medium,
            campaign: inquiry.utm_campaign,
          },
        },
      })
      .select("id, lead_id")
      .single();

    if (leadError) {
      console.error("Failed to create lead:", leadError);
      // Don't fail the whole request, inquiry is already created
    }

    // Link inquiry to lead
    if (lead) {
      await supabase
        .from("portal_inquiries")
        .update({
          lead_id: lead.id,
          processed_at: new Date().toISOString(),
        })
        .eq("id", portalInquiry.id);
    }

    // Log event
    await supabase.from("event_log_entries").insert({
      event_id: `EVT-${Date.now().toString(36).toUpperCase()}`,
      entity_type: "portal_inquiry",
      entity_id: portalInquiry.id,
      action: "inquiry.received",
      after_state: {
        inquiry_id: inquiryId,
        lead_id: lead?.lead_id,
        portal: portalSource,
        listing_ref: listing.listing_id,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        inquiry_id: inquiryId,
        lead_id: lead?.lead_id,
        message: "Thank you for your inquiry. Our team will contact you shortly.",
        reference: {
          listing: listing.listing_id,
          inquiry: inquiryId,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Portal inquiry error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Failed to process inquiry", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
