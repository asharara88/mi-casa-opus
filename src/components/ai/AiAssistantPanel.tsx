import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, Trash2, Send } from 'lucide-react';
import { useBosLlmOps, useBosLlmRouter, useBosLlmLeadQualify } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';

type ContextType = 'listing' | 'lead' | 'transaction' | 'marketing';

interface AiAssistantPanelProps {
  contextTitle?: string;
  contextType: ContextType;
  bosPayload: Record<string, unknown>;
  complianceResult?: Record<string, unknown>;
}

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
}

function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function AiAssistantPanel({
  contextTitle = 'Mi Asistente',
  contextType,
  bosPayload,
  complianceResult,
}: AiAssistantPanelProps) {
  const { routeRequest, isRouting } = useBosLlmRouter();
  const { askOps, isStreaming, response } = useBosLlmOps();
  const { qualifyLead, isQualifying } = useBosLlmLeadQualify();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [activeMode, setActiveMode] = useState('OPS');
  const [activeOpsMsgId, setActiveOpsMsgId] = useState<string | null>(null);

  const leadPayload = useMemo(() => {
    return (bosPayload as { lead?: Record<string, unknown> })?.lead;
  }, [bosPayload]);

  // Update streaming message content
  useEffect(() => {
    if (!activeOpsMsgId || !isStreaming) return;

    setMessages(prev => prev.map(m => {
      if (m.id !== activeOpsMsgId) return m;
      return { ...m, content: response };
    }));
  }, [response, isStreaming, activeOpsMsgId]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Route the request based on context + intent
    const selectedMode = await routeRequest({
      userIntent: text,
      contextType,
      bosPayload,
      complianceResult,
    });
    setActiveMode(selectedMode);

    // LEAD_QUALIFY supported only if lead payload exists
    if (selectedMode === 'LEAD_QUALIFY') {
      if (!leadPayload) {
        const assistantMsg: Msg = {
          id: crypto.randomUUID(),
          role: 'assistant',
          mode: 'LEAD_QUALIFY',
          content: 'Lead qualification needs lead context, but no lead payload was provided.',
        };
        setMessages(prev => [...prev, assistantMsg]);
        return;
      }

      const qualification = await qualifyLead(text, leadPayload);
      const assistantMsg: Msg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        mode: 'LEAD_QUALIFY',
        content: qualification
          ? `**Advisory lead qualification** (no actions executed):\n\n\`\`\`json\n${prettyJson(qualification)}\n\`\`\``
          : 'No qualification was returned.',
      };
      setMessages(prev => [...prev, assistantMsg]);
      return;
    }

    // Default to OPS for everything else
    const opsMsgId = crypto.randomUUID();
    setActiveOpsMsgId(opsMsgId);
    setMessages(prev => [
      ...prev,
      { id: opsMsgId, role: 'assistant', mode: 'OPS', content: '' },
    ]);

    await askOps(text, bosPayload, complianceResult);
    setActiveOpsMsgId(null);
  };

  const clear = () => {
    setMessages([]);
    setActiveOpsMsgId(null);
  };

  const busy = isRouting || isStreaming || isQualifying;

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">{contextTitle}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {activeMode}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          AI provides suggestions only. Nothing is changed until you explicitly act.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status bar */}
        <div className="flex items-center justify-between text-xs">
          <Badge variant={busy ? 'default' : 'secondary'} className="text-xs">
            {busy ? 'Working...' : 'Ready'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={busy || messages.length === 0}
            className="h-6 px-2 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="h-48 rounded-md border bg-muted/30 p-3">
          {messages.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Ask a question about this {contextType}. The assistant will route to OPS or specialized mode.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={cn(
                    'text-sm',
                    m.role === 'user' ? 'text-right' : 'text-left'
                  )}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Badge
                      variant={m.role === 'user' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {m.role === 'user' ? 'You' : 'AI'}
                    </Badge>
                    {m.mode && (
                      <Badge variant="secondary" className="text-xs">
                        {m.mode}
                      </Badge>
                    )}
                  </div>
                  <div className={cn(
                    'rounded-md p-2 text-xs whitespace-pre-wrap',
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-8' 
                      : 'bg-background border mr-8'
                  )}>
                    {m.content || (m.role === 'assistant' && busy ? '...' : '')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask AI (advisory only)..."
            disabled={busy}
            className="text-sm"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button onClick={send} disabled={busy || !input.trim()} size="sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
