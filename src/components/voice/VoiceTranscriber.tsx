import { useState, useCallback } from 'react';
import { useScribe, CommitStrategy } from '@elevenlabs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useScribeToken } from '@/hooks/useElevenLabs';
import { useDemoMode } from '@/contexts/DemoContext';
import { Mic, MicOff, Save, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceTranscriberProps {
  onSave?: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function VoiceTranscriber({ onSave, placeholder = 'Your transcribed notes will appear here...', className }: VoiceTranscriberProps) {
  const { isDemoMode } = useDemoMode();
  const { getToken, isLoading: isLoadingToken } = useScribeToken();
  const [transcript, setTranscript] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Demo mode simulation state
  const [demoRecording, setDemoRecording] = useState(false);

  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    commitStrategy: 'vad' as CommitStrategy,
    onPartialTranscript: (data: { text: string }) => {
      // Show partial results in real-time
    },
    onCommittedTranscript: (data: { text: string }) => {
      setTranscript(prev => prev + (prev ? ' ' : '') + data.text);
    },
  });

  const handleStartRecording = useCallback(async () => {
    if (isDemoMode) {
      setDemoRecording(true);
      // Simulate transcription in demo mode
      const demoTexts = [
        'Client mentioned they prefer a sea view',
        'and are flexible on the move-in date.',
        'Budget confirmed at 2.5 million AED.',
      ];
      let index = 0;
      const interval = setInterval(() => {
        if (index < demoTexts.length) {
          setTranscript(prev => prev + (prev ? ' ' : '') + demoTexts[index]);
          index++;
        } else {
          clearInterval(interval);
          setDemoRecording(false);
          toast.success('Transcription complete (Demo)');
        }
      }, 1500);
      return;
    }

    try {
      setIsConnecting(true);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const token = await getToken();
      if (!token) {
        throw new Error('Failed to get transcription token');
      }

      // Connect to scribe
      await scribe.connect({
        token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      toast.success('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    } finally {
      setIsConnecting(false);
    }
  }, [isDemoMode, getToken, scribe]);

  const handleStopRecording = useCallback(() => {
    if (isDemoMode) {
      setDemoRecording(false);
      return;
    }

    scribe.disconnect();
    toast.success('Recording stopped');
  }, [isDemoMode, scribe]);

  const handleSave = useCallback(() => {
    if (transcript.trim() && onSave) {
      onSave(transcript.trim());
      toast.success('Notes saved');
    }
  }, [transcript, onSave]);

  const handleClear = useCallback(() => {
    setTranscript('');
  }, []);

  const isRecording = isDemoMode ? demoRecording : scribe.isConnected;
  const showPartial = scribe.partialTranscript && isRecording;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          Voice Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          {isRecording ? (
            <Button
              variant="destructive"
              onClick={handleStopRecording}
              className="flex-1"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          ) : (
            <Button
              onClick={handleStartRecording}
              disabled={isConnecting || isLoadingToken}
              className="flex-1"
            >
              {isConnecting || isLoadingToken ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mic className="h-4 w-4 mr-2" />
              )}
              {isConnecting ? 'Connecting...' : 'Start Recording'}
            </Button>
          )}

          {transcript && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleClear}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {onSave && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            Recording... Speak clearly into your microphone
          </div>
        )}

        {/* Transcript Display */}
        <div className="space-y-2">
          <Textarea
            value={transcript + (showPartial ? ` ${scribe.partialTranscript}` : '')}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className={cn(
              'resize-none',
              showPartial && 'italic'
            )}
          />
          
          {transcript && (
            <p className="text-xs text-muted-foreground">
              {transcript.split(' ').length} words • You can edit the text above
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
