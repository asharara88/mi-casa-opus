import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ListingData {
  id: string;
  listing_id: string;
  listing_type: string;
  status: string;
  madhmoun_listing_id: string | null;
  listing_attributes: {
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    property_type?: string;
    title?: string;
    description?: string;
    images?: string[];
    features?: string[];
    location?: {
      community?: string;
      sub_community?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    };
  } | null;
  asking_terms: {
    price?: number;
    currency?: string;
  } | null;
}

interface BrokerageData {
  legal_name: string;
  trade_name: string;
  license_context: {
    rera_number?: string;
    broker_license?: string;
    broker_name?: string;
    broker_phone?: string;
    broker_email?: string;
  } | null;
}

type PortalName = 'PropertyFinder' | 'Bayut' | 'Dubizzle';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function mapListingType(type: string): string {
  switch (type) {
    case 'Sale': return 'sale';
    case 'Lease': return 'rent';
    case 'OffPlan': return 'sale';
    default: return 'sale';
  }
}

function mapPropertyType(type: string | undefined): string {
  const typeMap: Record<string, string> = {
    'Apartment': 'AP',
    'Villa': 'VH',
    'Townhouse': 'TH',
    'Penthouse': 'PH',
    'Duplex': 'DU',
    'Studio': 'ST',
    'Office': 'OF',
    'Shop': 'SH',
    'Warehouse': 'WH',
    'Land': 'LP',
  };
  return typeMap[type || 'Apartment'] || 'AP';
}

function generatePropertyFinderXml(
  listings: ListingData[], 
  brokerage: BrokerageData
): string {
  const properties = listings.map(listing => {
    const attrs = listing.listing_attributes || {};
    const terms = listing.asking_terms || {};
    const location = attrs.location || {};
    const license = brokerage.license_context || {};

    return `
    <property>
      <reference_number>${escapeXml(listing.listing_id)}</reference_number>
      <offering_type>${mapListingType(listing.listing_type)}</offering_type>
      <property_type>${mapPropertyType(attrs.property_type)}</property_type>
      <price>${terms.price || 0}</price>
      <city>${escapeXml(location.city || 'Abu Dhabi')}</city>
      <community>${escapeXml(location.community || '')}</community>
      <sub_community>${escapeXml(location.sub_community || '')}</sub_community>
      <bedroom>${attrs.bedrooms || 0}</bedroom>
      <bathroom>${attrs.bathrooms || 0}</bathroom>
      <size unit="sqft">${attrs.sqft || 0}</size>
      <title_en>${escapeXml(attrs.title || listing.listing_id)}</title_en>
      <description_en>${escapeXml(attrs.description || '')}</description_en>
      ${listing.madhmoun_listing_id ? `<permit_number>${escapeXml(listing.madhmoun_listing_id)}</permit_number>` : ''}
      <agent>
        <name>${escapeXml(license.broker_name || '')}</name>
        <license_no>${escapeXml(license.broker_license || '')}</license_no>
        <phone>${escapeXml(license.broker_phone || '')}</phone>
        <email>${escapeXml(license.broker_email || '')}</email>
      </agent>
      <images>
        ${(attrs.images || []).map(img => `<image>${escapeXml(img)}</image>`).join('\n        ')}
      </images>
      ${location.latitude && location.longitude ? `
      <geopoints>
        <latitude>${location.latitude}</latitude>
        <longitude>${location.longitude}</longitude>
      </geopoints>` : ''}
      ${attrs.features?.length ? `
      <features>
        ${attrs.features.map(f => `<feature>${escapeXml(f)}</feature>`).join('\n        ')}
      </features>` : ''}
    </property>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<properties>
${properties}
</properties>`;
}

function generateBayutXml(
  listings: ListingData[], 
  brokerage: BrokerageData
): string {
  const properties = listings.map(listing => {
    const attrs = listing.listing_attributes || {};
    const terms = listing.asking_terms || {};
    const location = attrs.location || {};
    const license = brokerage.license_context || {};

    return `
    <property>
      <reference>${escapeXml(listing.listing_id)}</reference>
      <purpose>${mapListingType(listing.listing_type)}</purpose>
      <type>${mapPropertyType(attrs.property_type)}</type>
      <price>${terms.price || 0}</price>
      <city>${escapeXml(location.city || 'Abu Dhabi')}</city>
      <area>${escapeXml(location.community || '')}</area>
      <sub_area>${escapeXml(location.sub_community || '')}</sub_area>
      <bedrooms>${attrs.bedrooms || 0}</bedrooms>
      <bathrooms>${attrs.bathrooms || 0}</bathrooms>
      <size>${attrs.sqft || 0}</size>
      <title>${escapeXml(attrs.title || listing.listing_id)}</title>
      <description>${escapeXml(attrs.description || '')}</description>
      ${listing.madhmoun_listing_id ? `<rera_permit>${escapeXml(listing.madhmoun_listing_id)}</rera_permit>` : ''}
      <agent_name>${escapeXml(license.broker_name || '')}</agent_name>
      <agent_license>${escapeXml(license.broker_license || '')}</agent_license>
      <agent_phone>${escapeXml(license.broker_phone || '')}</agent_phone>
      <photos>
        ${(attrs.images || []).map(img => `<photo>${escapeXml(img)}</photo>`).join('\n        ')}
      </photos>
    </property>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<listings>
${properties}
</listings>`;
}

function generateDubizzleXml(
  listings: ListingData[], 
  brokerage: BrokerageData
): string {
  const properties = listings.map(listing => {
    const attrs = listing.listing_attributes || {};
    const terms = listing.asking_terms || {};
    const location = attrs.location || {};

    return `
    <ad>
      <id>${escapeXml(listing.listing_id)}</id>
      <category>${listing.listing_type === 'Lease' ? 'property-for-rent' : 'property-for-sale'}</category>
      <title>${escapeXml(attrs.title || listing.listing_id)}</title>
      <description>${escapeXml(attrs.description || '')}</description>
      <price>${terms.price || 0}</price>
      <location>${escapeXml(`${location.community || ''}, ${location.city || 'Abu Dhabi'}`)}</location>
      <bedrooms>${attrs.bedrooms || 0}</bedrooms>
      <bathrooms>${attrs.bathrooms || 0}</bathrooms>
      <size>${attrs.sqft || 0}</size>
      <images>
        ${(attrs.images || []).map(img => `<image url="${escapeXml(img)}" />`).join('\n        ')}
      </images>
    </ad>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ads>
${properties}
</ads>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;

    // SECURITY: Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[generate-portal-xml] Auth validation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-portal-xml] Authenticated user: ${user.id}`);

    const { portal, listing_id } = await req.json();

    if (!portal || !['PropertyFinder', 'Bayut', 'Dubizzle', 'all'].includes(portal)) {
      return new Response(
        JSON.stringify({ error: 'Invalid portal. Use PropertyFinder, Bayut, Dubizzle, or all' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query listings with active portal publications
    let query = supabase
      .from('listings')
      .select('id, listing_id, listing_type, status, madhmoun_listing_id, listing_attributes, asking_terms')
      .eq('status', 'Active')
      .eq('madhmoun_status', 'VERIFIED');

    if (listing_id) {
      query = query.eq('id', listing_id);
    }

    const { data: listings, error: listingsError } = await query;

    if (listingsError) {
      throw listingsError;
    }

    // Get brokerage context for agent info
    const { data: brokerage } = await supabase
      .from('brokerage_context')
      .select('legal_name, trade_name, license_context')
      .limit(1)
      .single();

    const brokerageData: BrokerageData = brokerage || {
      legal_name: '',
      trade_name: '',
      license_context: null,
    };

    const result: Record<string, string> = {};

    if (portal === 'all' || portal === 'PropertyFinder') {
      result.PropertyFinder = generatePropertyFinderXml(listings || [], brokerageData);
    }
    if (portal === 'all' || portal === 'Bayut') {
      result.Bayut = generateBayutXml(listings || [], brokerageData);
    }
    if (portal === 'all' || portal === 'Dubizzle') {
      result.Dubizzle = generateDubizzleXml(listings || [], brokerageData);
    }

    // Update last_synced_at for relevant publications
    if (listing_id) {
      const portalsToUpdate = portal === 'all' 
        ? ['PropertyFinder', 'Bayut', 'Dubizzle'] 
        : [portal];
      
      await supabase
        .from('portal_publications')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('listing_id', listing_id)
        .in('portal', portalsToUpdate)
        .in('status', ['pending', 'published']);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        feeds: result,
        listings_count: listings?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating portal XML:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
