import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type PortalName = 'PropertyFinder' | 'Bayut' | 'Dubizzle';
type PortalStatus = 'pending' | 'published' | 'paused' | 'removed' | 'error';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { listing_id, portal, action } = await req.json();

    if (!listing_id) {
      return new Response(
        JSON.stringify({ error: 'listing_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the listing to check its status
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, listing_id, status, madhmoun_status')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get portal publications for this listing
    let pubQuery = supabase
      .from('portal_publications')
      .select('*')
      .eq('listing_id', listing_id);

    if (portal) {
      pubQuery = pubQuery.eq('portal', portal);
    }

    const { data: publications, error: pubError } = await pubQuery;

    if (pubError) {
      throw pubError;
    }

    const results: Array<{
      portal: PortalName;
      status: PortalStatus;
      action: string;
    }> = [];

    for (const pub of publications || []) {
      let newStatus: PortalStatus = pub.status;
      let actionTaken = 'none';

      // If listing is not publishable, mark for removal
      if (listing.status === 'Sold' || listing.status === 'Rented' || listing.status === 'Withdrawn') {
        if (pub.status !== 'removed') {
          newStatus = 'removed';
          actionTaken = 'marked_for_removal';
        }
      } 
      // If listing is draft, pause publications
      else if (listing.status === 'Draft') {
        if (pub.status === 'published') {
          newStatus = 'paused';
          actionTaken = 'paused';
        }
      }
      // If listing is active and verified, process pending to published
      else if (listing.status === 'Active' && listing.madhmoun_status === 'VERIFIED') {
        if (pub.status === 'pending') {
          // In real implementation, this would call portal API
          // For now, simulate successful publication
          newStatus = 'published';
          actionTaken = 'published';
        } else if (pub.status === 'paused') {
          newStatus = 'published';
          actionTaken = 'resumed';
        }
      }
      // Compliance not met
      else if (listing.madhmoun_status !== 'VERIFIED') {
        if (pub.status === 'pending' || pub.status === 'published') {
          newStatus = 'error';
          actionTaken = 'compliance_failed';
          
          await supabase
            .from('portal_publications')
            .update({ 
              status: newStatus,
              error_message: 'Madhmoun verification required',
              updated_at: new Date().toISOString()
            })
            .eq('id', pub.id);
          
          results.push({ portal: pub.portal, status: newStatus, action: actionTaken });
          continue;
        }
      }

      // Update if status changed
      if (newStatus !== pub.status) {
        const updateData: Record<string, unknown> = {
          status: newStatus,
          updated_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
        };

        if (newStatus === 'published' && !pub.published_at) {
          updateData.published_at = new Date().toISOString();
          // Generate a mock external reference
          updateData.external_ref = `${pub.portal.substring(0, 2).toUpperCase()}-${listing.listing_id}`;
          // Generate mock portal URL
          updateData.portal_url = generatePortalUrl(pub.portal, listing.listing_id);
        }

        if (newStatus !== 'error') {
          updateData.error_message = null;
        }

        await supabase
          .from('portal_publications')
          .update(updateData)
          .eq('id', pub.id);
      } else {
        // Just update sync timestamp
        await supabase
          .from('portal_publications')
          .update({ 
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', pub.id);
        actionTaken = 'synced';
      }

      results.push({ portal: pub.portal, status: newStatus, action: actionTaken });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        listing_id: listing.listing_id,
        listing_status: listing.status,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error syncing portal status:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generatePortalUrl(portal: PortalName, listingId: string): string {
  const baseUrls: Record<PortalName, string> = {
    PropertyFinder: 'https://www.propertyfinder.ae/property/',
    Bayut: 'https://www.bayut.com/property/details-',
    Dubizzle: 'https://dubai.dubizzle.com/property-for-sale/',
  };
  
  return `${baseUrls[portal]}${listingId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}
