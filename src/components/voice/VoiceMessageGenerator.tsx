import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioPlayer } from './AudioPlayer';
import { useVoiceMessage, VOICE_OPTIONS, VOICE_MESSAGE_TEMPLATES, VoiceMessageTemplate } from '@/hooks/useElevenLabs';
import { useDemoMode } from '@/contexts/DemoContext';
import { Volume2, Sparkles, Download, MessageSquare, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceMessageGeneratorProps {
  clientName: string;
  agentName?: string;
  propertyDetails?: string;
  onClose?: () => void;
}

export function VoiceMessageGenerator({
  clientName,
  agentName = 'Sarah',
  propertyDetails,
  onClose,
}: VoiceMessageGeneratorProps) {
  const { isDemoMode } = useDemoMode();
  const { generateMessage, generateSpeech, getMessageText, isLoading, audioUrl, cleanup } = useVoiceMessage();
  
  const [selectedTemplate, setSelectedTemplate] = useState<VoiceMessageTemplate>('follow-up');
  const [selectedVoice, setSelectedVoice] = useState('EXAVITQu4vr4xnSDxMaL');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customText, setCustomText] = useState('');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const messageParams = { clientName, agentName, propertyDetails };
  const currentText = isCustomizing ? customText : getMessageText(selectedTemplate, messageParams);

  const handleTemplateChange = useCallback((template: VoiceMessageTemplate) => {
    setSelectedTemplate(template);
    if (!isCustomizing) {
      setCustomText(getMessageText(template, messageParams));
    }
  }, [isCustomizing, getMessageText, messageParams]);

  const handleGenerate = useCallback(async () => {
    if (isDemoMode) {
      toast.success('Voice message generated (Demo Mode)');
      setGeneratedAt('Just now');
      return;
    }

    try {
      cleanup();
      
      const textToGenerate = isCustomizing ? customText : getMessageText(selectedTemplate, messageParams);
      
      // For custom text, use generateSpeech directly; for templates, use generateMessage
      const url = isCustomizing 
        ? await generateSpeech(textToGenerate, selectedVoice)
        : await generateMessage(selectedTemplate, messageParams, selectedVoice);
      
      if (url) {
        setGeneratedAt('Just now');
        toast.success('Voice message generated!');
      }
    } catch (error) {
      console.error('Voice message error:', error);
      toast.error('Failed to generate voice message');
    }
  }, [isDemoMode, isCustomizing, customText, selectedTemplate, selectedVoice, messageParams, generateMessage, generateSpeech, cleanup]);

  const handleDownload = useCallback(() => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice-message-${clientName.replace(/\s+/g, '-').toLowerCase()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Voice message downloaded');
  }, [audioUrl, clientName]);

  const toggleCustomize = useCallback(() => {
    if (!isCustomizing) {
      setCustomText(currentText);
    }
    setIsCustomizing(!isCustomizing);
  }, [isCustomizing, currentText]);

  const selectedVoiceName = VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name || 'Sarah';

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Voice Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template & Voice Selection */}
        <div className="flex gap-2">
          <Select value={selectedTemplate} onValueChange={(v) => handleTemplateChange(v as VoiceMessageTemplate)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VOICE_MESSAGE_TEMPLATES).map(([key, { name }]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message Preview/Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Message Preview</span>
            <Button variant="ghost" size="sm" onClick={toggleCustomize}>
              <Edit2 className="h-3 w-3 mr-1" />
              {isCustomizing ? 'Use Template' : 'Customize'}
            </Button>
          </div>
          
          {isCustomizing ? (
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={4}
              placeholder="Enter your custom message..."
              className="text-sm"
            />
          ) : (
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              "{currentText}"
            </div>
          )}
        </div>

        {/* Audio Player */}
        <AudioPlayer
          src={audioUrl}
          isLoading={isLoading}
          onDownload={handleDownload}
          voiceName={selectedVoiceName}
          generatedAt={generatedAt || undefined}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || (!isCustomizing && !currentText)}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {audioUrl ? 'Regenerate' : 'Generate Voice Message'}
          </Button>
          
          {audioUrl && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
