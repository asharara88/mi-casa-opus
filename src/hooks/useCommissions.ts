import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useDemoMode } from '@/contexts/DemoContext';
import { DEMO_COMMISSIONS, DEMO_PAYOUT_BATCHES, DEMO_PAYOUT_LINES } from '@/data/demoData';

export type CommissionRecord = Tables<'commission_records'>;
export type CommissionInsert = TablesInsert<'commission_records'>;
export type CommissionUpdate = TablesUpdate<'commission_records'>;

export type PayoutBatch = Tables<'payout_batches'>;
export type PayoutBatchInsert = TablesInsert<'payout_batches'>;
export type PayoutBatchUpdate = TablesUpdate<'payout_batches'>;

export type PayoutLine = Tables<'payout_lines'>;

export function useCommissions() {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['commissions', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return DEMO_COMMISSIONS as unknown as CommissionRecord[];
      }

      const { data, error } = await supabase
        .from('commission_records')
        .select('*, broker_profiles(*), deals(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function usePayoutBatches() {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['payout_batches', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return DEMO_PAYOUT_BATCHES as unknown as PayoutBatch[];
      }

      const { data, error } = await supabase
        .from('payout_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PayoutBatch[];
    },
  });
}

export function usePayoutLines(batchId: string | null) {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['payout_lines', batchId, isDemoMode],
    queryFn: async () => {
      if (!batchId) return [];
      
      if (isDemoMode) {
        return DEMO_PAYOUT_LINES.filter(line => line.batch_id === batchId) as unknown as PayoutLine[];
      }

      const { data, error } = await supabase
        .from('payout_lines')
        .select('*, commission_records(*)')
        .eq('batch_id', batchId);

      if (error) throw error;
      return data;
    },
    enabled: !!batchId,
  });
}

export function useCreatePayoutBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batch: PayoutBatchInsert) => {
      const { data, error } = await supabase
        .from('payout_batches')
        .insert(batch)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout_batches'] });
      toast.success('Payout batch created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create payout batch', { description: error.message });
    },
  });
}

export function useUpdatePayoutBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PayoutBatchUpdate }) => {
      const { data, error } = await supabase
        .from('payout_batches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout_batches'] });
      toast.success('Payout batch updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update payout batch', { description: error.message });
    },
  });
}

export function useUpdateCommissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CommissionRecord['status'] }) => {
      const { data, error } = await supabase
        .from('commission_records')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
    },
    onError: (error) => {
      toast.error('Failed to update commission', { description: error.message });
    },
  });
}
