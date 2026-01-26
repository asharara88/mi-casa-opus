import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, Download, Loader2, FileText } from 'lucide-react';
import { 
  useVoiceMessage, 
  VOICE_OPTIONS, 
  VOICE_MESSAGE_TEMPLATES,
  type VoiceMessageTemplate 
} from '@/hooks/useElevenLabs';
import { AudioPlayer } from './AudioPlayer';
import { toast } from 'sonner';

interface ProspectVoiceMessageProps {
  prospectName: string;
  location?: string;
  className?: string;
}

export function ProspectVoiceMessage({ prospectName, location, className }: ProspectVoiceMessageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<VoiceMessageTemplate>('cold-intro');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [customText, setCustomText] = useState('');
  const [activeTab, setActiveTab] = useState<'template' | 'custom'>('template');

  const { generateSpeech, getMessageText, isLoading, audioUrl, cleanup, getTemplatesByCategory } = useVoiceMessage();

  const prospectTemplates = getTemplatesByCategory('prospect');

  const previewText = activeTab === 'template'
    ? getMessageText(selectedTemplate, { 
        clientName: prospectName, 
        location: location,
        agentName: 'your property advisor'
      })
    : customText;

  const handleGenerate = async () => {
    if (!previewText.trim()) {
      toast.error('Please enter or select a message');
      return;
    }

    cleanup();
    await generateSpeech(previewText, selectedVoice);
  };

  const handleDownload = useCallback(() => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `voice-message-${prospectName.replace(/\s+/g, '-').toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Audio downloaded');
    }
  }, [audioUrl, prospectName]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          Voice Message
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'template' | 'custom')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-3 mt-3">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select 
                value={selectedTemplate} 
                onValueChange={(v) => setSelectedTemplate(v as VoiceMessageTemplate)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {prospectTemplates.map((t) => (
                    <SelectItem key={t.key} value={t.key}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-3 mt-3">
            <div className="space-y-2">
              <Label>Custom Message</Label>
              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={`Hello ${prospectName}, this is...`}
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Voice Selection */}
        <div className="space-y-2">
          <Label>Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        {activeTab === 'template' && (
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Preview
            </Label>
            <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
              {previewText}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !previewText.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 mr-2" />
              Generate Voice Message
            </>
          )}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-2">
            <AudioPlayer 
              src={audioUrl}
              voiceName={VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name}
              showDownload={true}
              onDownload={handleDownload}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
