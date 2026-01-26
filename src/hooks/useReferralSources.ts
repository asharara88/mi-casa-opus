import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ReferralSource, ReferralType } from '@/types/marketing';

interface ReferralSourceInsert {
  name: string;
  type: ReferralType;
  company_name?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  commission_percent?: number;
  status?: string;
  notes?: string;
}

export function useReferralSources() {
  const queryClient = useQueryClient();

  const { data: sources = [], isLoading, error } = useQuery({
    queryKey: ['referral-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_sources')
        .select('*')
        .order('leads_generated', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as ReferralSource[];
    },
  });

  const createSource = useMutation({
    mutationFn: async (source: ReferralSourceInsert) => {
      const sourceId = `REF-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('referral_sources')
        .insert({
          ...source,
          source_id: sourceId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-sources'] });
      toast.success('Referral source created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create referral source: ${error.message}`);
    },
  });

  const updateSource = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReferralSource> & { id: string }) => {
      const { data, error } = await supabase
        .from('referral_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-sources'] });
      toast.success('Referral source updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update referral source: ${error.message}`);
    },
  });

  const deleteSource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('referral_sources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-sources'] });
      toast.success('Referral source deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete referral source: ${error.message}`);
    },
  });

  return {
    sources,
    isLoading,
    error,
    createSource,
    updateSource,
    deleteSource,
  };
}
