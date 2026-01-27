import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ViewingStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

export interface ViewingBooking {
  id: string;
  cal_booking_id: string | null;
  deal_id: string | null;
  prospect_id: string | null;
  listing_id: string | null;
  agent_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: ViewingStatus;
  location: string | null;
  notes: string | null;
  reminder_sent: boolean;
  confirmation_sent: boolean;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  cancelled_reason: string | null;
}

export function useViewingBookings(filters?: {
  dealId?: string;
  prospectId?: string;
  listingId?: string;
  status?: ViewingStatus;
}) {
  return useQuery({
    queryKey: ['viewing_bookings', filters],
    queryFn: async () => {
      let query = supabase
        .from('viewing_bookings')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (filters?.dealId) {
        query = query.eq('deal_id', filters.dealId);
      }
      if (filters?.prospectId) {
        query = query.eq('prospect_id', filters.prospectId);
      }
      if (filters?.listingId) {
        query = query.eq('listing_id', filters.listingId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as ViewingBooking[];
    },
  });
}

export function useUpcomingViewings() {
  return useQuery({
    queryKey: ['viewing_bookings', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viewing_bookings')
        .select('*')
        .gte('scheduled_at', new Date().toISOString())
        .in('status', ['scheduled', 'confirmed', 'rescheduled'])
        .order('scheduled_at', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data as unknown as ViewingBooking[];
    },
  });
}

export function useCreateViewingBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Omit<ViewingBooking, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('viewing_bookings')
        .insert(booking)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewing_bookings'] });
      toast.success('Viewing scheduled');
    },
    onError: (error) => {
      toast.error('Failed to schedule viewing', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });
}

export function useUpdateViewingBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<ViewingBooking>;
    }) => {
      const { data, error } = await supabase
        .from('viewing_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewing_bookings'] });
      toast.success('Viewing updated');
    },
    onError: (error) => {
      toast.error('Failed to update viewing', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });
}

export function useCancelViewingBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('viewing_bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_reason: reason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewing_bookings'] });
      toast.success('Viewing cancelled');
    },
    onError: (error) => {
      toast.error('Failed to cancel viewing', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });
}
