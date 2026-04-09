import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  Activity,
  ActivityChannel,
  ActivityDirection,
  ActivityEntityType,
  ActivityStatus,
} from '@/types/bos';

export type CommunicationChannel = ActivityChannel;
export type MessageDirection = ActivityDirection;
export type MessageStatus = ActivityStatus;
export type CommunicationLog = Activity;

export function useCommunicationLogs(entityType: ActivityEntityType, entityId: string) {
  return useQuery({
    queryKey: ['communication_logs', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as CommunicationLog[];
    },
    enabled: !!entityId,
  });
}

export function useSendWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      to: string;
      template?: string;
      content?: string;
      variables?: Record<string, string>;
      entityType: ActivityEntityType;
      entityId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('twilio-messaging', {
        body: {
          channel: 'whatsapp',
          ...params,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.details || data.error);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['communication_logs', variables.entityType, variables.entityId] 
      });
      toast.success('WhatsApp message sent');
    },
    onError: (error) => {
      toast.error('Failed to send WhatsApp message', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });
}

export function useSendSMS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      to: string;
      template?: string;
      content?: string;
      variables?: Record<string, string>;
      entityType: ActivityEntityType;
      entityId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('twilio-messaging', {
        body: {
          channel: 'sms',
          ...params,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.details || data.error);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['communication_logs', variables.entityType, variables.entityId] 
      });
      toast.success('SMS sent');
    },
    onError: (error) => {
      toast.error('Failed to send SMS', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      to: string[];
      template: string;
      variables?: Record<string, string>;
      subject?: string;
      entityType?: ActivityEntityType;
      entityId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('sendgrid-email', {
        body: {
          type: 'transactional',
          ...params,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.details || data.error);
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.entityType && variables.entityId) {
        queryClient.invalidateQueries({ 
          queryKey: ['communication_logs', variables.entityType, variables.entityId] 
        });
      }
      toast.success('Email sent');
    },
    onError: (error) => {
      toast.error('Failed to send email', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });
}
