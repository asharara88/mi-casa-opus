import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Professional female voice' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Professional male voice' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'British accent, premium feel' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Warm and friendly' },
];

export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export function useTextToSpeech() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateSpeech = useCallback(async (
    text: string,
    voiceId: string = 'EXAVITQu4vr4xnSDxMaL',
    voiceSettings?: VoiceSettings
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voiceId, voiceSettings }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('TTS error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  return {
    generateSpeech,
    isLoading,
    error,
    audioUrl,
    cleanup,
  };
}

export function useScribeToken() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('elevenlabs-scribe-token');

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.token) {
        throw new Error('No token received');
      }

      return data.token;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Scribe token error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getToken,
    isLoading,
    error,
  };
}

// Voice message templates
export type VoiceMessageTemplate = 'follow-up' | 'introduction' | 'scheduling' | 'thank-you';

export const VOICE_MESSAGE_TEMPLATES: Record<VoiceMessageTemplate, {
  name: string;
  template: (params: { clientName: string; agentName?: string; propertyDetails?: string }) => string;
}> = {
  'follow-up': {
    name: 'Follow-up Call',
    template: ({ clientName, agentName = 'your agent', propertyDetails }) =>
      `Hello ${clientName}, this is ${agentName} from MiCasa Real Estate calling to follow up on our recent conversation${propertyDetails ? ` about ${propertyDetails}` : ''}. I wanted to check in and see if you have any questions or if you'd like to schedule a viewing. Please feel free to call me back at your convenience. Have a wonderful day!`,
  },
  'introduction': {
    name: 'Introduction',
    template: ({ clientName, agentName = 'your dedicated agent' }) =>
      `Hello ${clientName}, I'm ${agentName} from MiCasa Real Estate. I'm reaching out because we received your inquiry and I'm excited to help you find your perfect property. I have several options that might interest you based on your preferences. I'd love to schedule a call at your convenience to discuss your requirements in detail. Looking forward to speaking with you soon!`,
  },
  'scheduling': {
    name: 'Schedule Viewing',
    template: ({ clientName, propertyDetails, agentName = 'your agent' }) =>
      `Hi ${clientName}, this is ${agentName} from MiCasa. I'm calling to schedule a viewing${propertyDetails ? ` for the ${propertyDetails}` : ''} you expressed interest in. I have availability this week and would love to show you the property in person. Please let me know your preferred time and I'll arrange everything. Talk to you soon!`,
  },
  'thank-you': {
    name: 'Thank You',
    template: ({ clientName, agentName = 'your agent' }) =>
      `Hello ${clientName}, this is ${agentName} from MiCasa Real Estate. I wanted to personally thank you for choosing us for your property search. It was a pleasure working with you. If you ever need assistance with real estate in the future, please don't hesitate to reach out. Wishing you all the best in your new home!`,
  },
};

export function useVoiceMessage() {
  const tts = useTextToSpeech();

  const generateMessage = useCallback(async (
    template: VoiceMessageTemplate,
    params: { clientName: string; agentName?: string; propertyDetails?: string },
    voiceId?: string
  ) => {
    const templateConfig = VOICE_MESSAGE_TEMPLATES[template];
    if (!templateConfig) {
      throw new Error('Invalid template');
    }

    const text = templateConfig.template(params);
    return tts.generateSpeech(text, voiceId);
  }, [tts]);

  return {
    generateMessage,
    getMessageText: (template: VoiceMessageTemplate, params: { clientName: string; agentName?: string; propertyDetails?: string }) => {
      const templateConfig = VOICE_MESSAGE_TEMPLATES[template];
      return templateConfig?.template(params) || '';
    },
    ...tts,
  };
}
