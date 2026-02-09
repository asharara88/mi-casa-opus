import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, Bot, User, Trash2, AlertTriangle } from 'lucide-react';
import { useBosLlmOps, useBosLlmRouter } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';
import { generateSuggestions, INITIAL_SUGGESTIONS } from '@/lib/chat-suggestions';
import { SuggestionChips } from './SuggestionChips';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
  timestamp: Date;
}

export function AIAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { askOps, isStreaming, response } = useBosLlmOps();
  const { routeRequest } = useBosLlmRouter();
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Generate context-aware suggestions based on conversation
  const suggestions = useMemo(() => {
    if (messages.length === 0) return INITIAL_SUGGESTIONS;
    
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant' && m.content);
    
    return generateSuggestions(
      lastUserMsg?.content || '',
      lastAssistantMsg?.content || '',
      messages.length
    );
  }, [messages]);

  // Update streaming message
  useEffect(() => {
    if (response && activeMessageId) {
      setMessages(prev => 
        prev.map(m => 
          m.id === activeMessageId ? { ...m, content: response } : m
        )
      );
    }
  }, [response, activeMessageId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isStreaming) return;

    setInput('');

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Route the request
    const mode = await routeRequest({
      userIntent: messageText,
      contextType: null,
      bosPayload: {},
    });

    // Add empty assistant message for streaming
    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      mode,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMsg]);
    setActiveMessageId(assistantId);

    // Call OPS mode (general assistant)
    await askOps(messageText, {}, undefined);
    setActiveMessageId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Mi Ai</h2>
            <p className="text-sm text-muted-foreground">Your BOS operations assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      <div className="card-gold p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Advisory Only.</span> AI responses are suggestions and cannot make compliance decisions, modify deals, or calculate commissions.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex flex-col h-[calc(100vh-320px)] min-h-[400px]">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Conversation</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {isStreaming ? 'Thinking...' : 'Ready'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">How can I help you today?</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Ask me about your pipeline, leads, deals, or general brokerage operations.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSend(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-4 py-3",
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.mode && msg.role === 'assistant' && (
                        <Badge variant="secondary" className="mb-2 text-[10px]">
                          {msg.mode}
                        </Badge>
                      )}
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.content || (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      </div>
                      <div className="text-[10px] opacity-60 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Suggestions - shown when there are messages and not streaming */}
          {messages.length > 0 && !isStreaming && (
            <SuggestionChips 
              suggestions={suggestions} 
              onSelect={handleSend}
            />
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask about your pipeline, leads, deals..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[44px] max-h-32 resize-none"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                size="icon"
                className="h-11 w-11 flex-shrink-0"
                onClick={() => handleSend()}
                disabled={!input.trim() || isStreaming}
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
