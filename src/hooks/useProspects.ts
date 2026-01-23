import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDemoMode } from '@/contexts/DemoContext';
import { DEMO_PROSPECT_STATS } from '@/data/demoData';

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
  // MiCasa algorithm fields
  buyer_type?: 'EndUser' | 'Investor' | 'Broker' | null;
  budget_min?: number | null;
  budget_max?: number | null;
  timeframe?: '0-3' | '3-6' | '6-12' | '12+' | null;
  language?: string | null;
  country?: string | null;
  prospect_status?: 'NEW' | 'INCOMPLETE' | 'VERIFIED' | 'DISQUALIFIED' | null;
  disqualification_reason?: 'SPAM' | 'DUPLICATE' | 'BROKER' | 'BELOW_BUDGET' | 'INELIGIBLE' | null;
  disqualified_at?: string | null;
  linked_lead_id?: string | null;
  // Intent signals
  is_cash_buyer?: boolean;
  mortgage_preapproval?: boolean;
  price_list_requested?: boolean;
  whatsapp_started?: boolean;
  brochure_downloaded?: boolean;
  repeat_visit_7d?: boolean;
  // Scoring
  fit_score?: number;
  intent_score?: number;
  total_score?: number;
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
  // MiCasa algorithm fields
  buyer_type?: 'EndUser' | 'Investor' | 'Broker' | null;
  budget_min?: number | null;
  budget_max?: number | null;
  timeframe?: '0-3' | '3-6' | '6-12' | '12+' | null;
  language?: string | null;
  country?: string | null;
  prospect_status?: string;
  is_cash_buyer?: boolean;
  mortgage_preapproval?: boolean;
  price_list_requested?: boolean;
  whatsapp_started?: boolean;
  brochure_downloaded?: boolean;
  repeat_visit_7d?: boolean;
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
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['prospect-stats', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return DEMO_PROSPECT_STATS;
      }

      // Use count queries to avoid 1000 row limit
      const { count: total, error: totalError } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) throw totalError;

      // Get counts by outreach_status
      const statusValues = ['not_contacted', 'contacted', 'qualified', 'not_interested', 'converted'];
      const byStatus: Record<string, number> = {};
      
      for (const status of statusValues) {
        const { count, error } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('outreach_status', status);
        if (!error && count !== null) {
          byStatus[status] = count;
        }
      }

      // Get counts by confidence level
      const confidenceLevels = ['High', 'Medium', 'Low'];
      const byConfidence: Record<string, number> = {};
      
      for (const level of confidenceLevels) {
        const { count, error } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('crm_confidence_level', level);
        if (!error && count !== null) {
          byConfidence[level] = count;
        }
      }
      
      return { total: total || 0, byStatus, byConfidence };
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

export function useCreateProspect() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (prospect: ProspectInsert) => {
      const { data, error } = await supabase
        .from('prospects')
        .insert(prospect)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      queryClient.invalidateQueries({ queryKey: ['prospect-stats'] });
      toast({ title: 'Prospect created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create prospect', description: error.message, variant: 'destructive' });
    },
  });
}

export function useImportProspectsCSV() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (csvContent: string) => {
      const { data, error } = await supabase.functions.invoke('import-prospects-csv', {
        body: { csvContent, batchSize: 500 },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data as { success: boolean; total: number; inserted: number; errors: number; message: string };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      queryClient.invalidateQueries({ queryKey: ['prospect-stats'] });
      toast({ 
        title: 'Import complete', 
        description: result.message 
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Import failed', 
        description: error.message, 
        variant: 'destructive' 
      });
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
