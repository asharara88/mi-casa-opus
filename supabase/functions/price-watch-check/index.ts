import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WatchConfig {
  id: string;
  watch_id: string;
  name: string;
  community: string;
  city: string;
  portals: string[];
  property_type: string | null;
  min_price: number | null;
  max_price: number | null;
  bedrooms: number | null;
  listing_type: string;
}

interface ScrapedListing {
  external_ref: string;
  title: string;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  url: string;
  image_url: string | null;
}

interface PriceSnapshot {
  external_ref: string;
  price: number;
  is_active: boolean;
}

type PortalName = 'PropertyFinder' | 'Bayut' | 'Dubizzle';
type AlertType = 'new_listing' | 'price_drop' | 'price_increase' | 'listing_removed';

// Portal-specific search URL builders
function buildSearchUrl(portal: PortalName, watch: WatchConfig): string {
  const communitySlug = watch.community.toLowerCase().replace(/\s+/g, '-');
  const citySlug = watch.city.toLowerCase().replace(/\s+/g, '-');
  const purpose = watch.listing_type === 'Lease' ? 'rent' : 'buy';
  
  switch (portal) {
    case 'PropertyFinder':
      let pfUrl = `https://www.propertyfinder.ae/en/${purpose}/${citySlug}/${communitySlug}/`;
      if (watch.bedrooms) pfUrl += `${watch.bedrooms}-bedroom/`;
      if (watch.min_price) pfUrl += `?price_from=${watch.min_price}`;
      if (watch.max_price) pfUrl += `${watch.min_price ? '&' : '?'}price_to=${watch.max_price}`;
      return pfUrl;
      
    case 'Bayut':
      let bayutUrl = `https://www.bayut.com/for-${purpose === 'buy' ? 'sale' : 'rent'}/property/${citySlug}/${communitySlug}/`;
      const params: string[] = [];
      if (watch.bedrooms) params.push(`beds_in=${watch.bedrooms}`);
      if (watch.min_price) params.push(`price_min=${watch.min_price}`);
      if (watch.max_price) params.push(`price_max=${watch.max_price}`);
      if (params.length) bayutUrl += '?' + params.join('&');
      return bayutUrl;
      
    case 'Dubizzle':
      return `https://dubai.dubizzle.com/property-for-${purpose === 'buy' ? 'sale' : 'rent'}/${communitySlug}/`;
  }
}

function generateAlertId(): string {
  return `ALT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { watch_id, action } = await req.json();

    // Get active watches to check
    let watchQuery = supabase
      .from('price_watches')
      .select('*')
      .eq('is_active', true);

    if (watch_id) {
      watchQuery = watchQuery.eq('id', watch_id);
    }

    const { data: watches, error: watchError } = await watchQuery;
    if (watchError) throw watchError;

    if (!watches || watches.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active watches to check', alerts_generated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalAlertsGenerated = 0;
    const results: Array<{ watch_id: string; portal: string; alerts: number; error?: string }> = [];

    for (const watch of watches as WatchConfig[]) {
      for (const portal of watch.portals as PortalName[]) {
        try {
          // Build search URL
          const searchUrl = buildSearchUrl(portal, watch);
          
          // Call Firecrawl to scrape the portal
          let listings: ScrapedListing[] = [];
          
          if (firecrawlKey) {
            const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${firecrawlKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: searchUrl,
                formats: ['extract'],
                extract: {
                  schema: {
                    type: 'object',
                    properties: {
                      listings: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            reference: { type: 'string' },
                            title: { type: 'string' },
                            price: { type: 'number' },
                            bedrooms: { type: 'number' },
                            bathrooms: { type: 'number' },
                            size_sqft: { type: 'number' },
                            url: { type: 'string' },
                            image: { type: 'string' },
                          }
                        }
                      }
                    }
                  },
                  prompt: `Extract all property listings from this ${portal} search results page. For each listing, get the reference number, title, price (as number without currency), bedrooms, bathrooms, size in sqft, full URL, and main image URL.`
                }
              })
            });

            if (scrapeResponse.ok) {
              const scrapeData = await scrapeResponse.json();
              const extractedListings = scrapeData.data?.extract?.listings || [];
              
              listings = extractedListings.map((l: Record<string, unknown>) => ({
                external_ref: String(l.reference || `${portal}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
                title: String(l.title || 'Unknown'),
                price: Number(l.price) || 0,
                currency: 'AED',
                bedrooms: l.bedrooms ? Number(l.bedrooms) : null,
                bathrooms: l.bathrooms ? Number(l.bathrooms) : null,
                sqft: l.size_sqft ? Number(l.size_sqft) : null,
                url: String(l.url || searchUrl),
                image_url: l.image ? String(l.image) : null,
              }));
            }
          }

          // Get previous snapshots for comparison
          const { data: previousSnapshots } = await supabase
            .from('price_snapshots')
            .select('external_ref, price, is_active')
            .eq('watch_id', watch.id)
            .eq('portal', portal)
            .order('captured_at', { ascending: false });

          const prevMap = new Map<string, PriceSnapshot>();
          if (previousSnapshots) {
            for (const snap of previousSnapshots) {
              if (!prevMap.has(snap.external_ref)) {
                prevMap.set(snap.external_ref, snap);
              }
            }
          }

          const alertsToCreate: Array<{
            alert_id: string;
            watch_id: string;
            alert_type: AlertType;
            portal: PortalName;
            external_ref: string;
            title: string;
            current_price: number;
            previous_price: number | null;
            price_change_percent: number | null;
            url: string;
            image_url: string | null;
          }> = [];

          const snapshotsToInsert: Array<{
            watch_id: string;
            portal: PortalName;
            external_ref: string;
            title: string;
            price: number;
            currency: string;
            bedrooms: number | null;
            bathrooms: number | null;
            sqft: number | null;
            url: string;
            image_url: string | null;
            is_active: boolean;
          }> = [];

          const currentRefs = new Set<string>();

          for (const listing of listings) {
            currentRefs.add(listing.external_ref);
            const prev = prevMap.get(listing.external_ref);

            // Add to snapshots
            snapshotsToInsert.push({
              watch_id: watch.id,
              portal,
              external_ref: listing.external_ref,
              title: listing.title,
              price: listing.price,
              currency: listing.currency,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              sqft: listing.sqft,
              url: listing.url,
              image_url: listing.image_url,
              is_active: true,
            });

            if (!prev || !prev.is_active) {
              // New listing
              alertsToCreate.push({
                alert_id: generateAlertId(),
                watch_id: watch.id,
                alert_type: 'new_listing',
                portal,
                external_ref: listing.external_ref,
                title: listing.title,
                current_price: listing.price,
                previous_price: null,
                price_change_percent: null,
                url: listing.url,
                image_url: listing.image_url,
              });
            } else if (prev.price !== listing.price) {
              // Price changed
              const changePercent = ((listing.price - prev.price) / prev.price) * 100;
              const alertType: AlertType = listing.price < prev.price ? 'price_drop' : 'price_increase';
              
              alertsToCreate.push({
                alert_id: generateAlertId(),
                watch_id: watch.id,
                alert_type: alertType,
                portal,
                external_ref: listing.external_ref,
                title: listing.title,
                current_price: listing.price,
                previous_price: prev.price,
                price_change_percent: Math.round(changePercent * 10) / 10,
                url: listing.url,
                image_url: listing.image_url,
              });
            }
          }

          // Check for removed listings
          for (const [ref, prev] of prevMap) {
            if (prev.is_active && !currentRefs.has(ref)) {
              alertsToCreate.push({
                alert_id: generateAlertId(),
                watch_id: watch.id,
                alert_type: 'listing_removed',
                portal,
                external_ref: ref,
                title: 'Listing Removed',
                current_price: 0,
                previous_price: prev.price,
                price_change_percent: null,
                url: '',
                image_url: null,
              });

              // Mark as inactive in snapshot
              snapshotsToInsert.push({
                watch_id: watch.id,
                portal,
                external_ref: ref,
                title: 'Removed',
                price: prev.price,
                currency: 'AED',
                bedrooms: null,
                bathrooms: null,
                sqft: null,
                url: '',
                image_url: null,
                is_active: false,
              });
            }
          }

          // Insert snapshots
          if (snapshotsToInsert.length > 0) {
            await supabase.from('price_snapshots').insert(snapshotsToInsert);
          }

          // Insert alerts
          if (alertsToCreate.length > 0) {
            await supabase.from('price_alerts').insert(alertsToCreate);
            totalAlertsGenerated += alertsToCreate.length;
          }

          results.push({
            watch_id: watch.watch_id,
            portal,
            alerts: alertsToCreate.length,
          });

        } catch (portalError) {
          const message = portalError instanceof Error ? portalError.message : 'Unknown error';
          results.push({
            watch_id: watch.watch_id,
            portal,
            alerts: 0,
            error: message,
          });
        }
      }

      // Update last_checked_at
      await supabase
        .from('price_watches')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', watch.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        watches_checked: watches.length,
        alerts_generated: totalAlertsGenerated,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in price-watch-check:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
