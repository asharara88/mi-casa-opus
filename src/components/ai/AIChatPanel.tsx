import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';
import { useBosLlmOps } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';

interface AIChatPanelProps {
  entityType: 'lead' | 'deal';
  entityData: Record<string, unknown>;
  complianceResult?: Record<string, unknown>;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatPanel({
  entityType,
  entityData,
  complianceResult,
  className,
  collapsed = true,
  onToggleCollapse,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { askOps, isStreaming: isOpsStreaming, response: opsResponse } = useBosLlmOps();

  // Update assistant message as streaming
  useEffect(() => {
    if (opsResponse && messages.length > 0) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: opsResponse } : m
          );
        }
        return [...prev, { role: 'assistant', content: opsResponse }];
      });
    }
  }, [opsResponse]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isOpsStreaming) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    await askOps(userMessage, { [entityType]: entityData }, complianceResult);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestedPrompts = entityType === 'lead' 
    ? [
        'What should be my next action?',
        'Draft a follow-up message',
        'Summarize this lead',
      ]
    : [
        'What documents are missing?',
        'Explain the current deal stage',
        'What are the compliance risks?',
      ];

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-2", className)}
        onClick={() => {
          setIsExpanded(true);
          onToggleCollapse?.();
        }}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        Mi Asistente
      </Button>
    );
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Mi Asistente
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setIsExpanded(false);
            onToggleCollapse?.();
          }}
        >
          <Minimize2 className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 pt-0 gap-3">
        {/* Messages */}
        <ScrollArea className="flex-1 min-h-[200px] max-h-[300px]" ref={scrollRef}>
          <div className="space-y-3 pr-4">
            {messages.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <Bot className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">
                  Ask me about this {entityType}
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {suggestedPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setInput(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2 text-sm",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[85%]",
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {msg.content || (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder={`Ask about this ${entityType}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] max-h-[80px] resize-none text-sm"
            disabled={isOpsStreaming}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isOpsStreaming}
          >
            {isOpsStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
