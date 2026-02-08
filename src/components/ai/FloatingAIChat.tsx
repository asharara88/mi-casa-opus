import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Loader2, Trash2, Sparkles, MessageCircle } from 'lucide-react';
import { useBosLlmOps, useBosLlmRouter } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';
import { generateSuggestions, INITIAL_SUGGESTIONS } from '@/lib/chat-suggestions';
import { SuggestionChips } from './SuggestionChips';
import { ChatMessageRenderer } from './ChatMessageRenderer';
import { useConversationContext } from '@/hooks/useConversationContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
  timestamp: Date;
}

export function FloatingAIChat() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { askOps, isStreaming, response } = useBosLlmOps();
  const { routeRequest } = useBosLlmRouter();
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  
  // Conversation context for entity extraction
  const { storeTemplatePrefill } = useConversationContext(messages);

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

  // Handle opening a template from action card
  const handleOpenTemplate = useCallback((templateId: string, prefill?: Record<string, unknown>) => {
    // Store prefill data for the form wizard to pick up
    storeTemplatePrefill(templateId, prefill);
    
    // Close the chat panel
    setIsOpen(false);
    
    // Navigate to documents section with template pre-selected
    // The URL hash will trigger the template to open
    navigate(`/?section=documents&template=${templateId}`);
    
    toast.success('Opening template...', {
      description: 'Form wizard will open with pre-filled data'
    });
  }, [navigate, storeTemplatePrefill]);

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
      {/* Floating Button - Hidden on mobile to avoid conflict with MobileBottomNav FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 w-14 h-14 rounded-full shadow-lg items-center justify-center",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "transition-all duration-300 hover:scale-105 active:scale-95",
          "bottom-6 right-6",
          "hidden lg:flex", // Only show on desktop
          isOpen && "lg:scale-0 lg:opacity-0"
        )}
        aria-label="Open Mi Asistente"
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
                  <SheetTitle className="text-base">Mi Asistente</SheetTitle>
                  <p className="text-xs text-muted-foreground">Advisory & Documents</p>
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
                  Ask about your pipeline, leads, deals, or prepare documents
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleSend(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <ChatMessageRenderer
                    key={msg.id}
                    message={msg}
                    onOpenTemplate={handleOpenTemplate}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Suggestions - shown when there are messages and not streaming */}
          {messages.length > 0 && !isStreaming && (
            <SuggestionChips 
              suggestions={suggestions} 
              onSelect={handleSend}
              compact
            />
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-border bg-card flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask anything or request a document..."
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
