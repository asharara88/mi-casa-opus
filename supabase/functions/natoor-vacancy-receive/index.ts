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
    const integrationSecret = Deno.env.get('INTEGRATION_SECRET');

    if (!natoorUrl || !integrationSecret) {
      return new Response(
        JSON.stringify({ error: 'Natoor integration secrets not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pull vacancies from Natoor's integration-webhook
    const [vacanciesRes, expiringRes] = await Promise.all([
      fetch(`${natoorUrl}/functions/v1/integration-webhook?type=vacancies`, {
        headers: { 'Authorization': `Bearer ${integrationSecret}` },
      }),
      fetch(`${natoorUrl}/functions/v1/integration-webhook?type=expiring_leases`, {
        headers: { 'Authorization': `Bearer ${integrationSecret}` },
      }),
    ]);

    const vacancies = vacanciesRes.ok ? await vacanciesRes.json().catch(() => []) : [];
    const expiringLeases = expiringRes.ok ? await expiringRes.json().catch(() => []) : [];

    const allUnits = [
      ...(Array.isArray(vacancies) ? vacancies : vacancies?.data || []),
      ...(Array.isArray(expiringLeases) ? expiringLeases : expiringLeases?.data || []),
    ];

    if (!allUnits.length) {
      return new Response(
        JSON.stringify({ success: true, message: 'No vacancies or expiring leases found', created: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch existing natoor-sourced listings to deduplicate
    const { data: existingListings } = await supabase
      .from('listings')
      .select('listing_id, listing_attributes')
      .like('listing_id', 'LST-VACANCY-%');

    const existingUnitKeys = new Set(
      (existingListings || []).map(l => {
        const attrs = (l.listing_attributes as Record<string, unknown>) || {};
        return `${attrs.building_name || ''}-${attrs.unit_number || ''}`;
      })
    );

    let created = 0;
    const notifications: Array<{ user_id: string; notification_type: string; title: string; message: string; entity_type: string; entity_id: string }> = [];

    for (const unit of allUnits) {
      const buildingName = unit.building_name || unit.building?.name || 'Unknown';
      const unitNumber = unit.unit_number || unit.unit?.number || '';
      const dedupeKey = `${buildingName}-${unitNumber}`;

      if (existingUnitKeys.has(dedupeKey)) continue;

      const listingId = `LST-VACANCY-${Date.now()}-${created}`;
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          listing_id: listingId,
          listing_type: 'Rent',
          status: 'Draft',
          property_id: unitNumber || null,
          listing_attributes: {
            building_name: buildingName,
            community: unit.community || unit.building?.community || '',
            city: unit.city || 'Abu Dhabi',
            unit_number: unitNumber,
            bedrooms: unit.bedrooms || unit.unit?.bedrooms || null,
            bathrooms: unit.bathrooms || unit.unit?.bathrooms || null,
            area_sqft: unit.area_sqft || unit.unit?.area_sqft || null,
            property_type: unit.property_type || 'Apartment',
            source: 'natoor_vacancy',
            vacancy_type: unit.status || 'vacant',
            last_rent: unit.last_rent || unit.annual_rent || null,
            lease_end_date: unit.lease_end_date || unit.end_date || null,
          },
        })
        .select()
        .single();

      if (!listingError && listing) {
        created++;
        existingUnitKeys.add(dedupeKey);

        // Log the event
        await supabase.from('event_log_entries').insert({
          event_id: `natoor-vacancy-${Date.now()}-${created}`,
          entity_type: 'listing',
          entity_id: listing.id,
          action: 'natoor_vacancy_imported',
          after_state: {
            building: buildingName,
            unit: unitNumber,
            listing_id: listingId,
            source: 'natoor_pull',
          },
        });
      }
    }

    // Notify managers if new vacancies were created
    if (created > 0) {
      const { data: managers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'Manager');

      if (managers?.length) {
        const notifs = managers.map(m => ({
          user_id: m.user_id,
          notification_type: 'vacancy_signal',
          title: 'Natoor Vacancy Sync',
          message: `${created} new draft listing(s) created from Natoor vacancy data.`,
          entity_type: 'listing',
          entity_id: 'batch',
        }));
        await supabase.from('notifications').insert(notifs);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${created} new vacancy listing(s) from Natoor`,
        created,
        total_checked: allUnits.length,
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
