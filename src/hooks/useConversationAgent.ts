import { useState, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProspectContext {
  prospectId: string;
  prospectName: string;
  phone?: string;
  email?: string;
  propertyInterests?: string[];
  budgetRange?: string;
  previousInteractions?: number;
}

export interface ConversationMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export interface CapturedRequirements {
  propertyType?: string;
  bedrooms?: number;
  location?: string;
  budget?: string;
  timeline?: string;
  notes?: string;
}

interface UseConversationAgentOptions {
  agentId: string;
  onProspectStatusUpdate?: (status: string) => void;
  onScheduleCallback?: (date: Date, notes: string) => void;
  onCaptureRequirements?: (requirements: CapturedRequirements) => void;
  onRequestHumanTransfer?: () => void;
}

export function useConversationAgent({
  agentId,
  onProspectStatusUpdate,
  onScheduleCallback,
  onCaptureRequirements,
  onRequestHumanTransfer,
}: UseConversationAgentOptions) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentProspect, setCurrentProspect] = useState<ProspectContext | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const callStartRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      callStartRef.current = new Date();
      durationIntervalRef.current = setInterval(() => {
        if (callStartRef.current) {
          setCallDuration(Math.floor((Date.now() - callStartRef.current.getTime()) / 1000));
        }
      }, 1000);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      callStartRef.current = null;
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      
      // Handle different message types from ElevenLabs
      const messageAny = message as any;
      
      if (messageAny.user_transcription_event?.user_transcript) {
        setMessages(prev => [...prev, {
          role: 'user',
          text: messageAny.user_transcription_event.user_transcript,
          timestamp: new Date(),
        }]);
      } else if (messageAny.agent_response_event?.agent_response) {
        setMessages(prev => [...prev, {
          role: 'agent',
          text: messageAny.agent_response_event.agent_response,
          timestamp: new Date(),
        }]);
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      toast.error('Voice agent error. Please try again.');
    },
    clientTools: {
      updateProspectStatus: (params: { status: string }) => {
        console.log('Client tool: updateProspectStatus', params);
        onProspectStatusUpdate?.(params.status);
        toast.success(`Prospect status updated to: ${params.status}`);
        return `Status updated to ${params.status}`;
      },
      scheduleCallback: (params: { date: string; notes: string }) => {
        console.log('Client tool: scheduleCallback', params);
        const callbackDate = new Date(params.date);
        onScheduleCallback?.(callbackDate, params.notes);
        toast.success(`Callback scheduled for ${callbackDate.toLocaleDateString()}`);
        return `Callback scheduled for ${params.date}`;
      },
      captureRequirements: (params: CapturedRequirements) => {
        console.log('Client tool: captureRequirements', params);
        onCaptureRequirements?.(params);
        toast.success('Property requirements captured');
        return 'Requirements saved';
      },
      requestHumanTransfer: () => {
        console.log('Client tool: requestHumanTransfer');
        onRequestHumanTransfer?.();
        toast.info('Human transfer requested');
        return 'Transfer requested';
      },
    },
  });

  const startCall = useCallback(async (prospect: ProspectContext) => {
    setIsConnecting(true);
    setMessages([]);
    setCallDuration(0);
    setCurrentProspect(prospect);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token', {
        body: {
          agentId,
          prospectContext: {
            prospectName: prospect.prospectName,
            phone: prospect.phone,
            email: prospect.email,
            propertyInterests: prospect.propertyInterests,
            budgetRange: prospect.budgetRange,
            previousInteractions: prospect.previousInteractions,
          },
        },
      });

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'Failed to get conversation token');
      }

      // Start the conversation with WebSocket
      await conversation.startSession({
        signedUrl: data.signedUrl,
      });

      toast.success('Call connected');
    } catch (err) {
      console.error('Failed to start call:', err);
      toast.error('Failed to start call. Please check microphone permissions.');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, conversation]);

  const endCall = useCallback(async () => {
    await conversation.endSession();
    setCurrentProspect(null);
    toast.info('Call ended');
  }, [conversation]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
    status: conversation.status,
    isConnecting,
    isSpeaking: conversation.isSpeaking,
    messages,
    currentProspect,
    callDuration,
    formattedDuration: formatDuration(callDuration),
    
    // Actions
    startCall,
    endCall,
    
    // Audio controls
    setVolume: conversation.setVolume,
    getInputVolume: conversation.getInputVolume,
    getOutputVolume: conversation.getOutputVolume,
  };
}
