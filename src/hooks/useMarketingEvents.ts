import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MarketingEvent, EventType, EventStatus } from '@/types/marketing';

interface EventInsert {
  name: string;
  type: EventType;
  event_date: string;
  venue?: string;
  location?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  budget?: number;
  expected_attendees?: number;
  status?: EventStatus;
  notes?: string;
  organizer?: string;
  contact_email?: string;
  contact_phone?: string;
}

export function useMarketingEvents() {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['marketing-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return (data || []) as unknown as MarketingEvent[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (event: EventInsert) => {
      const eventId = `EVT-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('marketing_events')
        .insert({
          ...event,
          event_id: eventId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-events'] });
      toast.success('Event created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketingEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('marketing_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-events'] });
      toast.success('Event updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketing_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-events'] });
      toast.success('Event deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });

  // Get upcoming events (next 30 days)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= thirtyDaysFromNow && event.status !== 'Cancelled';
  });

  return {
    events,
    upcomingEvents,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
