import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AudioPlayer } from './AudioPlayer';
import { useTextToSpeech, VOICE_OPTIONS } from '@/hooks/useElevenLabs';
import { useDemoMode } from '@/contexts/DemoContext';
import { Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ListingData {
  listing_id: string;
  property_type?: string;
  listing_type: string;
  location?: {
    community: string;
    building?: string;
    city: string;
  };
  price?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
}

interface ListingAudioTourProps {
  listingData: ListingData;
}

export function ListingAudioTour({ listingData }: ListingAudioTourProps) {
  const { isDemoMode } = useDemoMode();
  const { generateSpeech, isLoading, audioUrl, cleanup } = useTextToSpeech();
  const [selectedVoice, setSelectedVoice] = useState('EXAVITQu4vr4xnSDxMaL');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const generateNarrationScript = useCallback(async (): Promise<string> => {
    // Build listing context
    const { property_type, listing_type, location, price, currency, bedrooms, bathrooms, sqft } = listingData;
    
    const locationStr = location 
      ? `${location.community}${location.building ? `, ${location.building}` : ''}${location.city ? `, ${location.city}` : ''}`
      : 'a prime location';

    const priceStr = price 
      ? `${(price / 1000000).toFixed(1)} million ${currency || 'AED'}`
      : 'competitively priced';

    const prompt = `Generate a professional, engaging audio tour narration for this real estate listing. Keep it under 200 words, warm and inviting:

Property: ${property_type || 'Property'} for ${listing_type}
Location: ${locationStr}
Price: ${priceStr}
Bedrooms: ${bedrooms || 'N/A'}
Bathrooms: ${bathrooms || 'N/A'}
Size: ${sqft ? `${sqft.toLocaleString()} square feet` : 'N/A'}

Create a compelling narration that highlights the property's features and location benefits. Start with "Welcome to..." and end with a call to action.`;

    const { data, error } = await supabase.functions.invoke('bos-llm-ops', {
      body: {
        prompt,
        operation: 'generate_narration',
      },
    });

    if (error) throw error;
    
    return data?.result || `Welcome to this stunning ${property_type || 'property'} located in ${locationStr}. Priced at ${priceStr}, this ${bedrooms || ''} bedroom ${bathrooms ? `${bathrooms} bathroom` : ''} residence offers ${sqft ? `${sqft.toLocaleString()} square feet of` : ''} exceptional living space. Contact us today to schedule your private viewing.`;
  }, [listingData]);

  const handleGenerate = useCallback(async () => {
    if (isDemoMode) {
      toast.success('Audio tour generated (Demo Mode)');
      setGeneratedAt('Just now');
      return;
    }

    try {
      cleanup();
      setIsGeneratingScript(true);
      
      // First generate the narration script using AI
      const script = await generateNarrationScript();
      setIsGeneratingScript(false);

      // Then convert to speech
      const url = await generateSpeech(script, selectedVoice);
      
      if (url) {
        setGeneratedAt('Just now');
        toast.success('Audio tour generated successfully!');
      }
    } catch (error) {
      console.error('Audio tour generation error:', error);
      toast.error('Failed to generate audio tour');
      setIsGeneratingScript(false);
    }
  }, [isDemoMode, generateNarrationScript, generateSpeech, selectedVoice, cleanup]);

  const handleDownload = useCallback(() => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `audio-tour-${listingData.listing_id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Audio downloaded');
  }, [audioUrl, listingData.listing_id]);

  const selectedVoiceName = VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name || 'Sarah';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Audio Tour</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isLoading || isGeneratingScript}
          >
            {audioUrl ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      <AudioPlayer
        src={audioUrl}
        isLoading={isLoading || isGeneratingScript}
        onDownload={handleDownload}
        voiceName={selectedVoiceName}
        generatedAt={generatedAt || undefined}
      />

      {!audioUrl && !isLoading && !isGeneratingScript && (
        <p className="text-xs text-muted-foreground">
          Generate a professional audio narration of this listing for virtual tours and marketing.
        </p>
      )}
    </div>
  );
}
