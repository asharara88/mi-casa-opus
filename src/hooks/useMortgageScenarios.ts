import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface MortgageScenarioInputs {
  purchasePriceAed?: number;
  loanAmountAed?: number;
  termYears?: number;
  rateOptionId?: string;
  postFixedRatePct?: number;
  extraPayment?: number;
  comparisonIds?: string[];
}

export interface MortgageScenarioResults {
  monthlyPayment?: number;
  totalInterest?: number;
  upfrontTotal?: number;
}

export interface MortgageScenario {
  id: string;
  user_id: string;
  deal_id: string | null;
  name: string;
  inputs: MortgageScenarioInputs;
  results: MortgageScenarioResults;
  created_at: string;
  updated_at: string;
}

export function useMortgageScenarios(dealId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mortgage_scenarios', dealId],
    queryFn: async () => {
      let query = supabase
        .from('mortgage_scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as MortgageScenario[];
    },
    enabled: !!user,
  });
}

export function useSaveMortgageScenario() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      inputs: MortgageScenarioInputs;
      results: MortgageScenarioResults;
      dealId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('mortgage_scenarios')
        .insert({
          user_id: user.id,
          deal_id: params.dealId ?? null,
          name: params.name,
          inputs: params.inputs as any,
          results: params.results as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage_scenarios'] });
      toast.success('Scenario saved');
    },
    onError: (error) => {
      toast.error('Failed to save scenario', { description: error.message });
    },
  });
}

export function useDeleteMortgageScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mortgage_scenarios')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage_scenarios'] });
      toast.success('Scenario deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete scenario', { description: error.message });
    },
  });
}
