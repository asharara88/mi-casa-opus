import { useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { OffPlanDealState, SecondaryDealState } from '@/types/pipeline';

// Types
interface DealBroker {
  id: string;
  broker_id: string;
  deal_id: string;
  commission_split_percent: number | null;
  role: string | null;
  broker_profiles?: {
    broker_id: string;
    broker_status: string;
  } | null;
}

interface CommissionPreview {
  brokerId: string;
  brokerName: string;
  role: string;
  splitPercent: number;
  grossAmount: number;
  netAmount: number;
  vatAmount: number;
}

interface DealCloseParams {
  dealId: string;
  transactionValue: number;
  commissionPercent: number;
  dealType: 'Sale' | 'Rent';
  pipeline: 'OffPlan' | 'Secondary';
}

// Constants
const DEFAULT_VAT_PERCENT = 5;
const MAX_SALE_COMMISSION_PERCENT = 2;
const MAX_RENT_COMMISSION_PERCENT = 5;

// Helper to generate IDs
function generateCommissionId(): string {
  return `COM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function generateEventId(): string {
  return `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// Hook to preview commissions before closing
export function useCommissionPreview(dealId: string | null) {
  return useQuery({
    queryKey: ['commission-preview', dealId],
    queryFn: async () => {
      if (!dealId) return null;

      // Get deal with economics
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*, deal_economics')
        .eq('id', dealId)
        .single();

      if (dealError) throw dealError;

      // Get deal brokers
      const { data: brokers, error: brokersError } = await supabase
        .from('deal_brokers')
        .select('*, broker_profiles(*)')
        .eq('deal_id', dealId);

      if (brokersError) throw brokersError;

      return {
        deal,
        brokers: brokers || [],
        hasBrokers: (brokers?.length || 0) > 0,
        totalSplitPercent: brokers?.reduce((sum, b) => sum + (b.commission_split_percent || 0), 0) || 0,
      };
    },
    enabled: !!dealId,
  });
}

// Hook to calculate commission breakdown
export function useCalculateCommissionBreakdown() {
  return useCallback((params: {
    transactionValue: number;
    commissionPercent: number;
    brokers: DealBroker[];
    vatPercent?: number;
  }): CommissionPreview[] => {
    const { transactionValue, commissionPercent, brokers, vatPercent = DEFAULT_VAT_PERCENT } = params;
    
    const grossCommission = (transactionValue * commissionPercent) / 100;

    return brokers.map(broker => {
      const splitPercent = broker.commission_split_percent || 0;
      const netAmount = (grossCommission * splitPercent) / 100;
      const vatAmount = (netAmount * vatPercent) / 100;

      return {
        brokerId: broker.broker_id,
        brokerName: broker.broker_profiles?.broker_id || broker.broker_id.slice(0, 8),
        role: broker.role || 'Agent',
        splitPercent,
        grossAmount: grossCommission,
        netAmount,
        vatAmount,
      };
    });
  }, []);
}

// Main hook to close deal and auto-generate commissions
export function useCloseDealWithCommissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DealCloseParams) => {
      const { dealId, transactionValue, commissionPercent, dealType, pipeline } = params;

      // Validate commission caps
      const maxPercent = dealType === 'Sale' ? MAX_SALE_COMMISSION_PERCENT : MAX_RENT_COMMISSION_PERCENT;
      if (commissionPercent > maxPercent) {
        throw new Error(`Commission exceeds regulatory cap of ${maxPercent}% for ${dealType} transactions`);
      }

      // 1. Fetch deal brokers
      const { data: dealBrokers, error: brokersError } = await supabase
        .from('deal_brokers')
        .select('*')
        .eq('deal_id', dealId);

      if (brokersError) {
        throw new Error(`Failed to fetch deal brokers: ${brokersError.message}`);
      }

      // 2. Validate broker splits
      const totalSplit = (dealBrokers || []).reduce(
        (sum, broker) => sum + (broker.commission_split_percent || 0),
        0
      );

      if (totalSplit !== 100 && dealBrokers && dealBrokers.length > 0) {
        throw new Error(`Total commission split must equal 100%, currently ${totalSplit}%`);
      }

      // 3. Calculate commissions
      const grossCommission = (transactionValue * commissionPercent) / 100;
      const commissionResults: Array<{
        commissionId: string;
        brokerId: string;
        grossAmount: number;
        netAmount: number;
        splitPercent: number;
      }> = [];

      // 4. Create commission records for each broker
      for (const broker of dealBrokers || []) {
        const splitPercent = broker.commission_split_percent || 0;
        const netAmount = (grossCommission * splitPercent) / 100;
        const vatAmount = (netAmount * DEFAULT_VAT_PERCENT) / 100;
        const commissionId = generateCommissionId();

        const { data, error } = await supabase
          .from('commission_records')
          .insert([{
            commission_id: commissionId,
            deal_id: dealId,
            broker_id: broker.broker_id,
            gross_amount: grossCommission,
            net_amount: netAmount,
            split_percent: splitPercent,
            status: 'Earned' as const, // Deal closed = commission earned
            calculation_trace: {
              transaction_value: transactionValue,
              commission_percent: commissionPercent,
              gross_commission: grossCommission,
              split_percent: splitPercent,
              net_before_vat: netAmount,
              vat_percent: DEFAULT_VAT_PERCENT,
              vat_amount: vatAmount,
              net_after_vat: netAmount - vatAmount,
              calculated_at: new Date().toISOString(),
              auto_generated: true,
              trigger: 'deal_closed_won',
            },
          }])
          .select()
          .single();

        if (error) {
          console.error('Failed to create commission record:', error);
          throw new Error(`Failed to create commission for broker: ${error.message}`);
        }

        commissionResults.push({
          commissionId: data.commission_id,
          brokerId: broker.broker_id,
          grossAmount: grossCommission,
          netAmount,
          splitPercent,
        });
      }

      // 5. Update deal state to ClosedWon
      const stateField = pipeline === 'OffPlan' ? 'offplan_state' : 'secondary_state';
      const { error: updateError } = await supabase
        .from('deals')
        .update({
          [stateField]: 'ClosedWon',
          deal_state: 'ClosedWon',
          deal_economics: {
            transaction_value: transactionValue,
            commission_percent: commissionPercent,
            gross_commission: grossCommission,
            commissions_generated_at: new Date().toISOString(),
          },
        })
        .eq('id', dealId);

      if (updateError) {
        throw new Error(`Failed to update deal state: ${updateError.message}`);
      }

      // 6. Create event log entry
      await supabase.from('event_log_entries').insert([{
        event_id: generateEventId(),
        entity_type: 'deal',
        entity_id: dealId,
        action: 'deal_closed_won',
        before_state: { deal_state: 'Active' },
        after_state: { 
          deal_state: 'ClosedWon',
          commissions_generated: commissionResults.length,
          gross_commission: grossCommission,
        },
        decision: 'approved',
      }]);

      // 7. Create evidence object for commission calculation
      await supabase.from('evidence_objects').insert([{
        evidence_id: `EVD-COM-${Date.now().toString(36).toUpperCase()}`,
        entity_type: 'deal',
        entity_id: dealId,
        evidence_type: 'Other' as const,
        source: 'commission_auto_generation',
        immutability_class: 'System' as const,
        captured_by: 'system',
        metadata: {
          commission_ids: commissionResults.map(r => r.commissionId),
          total_gross: grossCommission,
          broker_count: commissionResults.length,
          transaction_value: transactionValue,
          commission_percent: commissionPercent,
          generated_at: new Date().toISOString(),
        },
      }]);

      return {
        dealId,
        commissions: commissionResults,
        grossCommission,
        totalBrokers: commissionResults.length,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['commission_records'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline_stats'] });

      toast.success('Deal closed successfully! 🎉', {
        description: `${result.totalBrokers} commission record(s) generated. Gross: AED ${result.grossCommission.toLocaleString()}`,
      });
    },
    onError: (error) => {
      toast.error('Failed to close deal', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
}

// Hook to add/update broker splits
export function useManageDealBrokers(dealId: string | null) {
  const queryClient = useQueryClient();

  const addBroker = useMutation({
    mutationFn: async (params: {
      broker_id: string;
      commission_split_percent: number;
      role: string;
    }) => {
      if (!dealId) throw new Error('Deal ID required');

      const { data, error } = await supabase
        .from('deal_brokers')
        .insert([{
          deal_id: dealId,
          broker_id: params.broker_id,
          commission_split_percent: params.commission_split_percent,
          role: params.role,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal_brokers', dealId] });
      queryClient.invalidateQueries({ queryKey: ['commission-preview', dealId] });
      toast.success('Broker added to deal');
    },
    onError: (error) => {
      toast.error('Failed to add broker', { description: error.message });
    },
  });

  const updateSplit = useMutation({
    mutationFn: async (params: { id: string; commission_split_percent: number }) => {
      const { data, error } = await supabase
        .from('deal_brokers')
        .update({ commission_split_percent: params.commission_split_percent })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal_brokers', dealId] });
      queryClient.invalidateQueries({ queryKey: ['commission-preview', dealId] });
      toast.success('Split updated');
    },
    onError: (error) => {
      toast.error('Failed to update split', { description: error.message });
    },
  });

  const removeBroker = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deal_brokers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal_brokers', dealId] });
      queryClient.invalidateQueries({ queryKey: ['commission-preview', dealId] });
      toast.success('Broker removed');
    },
    onError: (error) => {
      toast.error('Failed to remove broker', { description: error.message });
    },
  });

  return { addBroker, updateSplit, removeBroker };
}
