import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const natoorUrl = Deno.env.get('NATOOR_SUPABASE_URL');
    const natoorKey = Deno.env.get('NATOOR_SERVICE_ROLE_KEY');
    const integrationSecret = Deno.env.get('INTEGRATION_SECRET');

    if (!natoorUrl || !natoorKey || !integrationSecret) {
      return new Response(
        JSON.stringify({ error: 'Natoor integration secrets not configured. Add NATOOR_SUPABASE_URL, NATOOR_SERVICE_ROLE_KEY, and INTEGRATION_SECRET.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { dealId, transactionValue, commissionPercent, dealType } = await req.json();

    if (!dealId) {
      return new Response(
        JSON.stringify({ error: 'dealId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch deal with listing
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*, listings(*)')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return new Response(
        JSON.stringify({ error: 'Deal not found', details: dealError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch deal parties (tenant/buyer)
    const { data: parties } = await supabase
      .from('deal_parties')
      .select('*')
      .eq('deal_id', dealId);

    const tenant = parties?.find(p => p.party_role === 'Buyer') || parties?.[0];
    const listing = deal.listings;
    const attrs = (listing?.listing_attributes as Record<string, unknown>) || {};
    const economics = (deal.deal_economics as Record<string, unknown>) || {};

    // Build payload for Natoor
    const payload = {
      source: 'mi-casa-bos',
      deal_id: deal.deal_id,
      building: {
        name: (attrs.building_name as string) || (attrs.community as string) || 'Unknown Building',
        community: (attrs.community as string) || '',
        city: (attrs.city as string) || 'Abu Dhabi',
        address: (attrs.address as string) || '',
      },
      unit: {
        unit_number: (attrs.unit_number as string) || '',
        bedrooms: attrs.bedrooms ?? null,
        bathrooms: attrs.bathrooms ?? null,
        area_sqft: attrs.area_sqft ?? null,
        floor: (attrs.floor as string) || '',
        property_type: listing?.listing_type || 'Residential',
      },
      tenant: tenant ? {
        name: tenant.party_name,
        email: tenant.party_email || '',
        phone: tenant.party_phone || '',
        identity_document_id: tenant.identity_document_id || '',
      } : null,
      lease: {
        annual_rent: transactionValue || (economics.transaction_value as number) || 0,
        start_date: (economics.lease_start as string) || new Date().toISOString().split('T')[0],
        end_date: (economics.lease_end as string) || '',
        cheque_count: (economics.cheque_count as number) || 1,
        security_deposit: (economics.security_deposit as number) || 0,
      },
    };

    // POST to Natoor's bos-deal-receive edge function
    const natoorResponse = await fetch(`${natoorUrl}/functions/v1/bos-deal-receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${natoorKey}`,
        'x-integration-secret': integrationSecret,
      },
      body: JSON.stringify(payload),
    });

    const natoorResult = await natoorResponse.json().catch(() => ({ status: natoorResponse.status }));

    // Log the sync event
    await supabase.from('event_log_entries').insert({
      event_id: `natoor-sync-${dealId}-${Date.now()}`,
      entity_type: 'deal',
      entity_id: dealId,
      action: 'natoor_deal_sync',
      after_state: {
        natoor_status: natoorResponse.ok ? 'success' : 'failed',
        natoor_response: natoorResult,
        payload_summary: {
          building: payload.building.name,
          unit: payload.unit.unit_number,
          tenant: payload.tenant?.name,
          annual_rent: payload.lease.annual_rent,
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: natoorResponse.ok,
        message: natoorResponse.ok
          ? 'Deal synced to Natoor Rent Protect'
          : 'Sync attempted but Natoor returned an error',
        natoor_status: natoorResponse.status,
        details: natoorResult,
      }),
      { status: natoorResponse.ok ? 200 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
