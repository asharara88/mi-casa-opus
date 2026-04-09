import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Loader2, Copy, Check } from 'lucide-react';
import { useScribeToken } from '@/hooks/useElevenLabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LiveCallNotesProps {
  onTranscriptChange?: (transcript: string) => void;
  className?: string;
}

export function LiveCallNotes({ onTranscriptChange, className }: LiveCallNotesProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { getToken, isLoading: isLoadingToken } = useScribeToken();
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Get token
      const token = await getToken();
      if (!token) {
        toast.error('Failed to get transcription token');
        return;
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      streamRef.current = stream;

      // Connect to ElevenLabs Scribe WebSocket
      const ws = new WebSocket(
        `wss://api.elevenlabs.io/v1/speech-to-text/stream?model_id=scribe_v1&token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Scribe WebSocket connected');
        setIsRecording(true);

        // Start recording
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            const arrayBuffer = await event.data.arrayBuffer();
            ws.send(arrayBuffer);
          }
        };

        mediaRecorder.start(250); // Send chunks every 250ms
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.text) {
            if (data.is_final) {
              setTranscript(prev => {
                const newTranscript = prev + (prev ? ' ' : '') + data.text;
                onTranscriptChange?.(newTranscript);
                return newTranscript;
              });
              setPartialTranscript('');
            } else {
              setPartialTranscript(data.text);
            }
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Scribe WebSocket error:', error);
        toast.error('Transcription error');
        stopRecording();
      };

      ws.onclose = () => {
        console.log('Scribe WebSocket closed');
        setIsRecording(false);
      };

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to access microphone');
    }
  }, [getToken, onTranscriptChange]);

  const stopRecording = useCallback(() => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsRecording(false);
    setPartialTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const handleCopy = useCallback(() => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      toast.success('Transcript copied');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [transcript]);

  const handleClear = useCallback(() => {
    setTranscript('');
    setPartialTranscript('');
    onTranscriptChange?.('');
  }, [onTranscriptChange]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Live Call Notes
          </CardTitle>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              Recording
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Controls */}
        <div className="flex gap-2">
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              disabled={isLoadingToken}
              className="flex-1"
              variant="default"
            >
              {isLoadingToken ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mic className="h-4 w-4 mr-2" />
              )}
              Start Recording
            </Button>
          ) : (
            <Button 
              onClick={stopRecording}
              className="flex-1"
              variant="destructive"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
          
          {transcript && (
            <>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>

        {/* Transcript Display */}
        <div className="space-y-2">
          <Textarea
            value={transcript + (partialTranscript ? ` ${partialTranscript}` : '')}
            onChange={(e) => {
              setTranscript(e.target.value);
              onTranscriptChange?.(e.target.value);
            }}
            placeholder="Start recording to capture call notes..."
            rows={6}
            className={cn(
              'resize-none',
              isRecording && 'border-destructive'
            )}
          />
          
          {partialTranscript && (
            <p className="text-xs text-muted-foreground">
              Listening: <span className="italic">{partialTranscript}</span>
            </p>
          )}
        </div>

        {transcript && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear}
            className="w-full text-muted-foreground"
          >
            Clear Notes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
