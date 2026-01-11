import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type EventLogEntry = Tables<'event_log_entries'>;
export type EventLogInsert = TablesInsert<'event_log_entries'>;

export function useEventLog() {
  return useQuery({
    queryKey: ['event_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_log_entries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as EventLogEntry[];
    },
  });
}

export function useEventLogByEntity(entityType: string | null, entityId: string | null) {
  return useQuery({
    queryKey: ['event_log', entityType, entityId],
    queryFn: async () => {
      if (!entityType || !entityId) return [];
      const { data, error } = await supabase
        .from('event_log_entries')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data as EventLogEntry[];
    },
    enabled: !!entityType && !!entityId,
  });
}

export function useCreateEventLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: EventLogInsert) => {
      const { data, error } = await supabase
        .from('event_log_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_log'] });
    },
    onError: (error) => {
      console.error('Failed to log event', error);
    },
  });
}
