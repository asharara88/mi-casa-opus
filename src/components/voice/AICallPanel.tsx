import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, ChevronUp, Phone, Clock, Target, 
  MessageSquare, Calendar, FileText, AlertTriangle
} from 'lucide-react';
import type { ConversationMessage, CapturedRequirements } from '@/hooks/useConversationAgent';
import { format } from 'date-fns';

interface AICallPanelProps {
  prospectName: string;
  status: 'disconnected' | 'connected';
  duration: string;
  messages: ConversationMessage[];
  capturedRequirements?: CapturedRequirements;
  scheduledCallback?: { date: Date; notes: string };
  detectedIntents?: string[];
  onStartCall?: () => void;
  onEndCall?: () => void;
}

export function AICallPanel({
  prospectName,
  status,
  duration,
  messages,
  capturedRequirements,
  scheduledCallback,
  detectedIntents = [],
  onStartCall,
  onEndCall,
}: AICallPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isConnected = status === 'connected';

  return (
    <Card className="w-full">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="h-4 w-4" />
              AI Call with {prospectName}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isConnected && (
                <Badge variant="default" className="bg-emerald-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {duration}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Detected Intents */}
            {detectedIntents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Detected Intents
                </h4>
                <div className="flex flex-wrap gap-1">
                  {detectedIntents.map((intent, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {intent}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Captured Requirements */}
            {capturedRequirements && Object.keys(capturedRequirements).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Captured Requirements
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {capturedRequirements.propertyType && (
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Type:</span>{' '}
                      {capturedRequirements.propertyType}
                    </div>
                  )}
                  {capturedRequirements.bedrooms && (
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Beds:</span>{' '}
                      {capturedRequirements.bedrooms}
                    </div>
                  )}
                  {capturedRequirements.location && (
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Location:</span>{' '}
                      {capturedRequirements.location}
                    </div>
                  )}
                  {capturedRequirements.budget && (
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Budget:</span>{' '}
                      {capturedRequirements.budget}
                    </div>
                  )}
                  {capturedRequirements.timeline && (
                    <div className="p-2 bg-muted/30 rounded col-span-2">
                      <span className="text-muted-foreground">Timeline:</span>{' '}
                      {capturedRequirements.timeline}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scheduled Callback */}
            {scheduledCallback && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Scheduled Callback
                </h4>
                <div className="p-2 bg-primary/10 rounded border border-primary/20">
                  <p className="text-sm font-medium">
                    {format(scheduledCallback.date, 'PPP p')}
                  </p>
                  {scheduledCallback.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {scheduledCallback.notes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recent Messages Preview */}
            {messages.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Recent Messages
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {messages.slice(-3).map((msg, idx) => (
                    <div 
                      key={idx}
                      className="text-xs p-2 bg-muted/20 rounded"
                    >
                      <span className="font-medium">
                        {msg.role === 'agent' ? 'AI:' : 'Prospect:'}
                      </span>{' '}
                      <span className="text-muted-foreground">
                        {msg.text.length > 100 ? msg.text.slice(0, 100) + '...' : msg.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call Actions */}
            <div className="flex gap-2 pt-2">
              {!isConnected ? (
                <Button 
                  size="sm" 
                  onClick={onStartCall}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Start Call
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={onEndCall}
                  className="flex-1"
                >
                  End Call
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
