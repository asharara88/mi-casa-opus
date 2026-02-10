import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Loader2, Trash2, Sparkles, MessageCircle, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useBosLlmOps, useBosLlmRouter } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';
import { generateSuggestions, INITIAL_SUGGESTIONS } from '@/lib/chat-suggestions';
import { SuggestionChips } from './SuggestionChips';
import { ChatMessageRenderer } from './ChatMessageRenderer';
import { useConversationContext } from '@/hooks/useConversationContext';
import { toast } from 'sonner';

interface Attachment {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export function FloatingAIChat() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: Attachment[] = files.map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
        type: isImage ? 'image' : 'document',
      };
    });
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if ((!messageText && attachments.length === 0) || isStreaming) return;

    const currentAttachments = [...attachments];
    setInput('');
    setAttachments([]);

    // Build display content with attachment info
    const attachmentInfo = currentAttachments.length > 0
      ? `\n[${currentAttachments.map(a => `📎 ${a.file.name}`).join(', ')}]`
      : '';

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText + attachmentInfo,
      timestamp: new Date(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };
    setMessages(prev => [...prev, userMsg]);

    // Route the request
    const mode = await routeRequest({
      userIntent: messageText || 'Analyze the attached file(s)',
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

    await askOps(messageText || 'Analyze the attached file(s)', {}, undefined);
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
        aria-label="Open Mi Ai"
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
                  <SheetTitle className="text-base">Mi Ai</SheetTitle>
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

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="px-3 pt-2 flex gap-2 flex-wrap">
              {attachments.map((att, i) => (
                <div key={i} className="relative group flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1.5 text-xs">
                  {att.type === 'image' && att.preview ? (
                    <img src={att.preview} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="max-w-[100px] truncate">{att.file.name}</span>
                  <button
                    onClick={() => removeAttachment(i)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-border bg-card flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex gap-2 items-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Textarea
                placeholder="Ask anything or attach a file..."
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
                disabled={(!input.trim() && attachments.length === 0) || isStreaming}
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
