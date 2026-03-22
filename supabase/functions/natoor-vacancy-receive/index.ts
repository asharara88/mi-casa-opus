import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-integration-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const integrationSecret = Deno.env.get('INTEGRATION_SECRET');

    if (!integrationSecret) {
      return new Response(
        JSON.stringify({ error: 'INTEGRATION_SECRET not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate integration secret
    const incomingSecret = req.headers.get('x-integration-secret');
    if (incomingSecret !== integrationSecret) {
      return new Response(
        JSON.stringify({ error: 'Invalid integration secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    const { building, unit, vacancy_type, previous_tenant } = payload;

    if (!building || !unit) {
      return new Response(
        JSON.stringify({ error: 'building and unit are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a draft listing for re-marketing
    const listingId = `LST-VACANCY-${Date.now()}`;
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        listing_id: listingId,
        listing_type: 'Rent',
        status: 'Draft',
        property_id: unit.unit_number || null,
        listing_attributes: {
          building_name: building.name,
          community: building.community,
          city: building.city || 'Abu Dhabi',
          address: building.address,
          unit_number: unit.unit_number,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          area_sqft: unit.area_sqft,
          floor: unit.floor,
          property_type: unit.property_type || 'Apartment',
          source: 'natoor_vacancy',
          vacancy_type: vacancy_type || 'vacant',
          previous_tenant: previous_tenant?.name || null,
        },
      })
      .select()
      .single();

    if (listingError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create listing', details: listingError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the vacancy event
    await supabase.from('event_log_entries').insert({
      event_id: `natoor-vacancy-${Date.now()}`,
      entity_type: 'listing',
      entity_id: listing.id,
      action: 'natoor_vacancy_received',
      after_state: {
        building: building.name,
        unit: unit.unit_number,
        vacancy_type,
        listing_id: listingId,
      },
    });

    // Notify managers
    const { data: managers } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'Manager');

    if (managers?.length) {
      const notifications = managers.map(m => ({
        user_id: m.user_id,
        notification_type: 'vacancy_signal',
        title: 'Natoor Vacancy Alert',
        message: `Unit ${unit.unit_number || ''} at ${building.name} is now ${vacancy_type || 'vacant'}. A draft listing has been created.`,
        entity_type: 'listing',
        entity_id: listing.id,
      }));

      await supabase.from('notifications').insert(notifications);
    }

    return new Response(
      JSON.stringify({
        success: true,
        listing_id: listingId,
        message: 'Vacancy received — draft listing created',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
