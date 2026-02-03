import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DealPipeline } from '@/types/pipeline';
import { Database } from '@/integrations/supabase/types';

type PartyRole = Database['public']['Enums']['party_role'];

interface LeadData {
  id: string;
  lead_id: string;
  contact_name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  source: string;
  notes?: string | null;
  qualification_data?: {
    budget_min?: number;
    budget_max?: number;
    property_types?: string[];
    locations?: string[];
    bedrooms_min?: number;
    bedrooms_max?: number;
    area_min?: number;
    area_max?: number;
    purpose?: string;
    timeframe?: string;
    mortgage_required?: boolean;
    mortgage_preapproved?: boolean;
    poa_available?: boolean;
    citizenship?: string;
    [key: string]: unknown;
  } | null;
}

interface ConversionConfig {
  pipeline: DealPipeline;
  dealType: 'Sale' | 'Rent';
  side: 'Buy' | 'Sell';
  developerId?: string;
  developerProjectId?: string;
  developerProjectName?: string;
  listingId?: string;
  transactionValue?: number;
  commissionPercent?: number;
}

interface ConversionResult {
  dealId: string;
  dealRecordId: string;
  partyId: string;
}

// Map lead requirements to deal economics
function mapLeadToDealEconomics(
  lead: LeadData, 
  config: ConversionConfig
): Record<string, unknown> {
  const requirements = lead.qualification_data || {};
  
  return {
    // Source tracking
    lead_source: lead.source,
    lead_id: lead.lead_id,
    converted_at: new Date().toISOString(),
    
    // Client info
    client_name: lead.contact_name,
    client_email: lead.contact_email,
    client_phone: lead.contact_phone,
    
    // Budget from lead requirements
    budget_min: requirements.budget_min || null,
    budget_max: requirements.budget_max || null,
    estimated_value: config.transactionValue || requirements.budget_max || requirements.budget_min || null,
    
    // Commission structure (UAE caps: 2% sales, 5% rentals)
    commission_percent: config.commissionPercent || (config.dealType === 'Sale' ? 2 : 5),
    expected_commission: config.transactionValue 
      ? (config.transactionValue * (config.commissionPercent || (config.dealType === 'Sale' ? 2 : 5))) / 100
      : null,
    
    // Property requirements
    property_requirements: {
      types: requirements.property_types || [],
      locations: requirements.locations || [],
      bedrooms_min: requirements.bedrooms_min,
      bedrooms_max: requirements.bedrooms_max,
      area_min: requirements.area_min,
      area_max: requirements.area_max,
      purpose: requirements.purpose,
    },
    
    // Financing
    mortgage_required: requirements.mortgage_required || false,
    mortgage_preapproved: requirements.mortgage_preapproved || false,
    
    // Client profile
    client_profile: {
      citizenship: requirements.citizenship,
      poa_available: requirements.poa_available,
      timeframe: requirements.timeframe,
    },
    
    // Transaction details
    transaction_type: config.dealType,
    client_side: config.side,
  };
}

// Determine party role based on deal type and side
function determinePartyRole(
  dealType: 'Sale' | 'Rent',
  side: 'Buy' | 'Sell'
): PartyRole {
  if (dealType === 'Sale') {
    return side === 'Buy' ? 'Buyer' : 'Seller';
  }
  // For rentals: Lessee = tenant (buyer side), Lessor = landlord (seller side)
  return side === 'Buy' ? 'Lessee' : 'Lessor';
}

export function useLeadToDealConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lead,
      config,
    }: {
      lead: LeadData;
      config: ConversionConfig;
    }): Promise<ConversionResult> => {
      // 1. Generate deal ID
      const dealId = `DEAL-${Date.now().toString(36).toUpperCase()}`;
      
      // 2. Map lead data to deal economics
      const dealEconomics = mapLeadToDealEconomics(lead, config);
      
      // 3. Prepare deal insert data
      const dealInsert: Record<string, unknown> = {
        deal_id: dealId,
        pipeline: config.pipeline,
        deal_type: config.dealType,
        side: config.side,
        deal_state: 'Created',
        linked_lead_id: lead.id,
        deal_economics: dealEconomics,
        notes: lead.notes 
          ? `Converted from lead ${lead.lead_id}. ${lead.notes}` 
          : `Converted from lead ${lead.lead_id}`,
      };

      // Set initial pipeline state and developer info
      if (config.pipeline === 'OffPlan') {
        dealInsert.offplan_state = 'LeadQualified';
        dealInsert.developer_id = config.developerId || null;
        dealInsert.developer_project_id = config.developerProjectId || null;
        dealInsert.developer_project_name = config.developerProjectName || null;
      } else {
        dealInsert.secondary_state = 'RequirementsCaptured';
        dealInsert.listing_id = config.listingId || null;
      }

      // 4. Create the deal
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert([dealInsert as any])
        .select()
        .single();

      if (dealError) {
        throw new Error(`Failed to create deal: ${dealError.message}`);
      }

      // 5. Create deal party (buyer/seller/tenant/landlord)
      const partyRole = determinePartyRole(config.dealType, config.side);
      
      const { data: party, error: partyError } = await supabase
        .from('deal_parties')
        .insert({
          deal_id: deal.id,
          party_name: lead.contact_name,
          party_email: lead.contact_email || null,
          party_phone: lead.contact_phone || null,
          party_role: partyRole,
        })
        .select()
        .single();

      if (partyError) {
        console.error('Failed to create deal party:', partyError);
        // Don't throw - deal was created successfully
      }

      // 6. Update lead state to Converted
      const { error: leadUpdateError } = await supabase
        .from('leads')
        .update({ lead_state: 'Converted' })
        .eq('id', lead.id);

      if (leadUpdateError) {
        console.error('Failed to update lead state:', leadUpdateError);
      }

      // 7. Create event log entry for audit trail
      const eventId = `EVT-${Date.now().toString(36).toUpperCase()}`;
      await supabase
        .from('event_log_entries')
        .insert({
          event_id: eventId,
          entity_type: 'Deal',
          entity_id: deal.id,
          action: 'LEAD_CONVERTED',
          before_state: { lead_id: lead.id, lead_state: lead.source },
          after_state: { 
            deal_id: dealId, 
            pipeline: config.pipeline,
            party_role: partyRole,
          },
          decision: 'APPROVED',
        });

      return {
        dealId,
        dealRecordId: deal.id,
        partyId: party?.id || '',
      };
    },
    onSuccess: (result, { lead, config }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline_deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline_stats'] });
      queryClient.invalidateQueries({ queryKey: ['deal_parties'] });

      toast.success('Lead converted to deal', {
        description: `${lead.contact_name} → ${config.pipeline} pipeline as ${
          config.side === 'Buy' 
            ? (config.dealType === 'Sale' ? 'Buyer' : 'Tenant')
            : (config.dealType === 'Sale' ? 'Seller' : 'Landlord')
        }`,
      });
    },
    onError: (error) => {
      toast.error('Conversion failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
}

// Hook to fetch deals by linked lead
export function useDealsByLead(leadId: string | null) {
  return {
    queryKey: ['deals_by_lead', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('linked_lead_id', leadId);

      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  };
}
