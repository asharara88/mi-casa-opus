import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Loader2, User, Trash2, X, Sparkles, MessageCircle } from 'lucide-react';
import { useBosLlmOps, useBosLlmRouter } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'Pipeline status',
  'Today\'s priorities',
  'Find prospect Zaid',
  'Recent leads',
];

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { askOps, isStreaming, response } = useBosLlmOps();
  const { routeRequest } = useBosLlmRouter();
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "transition-all duration-300 hover:scale-105 active:scale-95",
          "bottom-24 right-4 lg:bottom-6 lg:right-6", // Above mobile nav on small screens
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Open AI Assistant"
      >
        <Bot className="w-6 h-6" />
        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald rounded-full border-2 border-background flex items-center justify-center">
          <Sparkles className="w-2 h-2 text-white" />
        </span>
      </button>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-md p-0 flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-base">AI Assistant</SheetTitle>
                  <p className="text-xs text-muted-foreground">Advisory only</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Badge variant="outline" className="text-[10px]">
                  {isStreaming ? 'Thinking...' : 'Ready'}
                </Badge>
              </div>
            </div>
          </SheetHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">How can I help?</h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
                  Ask about your pipeline, leads, or deals
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_PROMPTS.map((qp) => (
                    <Button
                      key={qp}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleSend(qp)}
                    >
                      {qp}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl px-3 py-2",
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.mode && msg.role === 'assistant' && (
                        <Badge variant="secondary" className="mb-1 text-[9px] h-4">
                          {msg.mode}
                        </Badge>
                      )}
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.content || (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 border-t border-border bg-card flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[40px] max-h-24 resize-none text-sm"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                size="icon"
                className="h-10 w-10 flex-shrink-0"
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
        </SheetContent>
      </Sheet>
    </>
  );
}
