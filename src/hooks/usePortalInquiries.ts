import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type PortalInquiry = Tables<'portal_inquiries'>;
type PortalName = 'PropertyFinder' | 'Bayut' | 'Dubizzle';

export function usePortalInquiries(options?: { 
  portal?: PortalName;
  unprocessedOnly?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['portal-inquiries', options],
    queryFn: async () => {
      let query = supabase
        .from('portal_inquiries')
        .select(`
          *,
          listing:listings(id, listing_id, listing_attributes),
          lead:leads(id, lead_id, contact_name, lead_state)
        `)
        .order('received_at', { ascending: false });

      if (options?.portal) {
        query = query.eq('portal', options.portal as PortalName);
      }

      if (options?.unprocessedOnly) {
        query = query.is('processed_at', null);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function usePortalInquiryStats() {
  return useQuery({
    queryKey: ['portal-inquiry-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portal_inquiries')
        .select('portal, processed_at, received_at');

      if (error) throw error;

      const stats = {
        total: data.length,
        unprocessed: data.filter(i => !i.processed_at).length,
        byPortal: {} as Record<string, { total: number; unprocessed: number }>,
        last24h: data.filter(i => 
          new Date(i.received_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length,
      };

      for (const inquiry of data) {
        if (!stats.byPortal[inquiry.portal]) {
          stats.byPortal[inquiry.portal] = { total: 0, unprocessed: 0 };
        }
        stats.byPortal[inquiry.portal].total++;
        if (!inquiry.processed_at) {
          stats.byPortal[inquiry.portal].unprocessed++;
        }
      }

      return stats;
    },
  });
}

export function useProcessInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId, leadId }: { inquiryId: string; leadId: string }) => {
      const { data, error } = await supabase
        .from('portal_inquiries')
        .update({
          lead_id: leadId,
          processed_at: new Date().toISOString(),
        })
        .eq('id', inquiryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['portal-inquiry-stats'] });
      toast.success('Inquiry processed successfully');
    },
    onError: (error) => {
      toast.error('Failed to process inquiry', { description: error.message });
    },
  });
}

export function useTestPortalWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      portal: 'PropertyFinder' | 'Bayut' | 'Dubizzle';
      name: string;
      email?: string;
      phone?: string;
      message?: string;
      listing_ref?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('portal-lead-sync', {
        body: payload,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portal-inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['portal-inquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`Lead ${data.lead_id} created from ${data.portal} inquiry`);
    },
    onError: (error) => {
      toast.error('Failed to process webhook', { description: error.message });
    },
  });
}
