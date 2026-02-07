import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Loader2 } from "lucide-react";
import { parseActionBlocks, DocumentAction } from "@/lib/document-intent";
import { DocumentActionList } from "./DocumentActionCard";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
  timestamp: Date;
}

interface ChatMessageRendererProps {
  message: Message;
  onOpenTemplate: (templateId: string, prefill?: Record<string, unknown>) => void;
}

export function ChatMessageRenderer({ message, onOpenTemplate }: ChatMessageRendererProps) {
  // Parse action blocks from assistant messages
  const { text, actions } = useMemo(() => {
    if (message.role === 'assistant' && message.content) {
      return parseActionBlocks(message.content);
    }
    return { text: message.content, actions: [] as DocumentAction[] };
  }, [message.content, message.role]);
  
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      
      {/* Message content */}
      <div className={cn("max-w-[85%] space-y-2")}>
        {/* Text bubble */}
        <div
          className={cn(
            "rounded-xl px-3 py-2",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {/* Mode badge for assistant */}
          {message.mode && !isUser && (
            <Badge variant="secondary" className="mb-1 text-[9px] h-4">
              {message.mode}
            </Badge>
          )}
          
          {/* Message text */}
          <div className="text-sm whitespace-pre-wrap">
            {text || (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </div>
        </div>
        
        {/* Document action cards */}
        {!isUser && actions.length > 0 && (
          <DocumentActionList 
            actions={actions} 
            onOpenTemplate={onOpenTemplate}
          />
        )}
      </div>
      
      {/* User avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
