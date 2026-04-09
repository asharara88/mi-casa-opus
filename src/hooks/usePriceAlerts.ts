import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PortalName = 'PropertyFinder' | 'Bayut' | 'Dubizzle';
export type AlertType = 'new_listing' | 'price_drop' | 'price_increase' | 'listing_removed';

export interface PriceWatch {
  id: string;
  watch_id: string;
  name: string;
  community: string;
  city: string;
  portals: PortalName[];
  property_type: string | null;
  min_price: number | null;
  max_price: number | null;
  bedrooms: number | null;
  listing_type: string;
  is_active: boolean;
  last_checked_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceAlert {
  id: string;
  alert_id: string;
  watch_id: string;
  alert_type: AlertType;
  portal: PortalName;
  external_ref: string | null;
  title: string | null;
  current_price: number | null;
  previous_price: number | null;
  price_change_percent: number | null;
  url: string | null;
  image_url: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface PriceWatchInsert {
  name: string;
  community: string;
  city?: string;
  portals?: PortalName[];
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  listing_type?: string;
}

function generateWatchId(): string {
  return `PWC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function usePriceWatches() {
  return useQuery({
    queryKey: ['price-watches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_watches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PriceWatch[];
    },
  });
}

export function usePriceAlerts(options?: { watchId?: string; unreadOnly?: boolean }) {
  return useQuery({
    queryKey: ['price-alerts', options?.watchId, options?.unreadOnly],
    queryFn: async () => {
      let query = supabase
        .from('price_alerts')
        .select('*')
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (options?.watchId) {
        query = query.eq('watch_id', options.watchId);
      }
      if (options?.unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PriceAlert[];
    },
  });
}

export function useUnreadAlertCount() {
  return useQuery({
    queryKey: ['price-alerts-unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('price_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('is_dismissed', false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useCreatePriceWatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (watch: PriceWatchInsert) => {
      // Get current user for user_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('price_watches')
        .insert({
          ...watch,
          watch_id: generateWatchId(),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-watches'] });
      toast.success('Price watch created');
    },
    onError: (error) => {
      toast.error('Failed to create watch', { description: error.message });
    },
  });
}

export function useUpdatePriceWatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PriceWatch> }) => {
      const { data, error } = await supabase
        .from('price_watches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-watches'] });
      toast.success('Price watch updated');
    },
    onError: (error) => {
      toast.error('Failed to update watch', { description: error.message });
    },
  });
}

export function useDeletePriceWatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('price_watches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-watches'] });
      toast.success('Price watch deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete watch', { description: error.message });
    },
  });
}

export function useRunPriceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (watchId?: string) => {
      const { data, error } = await supabase.functions.invoke('price-watch-check', {
        body: { watch_id: watchId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['price-watches'] });
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['price-alerts-unread-count'] });
      toast.success(`Check complete`, { 
        description: `${data.alerts_generated} alerts generated` 
      });
    },
    onError: (error) => {
      toast.error('Price check failed', { description: error.message });
    },
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['price-alerts-unread-count'] });
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['price-alerts-unread-count'] });
      toast.success('Alert dismissed');
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['price-alerts-unread-count'] });
      toast.success('All alerts marked as read');
    },
  });
}
