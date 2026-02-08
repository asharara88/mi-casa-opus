import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSendWhatsApp, useSendSMS, useSendEmail, useCommunicationLogs } from './useCommunications';
import type { ActivityEntityType } from '@/types/bos';

export type FollowUpType = 
  | 'viewing_followup' 
  | 'general_checkin' 
  | 'document_reminder' 
  | 'offer_followup' 
  | 'hot_lead_reengagement'
  | 'deal_milestone';

export type FollowUpChannel = 'whatsapp' | 'sms' | 'email';

export interface FollowUpEntity {
  type: 'prospect' | 'lead' | 'deal';
  id: string;
  dbId: string;
  name: string;
  phone?: string;
  email?: string;
  data: Record<string, unknown>;
}

export interface GeneratedFollowUp {
  subject?: string;
  message: string;
  tone: string;
  urgency: 'low' | 'medium' | 'high';
  suggested_timing: string;
  personalization_elements: string[];
}

interface GenerateFollowUpParams {
  entity: FollowUpEntity;
  channel: FollowUpChannel;
  followUpType: FollowUpType;
  agentNotes?: string;
}

export function useFollowUpComposer() {
  const queryClient = useQueryClient();
  const sendWhatsApp = useSendWhatsApp();
  const sendSMS = useSendSMS();
  const sendEmail = useSendEmail();
  
  const [isOpen, setIsOpen] = useState(false);
  const [entity, setEntity] = useState<FollowUpEntity | null>(null);
  const [channel, setChannel] = useState<FollowUpChannel>('whatsapp');
  const [followUpType, setFollowUpType] = useState<FollowUpType>('general_checkin');
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedFollowUp | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [editedSubject, setEditedSubject] = useState('');

  // Fetch communication history for context
  const { data: communicationHistory } = useCommunicationLogs(
    entity?.type as ActivityEntityType || 'lead',
    entity?.dbId || ''
  );

  const generateMutation = useMutation({
    mutationFn: async (params: GenerateFollowUpParams) => {
      const { data, error } = await supabase.functions.invoke('bos-llm-followup', {
        body: {
          entityType: params.entity.type,
          entityData: params.entity.data,
          communicationHistory: communicationHistory?.slice(0, 5).map(log => ({
            channel: log.channel,
            content: log.content,
            direction: log.direction,
            created_at: log.created_at,
          })),
          channel: params.channel,
          followUpType: params.followUpType,
          agentNotes: params.agentNotes,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data as GeneratedFollowUp;
    },
    onSuccess: (data) => {
      setGeneratedMessage(data);
      setEditedMessage(data.message);
      setEditedSubject(data.subject || '');
      toast.success('Follow-up message generated');
    },
    onError: (error) => {
      console.error('Generate follow-up error:', error);
      toast.error('Failed to generate follow-up', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!entity) throw new Error('No entity selected');
      
      const entityType = entity.type as ActivityEntityType;
      
      if (channel === 'whatsapp') {
        if (!entity.phone) throw new Error('No phone number available');
        await sendWhatsApp.mutateAsync({
          to: entity.phone,
          content: editedMessage,
          entityType,
          entityId: entity.dbId,
        });
      } else if (channel === 'sms') {
        if (!entity.phone) throw new Error('No phone number available');
        await sendSMS.mutateAsync({
          to: entity.phone,
          content: editedMessage,
          entityType,
          entityId: entity.dbId,
        });
      } else if (channel === 'email') {
        if (!entity.email) throw new Error('No email address available');
        await sendEmail.mutateAsync({
          to: [entity.email],
          template: 'follow_up',
          subject: editedSubject || 'Following up on your property search',
          variables: {
            message: editedMessage,
            recipient_name: entity.name,
          },
          entityType,
          entityId: entity.dbId,
        });
      }
    },
    onSuccess: () => {
      toast.success(`${channel === 'email' ? 'Email' : channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} sent successfully`);
      queryClient.invalidateQueries({ queryKey: ['communication_logs', entity?.type, entity?.dbId] });
      handleClose();
    },
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const openComposer = useCallback((entityData: FollowUpEntity, defaultType?: FollowUpType) => {
    setEntity(entityData);
    setFollowUpType(defaultType || inferFollowUpType(entityData));
    setChannel(entityData.phone ? 'whatsapp' : entityData.email ? 'email' : 'whatsapp');
    setGeneratedMessage(null);
    setEditedMessage('');
    setEditedSubject('');
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setEntity(null);
    setGeneratedMessage(null);
    setEditedMessage('');
    setEditedSubject('');
  }, []);

  const handleGenerate = useCallback((agentNotes?: string) => {
    if (!entity) return;
    
    generateMutation.mutate({
      entity,
      channel,
      followUpType,
      agentNotes,
    });
  }, [entity, channel, followUpType, generateMutation]);

  const handleSend = useCallback(() => {
    sendMutation.mutate();
  }, [sendMutation]);

  return {
    // State
    isOpen,
    entity,
    channel,
    followUpType,
    generatedMessage,
    editedMessage,
    editedSubject,
    isGenerating: generateMutation.isPending,
    isSending: sendMutation.isPending,
    
    // Actions
    openComposer,
    handleClose,
    setChannel,
    setFollowUpType,
    setEditedMessage,
    setEditedSubject,
    handleGenerate,
    handleSend,
  };
}

// Infer follow-up type based on entity state
function inferFollowUpType(entity: FollowUpEntity): FollowUpType {
  const data = entity.data;
  
  if (entity.type === 'deal') {
    const dealState = data.deal_state as string;
    if (['Viewing', 'Offer'].includes(dealState)) {
      return 'viewing_followup';
    }
    if (dealState === 'Negotiation') {
      return 'offer_followup';
    }
    return 'deal_milestone';
  }
  
  if (entity.type === 'lead') {
    const leadState = data.lead_state as string;
    if (leadState === 'HighIntent') {
      return 'hot_lead_reengagement';
    }
    if (leadState === 'Interested') {
      return 'viewing_followup';
    }
    return 'general_checkin';
  }
  
  // Prospect default
  return 'general_checkin';
}

// Helper to format follow-up type for display
export function formatFollowUpType(type: FollowUpType): string {
  const labels: Record<FollowUpType, string> = {
    viewing_followup: 'Viewing Follow-up',
    general_checkin: 'General Check-in',
    document_reminder: 'Document Reminder',
    offer_followup: 'Offer Follow-up',
    hot_lead_reengagement: 'Hot Lead Re-engagement',
    deal_milestone: 'Deal Milestone',
  };
  return labels[type];
}
