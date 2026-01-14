import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Prospect {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  city: string | null;
  crm_customer_id: string | null;
  crm_created_date: string | null;
  crm_stage: string | null;
  crm_confidence_level: string | null;
  outreach_status: string;
  last_contacted_at: string | null;
  contact_attempts: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProspectInsert {
  first_name?: string | null;
  last_name?: string | null;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  city?: string | null;
  crm_customer_id?: string | null;
  crm_created_date?: string | null;
  crm_stage?: string | null;
  crm_confidence_level?: string | null;
  outreach_status?: string;
  notes?: string | null;
}

export function useProspects(filters?: {
  outreach_status?: string;
  confidence_level?: string;
  city?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['prospects', filters],
    queryFn: async () => {
      let query = supabase
        .from('prospects')
        .select('*')
        .order('crm_confidence_level', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.outreach_status && filters.outreach_status !== 'all') {
        query = query.eq('outreach_status', filters.outreach_status);
      }
      if (filters?.confidence_level && filters.confidence_level !== 'all') {
        query = query.eq('crm_confidence_level', filters.confidence_level);
      }
      if (filters?.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(500);
      if (error) throw error;
      return data as Prospect[];
    },
  });
}

export function useProspectStats() {
  return useQuery({
    queryKey: ['prospect-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prospects')
        .select('outreach_status, crm_confidence_level');
      
      if (error) throw error;
      
      const total = data.length;
      const byStatus = data.reduce((acc, p) => {
        acc[p.outreach_status || 'not_contacted'] = (acc[p.outreach_status || 'not_contacted'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const byConfidence = data.reduce((acc, p) => {
        acc[p.crm_confidence_level || 'Unknown'] = (acc[p.crm_confidence_level || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return { total, byStatus, byConfidence };
    },
  });
}

export function useUpdateProspect() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Prospect> }) => {
      const { data, error } = await supabase
        .from('prospects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      queryClient.invalidateQueries({ queryKey: ['prospect-stats'] });
      toast({ title: 'Prospect updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating prospect', description: error.message, variant: 'destructive' });
    },
  });
}

export function useBulkInsertProspects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (prospects: ProspectInsert[]) => {
      // Insert in batches of 500 to avoid timeouts
      const batchSize = 500;
      let inserted = 0;
      
      for (let i = 0; i < prospects.length; i += batchSize) {
        const batch = prospects.slice(i, i + batchSize);
        const { error } = await supabase.from('prospects').insert(batch);
        if (error) throw error;
        inserted += batch.length;
      }
      
      return inserted;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      queryClient.invalidateQueries({ queryKey: ['prospect-stats'] });
      toast({ title: `Imported ${count.toLocaleString()} prospects` });
    },
    onError: (error) => {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
    },
  });
}
