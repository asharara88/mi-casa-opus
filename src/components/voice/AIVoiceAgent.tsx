import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, 
  Bot, User, Loader2, AlertCircle 
} from 'lucide-react';
import { useConversationAgent, type ProspectContext, type CapturedRequirements } from '@/hooks/useConversationAgent';
import { cn } from '@/lib/utils';

interface AIVoiceAgentProps {
  prospect: ProspectContext;
  agentId: string;
  onStatusUpdate?: (status: string) => void;
  onScheduleCallback?: (date: Date, notes: string) => void;
  onCaptureRequirements?: (requirements: CapturedRequirements) => void;
  onCallEnd?: () => void;
  className?: string;
}

export function AIVoiceAgent({
  prospect,
  agentId,
  onStatusUpdate,
  onScheduleCallback,
  onCaptureRequirements,
  onCallEnd,
  className,
}: AIVoiceAgentProps) {
  const [volume, setVolume] = useState(80);
  const [showTranscript, setShowTranscript] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    status,
    isConnecting,
    isSpeaking,
    messages,
    formattedDuration,
    startCall,
    endCall,
    setVolume: setAgentVolume,
  } = useConversationAgent({
    agentId,
    onProspectStatusUpdate: onStatusUpdate,
    onScheduleCallback,
    onCaptureRequirements,
    onRequestHumanTransfer: () => {
      // Handle human transfer - could trigger a notification
      console.log('Human transfer requested for prospect:', prospect.prospectName);
    },
  });

  const isConnected = status === 'connected';

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Volume control
  useEffect(() => {
    setAgentVolume({ volume: volume / 100 });
  }, [volume, setAgentVolume]);

  const handleStartCall = async () => {
    try {
      await startCall(prospect);
    } catch {
      // Error handled in hook
    }
  };

  const handleEndCall = async () => {
    await endCall();
    onCallEnd?.();
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Voice Agent
          </CardTitle>
          <Badge 
            variant={isConnected ? 'default' : 'secondary'}
            className={cn(
              isConnected && 'bg-emerald-500 hover:bg-emerald-600',
              isConnecting && 'bg-amber-500'
            )}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Live' : 'Ready'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {prospect.prospectName} • {prospect.phone || 'No phone'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Call Controls */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <Button 
              onClick={handleStartCall} 
              disabled={isConnecting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Start AI Call
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleEndCall}
                variant="destructive"
                className="flex-1"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
              <Badge variant="outline" className="px-3 py-2 font-mono">
                {formattedDuration}
              </Badge>
            </>
          )}
        </div>

        {/* Status Indicators */}
        {isConnected && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-3 h-3 rounded-full',
                isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
              )} />
              <span className="text-sm">
                {isSpeaking ? 'Agent Speaking' : 'Listening'}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={100}
                step={1}
                className="w-24"
              />
            </div>
          </div>
        )}

        {/* Transcript */}
        {showTranscript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Live Transcript</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTranscript(false)}
              >
                Hide
              </Button>
            </div>
            <ScrollArea className="h-48 rounded-md border p-3" ref={scrollRef}>
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {isConnected 
                    ? 'Waiting for conversation...' 
                    : 'Start a call to see the transcript'}
                </p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        'flex gap-2',
                        msg.role === 'agent' ? 'flex-row' : 'flex-row-reverse'
                      )}
                    >
                      <div className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                        msg.role === 'agent' ? 'bg-primary/20' : 'bg-muted'
                      )}>
                        {msg.role === 'agent' ? (
                          <Bot className="w-3 h-3 text-primary" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                      </div>
                      <div className={cn(
                        'flex-1 p-2 rounded-lg text-sm',
                        msg.role === 'agent' 
                          ? 'bg-primary/10 text-primary-foreground' 
                          : 'bg-muted'
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {!showTranscript && messages.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTranscript(true)}
            className="w-full"
          >
            Show Transcript ({messages.length} messages)
          </Button>
        )}

        {/* Agent Info */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-amber-600">AI Agent Mode</p>
            <p>The AI will greet the prospect, qualify their interest, and can schedule callbacks or capture requirements automatically.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
