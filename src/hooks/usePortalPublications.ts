import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PortalName = 'PropertyFinder' | 'Bayut' | 'Dubizzle';
export type PortalStatus = 'pending' | 'published' | 'paused' | 'removed' | 'error';

export interface PortalPublication {
  id: string;
  listing_id: string;
  portal: PortalName;
  status: PortalStatus;
  external_ref: string | null;
  published_at: string | null;
  last_synced_at: string | null;
  portal_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortalPublicationInsert {
  listing_id: string;
  portal: PortalName;
  status?: PortalStatus;
  external_ref?: string;
  portal_url?: string;
}

export interface PortalPublicationUpdate {
  status?: PortalStatus;
  external_ref?: string;
  portal_url?: string;
  error_message?: string;
  last_synced_at?: string;
  published_at?: string;
}

export function usePortalPublications(listingId: string | null) {
  return useQuery({
    queryKey: ['portal-publications', listingId],
    queryFn: async () => {
      if (!listingId) return [];
      const { data, error } = await supabase
        .from('portal_publications')
        .select('*')
        .eq('listing_id', listingId)
        .order('portal');

      if (error) throw error;
      return data as PortalPublication[];
    },
    enabled: !!listingId,
  });
}

export function useTogglePortalPublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      listingId, 
      portal, 
      enabled 
    }: { 
      listingId: string; 
      portal: PortalName; 
      enabled: boolean;
    }) => {
      if (enabled) {
        // Create or update publication to pending
        const { data: existing } = await supabase
          .from('portal_publications')
          .select('id')
          .eq('listing_id', listingId)
          .eq('portal', portal)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('portal_publications')
            .update({ status: 'pending' as PortalStatus })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('portal_publications')
            .insert({ 
              listing_id: listingId, 
              portal, 
              status: 'pending' as PortalStatus 
            });
          if (error) throw error;
        }
      } else {
        // Set to removed
        const { error } = await supabase
          .from('portal_publications')
          .update({ status: 'removed' as PortalStatus })
          .eq('listing_id', listingId)
          .eq('portal', portal);
        if (error) throw error;
      }
    },
    onSuccess: (_, { portal, enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['portal-publications'] });
      toast.success(
        enabled 
          ? `${portal} publication queued` 
          : `${portal} publication removed`
      );
    },
    onError: (error) => {
      toast.error('Failed to update portal', { description: error.message });
    },
  });
}

export function useSyncPortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      listingId, 
      portal 
    }: { 
      listingId: string; 
      portal?: PortalName;
    }) => {
      // Call the edge function to sync
      const { data, error } = await supabase.functions.invoke('portal-status-sync', {
        body: { listing_id: listingId, portal }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { portal }) => {
      queryClient.invalidateQueries({ queryKey: ['portal-publications'] });
      toast.success(portal ? `${portal} synced` : 'All portals synced');
    },
    onError: (error) => {
      toast.error('Sync failed', { description: error.message });
    },
  });
}

export function useUpdatePortalPublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: PortalPublicationUpdate;
    }) => {
      const { data, error } = await supabase
        .from('portal_publications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-publications'] });
    },
    onError: (error) => {
      toast.error('Failed to update publication', { description: error.message });
    },
  });
}
