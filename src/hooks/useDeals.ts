 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useDemoMode } from '@/contexts/DemoContext';
 import { DEMO_DEALS } from '@/data/demoData';
 import { useAuth } from './useAuth';

export type Deal = Tables<'deals'>;
export type DealInsert = TablesInsert<'deals'>;
export type DealUpdate = TablesUpdate<'deals'>;

export type DealParty = Tables<'deal_parties'>;
export type DealBroker = Tables<'deal_brokers'>;

export function useDeals() {
  const { isDemoMode } = useDemoMode();
   const { user } = useAuth();
   const queryClient = useQueryClient();

   const query = useQuery({
    queryKey: ['deals', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return DEMO_DEALS as unknown as Deal[];
      }

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Deal[];
    },
  });
 
   // Real-time subscription
   useEffect(() => {
     if (isDemoMode || !user?.id) return;
 
     const channel = supabase
       .channel('deals-realtime')
       .on(
         'postgres_changes',
         { event: '*', schema: 'public', table: 'deals' },
         () => {
           queryClient.invalidateQueries({ queryKey: ['deals'] });
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [isDemoMode, user?.id, queryClient]);
 
   return query;
}

export function useDeal(id: string | null) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Deal | null;
    },
    enabled: !!id,
  });
}

export function useDealParties(dealId: string | null) {
  return useQuery({
    queryKey: ['deal_parties', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase
        .from('deal_parties')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DealParty[];
    },
    enabled: !!dealId,
  });
}

export function useDealBrokers(dealId: string | null) {
  return useQuery({
    queryKey: ['deal_brokers', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase
        .from('deal_brokers')
        .select('*, broker_profiles(*)')
        .eq('deal_id', dealId);

      if (error) throw error;
      return data;
    },
    enabled: !!dealId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deal: DealInsert) => {
      const { data, error } = await supabase
        .from('deals')
        .insert(deal)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create deal', { description: error.message });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DealUpdate }) => {
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
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update deal', { description: error.message });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete deal', { description: error.message });
    },
  });
}
