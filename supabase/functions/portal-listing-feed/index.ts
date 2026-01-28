import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

interface ListingFeedParams {
  status?: string;
  type?: string;
  community?: string;
  bedrooms_min?: number;
  bedrooms_max?: number;
  price_min?: number;
  price_max?: number;
  limit?: number;
  offset?: number;
  updated_since?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("PORTAL_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Optional API key validation for external portals
    const providedApiKey = req.headers.get("x-api-key");
    if (apiKey && providedApiKey !== apiKey) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const params: ListingFeedParams = {
      status: url.searchParams.get("status") || "Active",
      type: url.searchParams.get("type") || undefined,
      community: url.searchParams.get("community") || undefined,
      bedrooms_min: url.searchParams.get("bedrooms_min") ? parseInt(url.searchParams.get("bedrooms_min")!) : undefined,
      bedrooms_max: url.searchParams.get("bedrooms_max") ? parseInt(url.searchParams.get("bedrooms_max")!) : undefined,
      price_min: url.searchParams.get("price_min") ? parseInt(url.searchParams.get("price_min")!) : undefined,
      price_max: url.searchParams.get("price_max") ? parseInt(url.searchParams.get("price_max")!) : undefined,
      limit: Math.min(parseInt(url.searchParams.get("limit") || "50"), 100),
      offset: parseInt(url.searchParams.get("offset") || "0"),
      updated_since: url.searchParams.get("updated_since") || undefined,
    };

    // Build query for published listings
    let query = supabase
      .from("listings")
      .select(`
        id,
        listing_id,
        listing_type,
        status,
        listing_attributes,
        asking_terms,
        madhmoun_status,
        approved_faqs,
        created_at,
        updated_at
      `)
      .eq("status", params.status || "Active")
      .eq("madhmoun_status", "VERIFIED");

    // Apply filters
    if (params.type) {
      query = query.eq("listing_type", params.type);
    }

    if (params.updated_since) {
      query = query.gte("updated_at", params.updated_since);
    }

    // Order and paginate
    query = query
      .order("updated_at", { ascending: false })
      .range(params.offset!, params.offset! + params.limit! - 1);

    const { data: listings, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transform listings for public consumption
    const publicListings = (listings || []).map((listing) => {
      const attrs = listing.listing_attributes || {};
      const terms = listing.asking_terms || {};
      
      // Filter by additional criteria in memory (JSON fields)
      if (params.community && attrs.location?.community !== params.community) {
        return null;
      }
      if (params.bedrooms_min && (attrs.bedrooms || 0) < params.bedrooms_min) {
        return null;
      }
      if (params.bedrooms_max && (attrs.bedrooms || 0) > params.bedrooms_max) {
        return null;
      }
      if (params.price_min && (terms.price || 0) < params.price_min) {
        return null;
      }
      if (params.price_max && (terms.price || 0) > params.price_max) {
        return null;
      }

      return {
        id: listing.id,
        reference: listing.listing_id,
        type: listing.listing_type,
        status: listing.status,
        verified: listing.madhmoun_status === "VERIFIED",
        
        // Property details
        property: {
          title: attrs.title || `${attrs.bedrooms || 0} BR in ${attrs.location?.community || "Dubai"}`,
          description: attrs.description,
          bedrooms: attrs.bedrooms,
          bathrooms: attrs.bathrooms,
          size_sqft: attrs.size_sqft,
          property_type: attrs.property_type,
          furnished: attrs.furnished,
          view: attrs.view,
          floor: attrs.floor,
          parking: attrs.parking,
        },
        
        // Location
        location: {
          community: attrs.location?.community,
          sub_community: attrs.location?.sub_community,
          building: attrs.location?.building,
          address: attrs.location?.address,
          coordinates: attrs.location?.coordinates,
        },
        
        // Pricing
        pricing: {
          price: terms.price,
          currency: terms.currency || "AED",
          price_per_sqft: attrs.size_sqft ? Math.round((terms.price || 0) / attrs.size_sqft) : null,
          payment_plan: terms.payment_plan,
        },
        
        // Media
        media: {
          images: attrs.images || [],
          video_url: attrs.video_url,
          virtual_tour: attrs.virtual_tour,
        },
        
        // Amenities and features
        amenities: attrs.amenities || [],
        
        // FAQs (AI-generated and approved)
        faqs: listing.approved_faqs || [],
        
        // Timestamps
        listed_at: listing.created_at,
        updated_at: listing.updated_at,
      };
    }).filter(Boolean);

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", params.status || "Active")
      .eq("madhmoun_status", "VERIFIED");

    return new Response(
      JSON.stringify({
        success: true,
        data: publicListings,
        pagination: {
          total: totalCount || 0,
          limit: params.limit,
          offset: params.offset,
          has_more: (params.offset! + publicListings.length) < (totalCount || 0),
        },
        generated_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Listing feed error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
