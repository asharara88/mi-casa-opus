import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DealBroker {
  id: string;
  broker_id: string;
  deal_id: string;
  commission_split_percent: number | null;
  role: string | null;
}

interface CommissionResult {
  commissionId: string;
  brokerId: string;
  grossAmount: number;
  netAmount: number;
  splitPercent: number;
}

interface GenerateCommissionsParams {
  dealId: string;
  transactionValue: number;
  commissionPercent: number; // e.g., 2 for 2%
  vatPercent?: number; // Default 5% for UAE
}

const DEFAULT_VAT_PERCENT = 5;
const MAX_SALE_COMMISSION_PERCENT = 2;
const MAX_RENT_COMMISSION_PERCENT = 5;

export function useCommissionGeneration() {
  const queryClient = useQueryClient();

  const generateCommissions = useCallback(async ({
    dealId,
    transactionValue,
    commissionPercent,
    vatPercent = DEFAULT_VAT_PERCENT,
  }: GenerateCommissionsParams): Promise<CommissionResult[]> => {
    // 1. Fetch deal brokers for this deal
    const { data: dealBrokers, error: brokersError } = await supabase
      .from('deal_brokers')
      .select('*')
      .eq('deal_id', dealId);

    if (brokersError) {
      throw new Error(`Failed to fetch deal brokers: ${brokersError.message}`);
    }

    if (!dealBrokers || dealBrokers.length === 0) {
      throw new Error('No brokers assigned to this deal');
    }

    // 2. Validate total split percentages
    const totalSplit = dealBrokers.reduce(
      (sum, broker) => sum + (broker.commission_split_percent || 0),
      0
    );

    if (totalSplit !== 100) {
      throw new Error(`Total commission split must equal 100%, currently ${totalSplit}%`);
    }

    // 3. Calculate gross commission
    const grossCommission = (transactionValue * commissionPercent) / 100;

    // 4. Generate commission records for each broker
    const results: CommissionResult[] = [];
    const timestamp = Date.now().toString(36).toUpperCase();

    for (const broker of dealBrokers) {
      const splitPercent = broker.commission_split_percent || 0;
      const netAmount = (grossCommission * splitPercent) / 100;
      const vatAmount = (netAmount * vatPercent) / 100;
      
      const commissionId = `COM-${timestamp}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const { data, error } = await supabase
        .from('commission_records')
        .insert([{
          commission_id: commissionId,
          deal_id: dealId,
          broker_id: broker.broker_id,
          gross_amount: grossCommission,
          net_amount: netAmount,
          split_percent: splitPercent,
          status: 'Expected' as const, // Valid: Expected, Earned, Received, Paid, Voided
          calculation_trace: {
            transaction_value: transactionValue,
            commission_percent: commissionPercent,
            gross_commission: grossCommission,
            split_percent: splitPercent,
            net_before_vat: netAmount,
            vat_percent: vatPercent,
            vat_amount: vatAmount,
            net_after_vat: netAmount - vatAmount,
            calculated_at: new Date().toISOString(),
          },
        }])
        .select()
        .single();

      if (error) {
        console.error('Failed to create commission record:', error);
        throw new Error(`Failed to create commission for broker ${broker.broker_id}: ${error.message}`);
      }

      results.push({
        commissionId: data.commission_id,
        brokerId: broker.broker_id,
        grossAmount: grossCommission,
        netAmount,
        splitPercent,
      });
    }

    // 5. Create evidence record for the commission calculation
    const evidenceId = `EVD-${timestamp}`;
    await supabase.from('evidence_objects').insert([{
      evidence_id: evidenceId,
      entity_type: 'deal',
      entity_id: dealId,
      evidence_type: 'Other' as const, // Valid: DARI, TAMM, PaymentProof, Identity, TruthPack, Photo, Email, Contract, Other
      source: 'commission_generation',
      immutability_class: 'System' as const, // Valid: External, Internal, System
      captured_by: 'system',
      metadata: {
        commission_ids: results.map(r => r.commissionId),
        total_gross: grossCommission,
        broker_count: results.length,
        generated_at: new Date().toISOString(),
      },
    }]);

    return results;
  }, []);

  const validateCommissionCaps = useCallback((
    dealType: 'Sale' | 'Rent',
    commissionPercent: number
  ): { valid: boolean; message?: string } => {
    const maxPercent = dealType === 'Sale' ? MAX_SALE_COMMISSION_PERCENT : MAX_RENT_COMMISSION_PERCENT;
    
    if (commissionPercent > maxPercent) {
      return {
        valid: false,
        message: `Commission exceeds regulatory cap of ${maxPercent}% for ${dealType} transactions`,
      };
    }

    return { valid: true };
  }, []);

  const mutation = useMutation({
    mutationFn: generateCommissions,
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline_deals'] });
      toast.success(`Generated ${results.length} commission record(s)`, {
        description: `Total gross: AED ${results[0]?.grossAmount.toLocaleString()}`,
      });
    },
    onError: (error) => {
      toast.error('Failed to generate commissions', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  return {
    generateCommissions: mutation.mutateAsync,
    validateCommissionCaps,
    isGenerating: mutation.isPending,
    error: mutation.error,
  };
}

// Hook to preview commission breakdown before closing a deal
export function useCommissionPreview(dealId: string, transactionValue: number, commissionPercent: number) {
  const fetchPreview = useCallback(async () => {
    const { data: dealBrokers } = await supabase
      .from('deal_brokers')
      .select('*, broker_profiles(*)')
      .eq('deal_id', dealId);

    if (!dealBrokers) return null;

    const grossCommission = (transactionValue * commissionPercent) / 100;
    
    return dealBrokers.map(broker => ({
      brokerId: broker.broker_id,
      brokerName: (broker.broker_profiles as any)?.broker_id || 'Unknown',
      role: broker.role,
      splitPercent: broker.commission_split_percent || 0,
      netAmount: (grossCommission * (broker.commission_split_percent || 0)) / 100,
    }));
  }, [dealId, transactionValue, commissionPercent]);

  return { fetchPreview };
}
