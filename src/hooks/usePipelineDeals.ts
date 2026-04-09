import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDemoMode } from '@/contexts/DemoContext';
import { 
  DealPipeline, 
  OffPlanDealState, 
  SecondaryDealState,
  OffPlanDeadReason,
  SecondaryDeadReason 
} from '@/types/pipeline';

export interface PipelineDeal {
  id: string;
  deal_id: string;
  pipeline: DealPipeline;
  deal_type: string;
  deal_state: string;
  offplan_state: OffPlanDealState | null;
  secondary_state: SecondaryDealState | null;
  side: string;
  linked_lead_id: string | null;
  listing_id: string | null;
  property_id: string | null;
  developer_id: string | null;
  developer_project_id: string | null;
  developer_project_name: string | null;
  deal_economics: any;
  noc_status: string | null;
  noc_reference: string | null;
  noc_obtained_at: string | null;
  mortgage_status: string | null;
  mortgage_provider: string | null;
  mortgage_pre_approval_at: string | null;
  eoi_amount: number | null;
  eoi_paid_at: string | null;
  payment_plan_type: string | null;
  construction_milestone: string | null;
  handover_date: string | null;
  transfer_number: string | null;
  transfer_date: string | null;
  offplan_dead_reason: OffPlanDeadReason | null;
  secondary_dead_reason: SecondaryDeadReason | null;
  lost_reason: string | null;
  lost_reason_notes: string | null;
  lost_at: string | null;
  next_action: string | null;
  next_action_due: string | null;
  next_action_owner: string | null;
  notes: string | null;
  compliance_status: string | null;
  created_at: string;
  updated_at: string;
}

export function usePipelineDeals(pipeline?: DealPipeline) {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['pipeline_deals', pipeline, isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        // Return demo data for pipeline
        return [] as PipelineDeal[];
      }

      let query = supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (pipeline) {
        query = query.eq('pipeline', pipeline);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data as PipelineDeal[];
    },
  });
}

export function useOffPlanDeals() {
  return usePipelineDeals('OffPlan');
}

export function useSecondaryDeals() {
  return usePipelineDeals('Secondary');
}

export function usePipelineStats() {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['pipeline_stats', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return {
          offplan: { total: 0, active: 0, won: 0, lost: 0, winRate: 0 },
          secondary: { total: 0, active: 0, won: 0, lost: 0, winRate: 0 },
        };
      }

      const { data, error } = await supabase
        .from('deals')
        .select('pipeline, deal_state, offplan_state, secondary_state');

      if (error) throw error;

      const stats = {
        offplan: { total: 0, active: 0, won: 0, lost: 0, winRate: 0 },
        secondary: { total: 0, active: 0, won: 0, lost: 0, winRate: 0 },
      };

      (data || []).forEach((deal: any) => {
        const key = deal.pipeline === 'OffPlan' ? 'offplan' : 'secondary';
        stats[key].total++;

        const state = deal.pipeline === 'OffPlan' ? deal.offplan_state : deal.secondary_state;
        
        if (state === 'ClosedWon') {
          stats[key].won++;
        } else if (state === 'ClosedLost') {
          stats[key].lost++;
        } else {
          stats[key].active++;
        }
      });

      // Calculate win rates
      const closedOffplan = stats.offplan.won + stats.offplan.lost;
      const closedSecondary = stats.secondary.won + stats.secondary.lost;
      
      stats.offplan.winRate = closedOffplan > 0 
        ? Math.round((stats.offplan.won / closedOffplan) * 100) 
        : 0;
      stats.secondary.winRate = closedSecondary > 0 
        ? Math.round((stats.secondary.won / closedSecondary) * 100) 
        : 0;

      return stats;
    },
  });
}

export function useUpdatePipelineDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Record<string, any>
    }) => {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline_stats'] });
      toast.success('Deal updated');
    },
    onError: (error) => {
      toast.error('Failed to update deal', { description: error.message });
    },
  });
}

export function useTransitionOffPlanDeal() {
  const updateDeal = useUpdatePipelineDeal();

  return useMutation({
    mutationFn: async ({ 
      id, 
      targetState,
      deadReason,
      notes
    }: { 
      id: string; 
      targetState: OffPlanDealState;
      deadReason?: OffPlanDeadReason;
      notes?: string;
    }) => {
      const updates: Partial<PipelineDeal> = {
        offplan_state: targetState,
      };

      if (targetState === 'ClosedLost') {
        updates.offplan_dead_reason = deadReason || null;
        updates.lost_reason_notes = notes || null;
        updates.lost_at = new Date().toISOString();
        updates.deal_state = 'ClosedLost' as any;
      } else if (targetState === 'ClosedWon') {
        updates.deal_state = 'ClosedWon' as any;
      }

      return updateDeal.mutateAsync({ id, updates });
    },
  });
}

export function useTransitionSecondaryDeal() {
  const updateDeal = useUpdatePipelineDeal();

  return useMutation({
    mutationFn: async ({ 
      id, 
      targetState,
      deadReason,
      notes
    }: { 
      id: string; 
      targetState: SecondaryDealState;
      deadReason?: SecondaryDeadReason;
      notes?: string;
    }) => {
      const updates: Partial<PipelineDeal> = {
        secondary_state: targetState,
      };

      if (targetState === 'ClosedLost') {
        updates.secondary_dead_reason = deadReason || null;
        updates.lost_reason_notes = notes || null;
        updates.lost_at = new Date().toISOString();
        updates.deal_state = 'ClosedLost' as any;
      } else if (targetState === 'ClosedWon') {
        updates.deal_state = 'ClosedWon' as any;
      }

      return updateDeal.mutateAsync({ id, updates });
    },
  });
}

export function useCreatePipelineDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deal: {
      pipeline: DealPipeline;
      deal_type: string;
      side: string;
      developer_id?: string;
      developer_project_id?: string;
      developer_project_name?: string;
      listing_id?: string;
      linked_lead_id?: string;
      deal_economics?: any;
      notes?: string;
    }) => {
      const dealId = `DEAL-${Date.now().toString(36).toUpperCase()}`;
      
      const insertData: any = {
        deal_id: dealId,
        pipeline: deal.pipeline,
        deal_type: deal.deal_type,
        side: deal.side,
        deal_state: 'Created',
        notes: deal.notes,
        deal_economics: deal.deal_economics,
      };

      // Set initial state based on pipeline
      if (deal.pipeline === 'OffPlan') {
        insertData.offplan_state = 'LeadQualified';
        insertData.developer_id = deal.developer_id;
        insertData.developer_project_id = deal.developer_project_id;
        insertData.developer_project_name = deal.developer_project_name;
      } else {
        insertData.secondary_state = 'RequirementsCaptured';
        insertData.listing_id = deal.listing_id;
      }

      if (deal.linked_lead_id) {
        insertData.linked_lead_id = deal.linked_lead_id;
      }

      const { data, error } = await supabase
        .from('deals')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline_stats'] });
      toast.success('Deal created');
    },
    onError: (error) => {
      toast.error('Failed to create deal', { description: error.message });
    },
  });
}
