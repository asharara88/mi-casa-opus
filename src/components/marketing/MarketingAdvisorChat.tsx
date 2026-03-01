import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, Trash2, Send, TrendingUp, Megaphone, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketingStats } from '@/hooks/useMarketingStats';
import { SuggestionChips } from '@/components/ai/SuggestionChips';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'Analyze my campaign ROI',
  'Draft ad copy for a luxury listing',
  'Suggest next month\'s strategy',
  'Which channels are underperforming?',
  'Review my DARI permit compliance',
  'Plan an open house event',
];

export function MarketingAdvisorChat() {
  const { stats, isLoading: statsLoading } = useMarketingStats();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (allMessages: Msg[]) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bos-llm-marketing-advisor`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Request failed' }));
      if (resp.status === 429) toast.error('Rate limit exceeded. Please wait a moment.');
      else if (resp.status === 402) toast.error('AI credits depleted. Top up in Settings → Workspace → Usage.');
      else toast.error(err.error || 'Failed to reach advisor');
      return;
    }

    if (!resp.body) return;

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let assistantSoFar = '';

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (json === '[DONE]') return;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) upsert(content);
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }
  };

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;
    const userMsg: Msg = { role: 'user', content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsStreaming(true);
    try {
      await streamChat(updated);
    } catch (e) {
      console.error(e);
      toast.error('Connection error');
    } finally {
      setIsStreaming(false);
    }
  };

  const budgetUtil = stats.totalBudget > 0 ? Math.round((stats.totalSpend / stats.totalBudget) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Context chips */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
          <Megaphone className="w-3 h-3" />
          {stats.activeCampaigns} active campaigns
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
          <TrendingUp className="w-3 h-3" />
          {budgetUtil}% budget used
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
          <Calendar className="w-3 h-3" />
          {stats.upcomingEvents} upcoming events
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
          <AlertTriangle className="w-3 h-3" />
          {stats.activeAds} active ads
        </Badge>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Mi Marketing Advisor</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              disabled={isStreaming || messages.length === 0}
              className="h-7 px-2 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
          <CardDescription>
            Abu Dhabi real estate marketing specialist — powered by your live campaign data. Advisory only.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <ScrollArea className="h-[400px] rounded-md border bg-muted/20 p-4" ref={scrollRef as any}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-3">
                <Sparkles className="h-8 w-8 text-primary/40" />
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask me about campaign performance, ad compliance, channel strategy, or marketing copy for Abu Dhabi properties.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'rounded-lg px-3 py-2 max-w-[85%] text-sm whitespace-pre-wrap',
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    )}>
                      {m.content || (isStreaming && i === messages.length - 1 ? '...' : '')}
                    </div>
                  </div>
                ))}
                {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-3 py-2 bg-background border text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <SuggestionChips
            suggestions={messages.length === 0 ? SUGGESTIONS : SUGGESTIONS.slice(0, 3)}
            onSelect={(s) => send(s)}
            className="border-none bg-transparent px-0"
          />

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Mi Marketing..."
              disabled={isStreaming}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button onClick={() => send()} disabled={isStreaming || !input.trim()} size="icon">
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
