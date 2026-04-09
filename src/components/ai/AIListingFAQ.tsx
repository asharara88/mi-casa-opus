import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, HelpCircle, Bot } from 'lucide-react';
import { useBosLlmListingFaq } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';

interface AIListingFAQProps {
  listingData: Record<string, unknown>;
  className?: string;
}

interface QA {
  question: string;
  answer: string;
}

const SUGGESTED_QUESTIONS = [
  'What are the payment terms?',
  'Is this property freehold?',
  'What amenities are nearby?',
  'What is the service charge?',
  'Is it pet-friendly?',
];

export function AIListingFAQ({ listingData, className }: AIListingFAQProps) {
  const [qaHistory, setQAHistory] = useState<QA[]>([]);
  const [question, setQuestion] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { askAboutListing, isAnswering } = useBosLlmListingFaq();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [qaHistory]);

  const handleAsk = async (q?: string) => {
    const questionText = q || question.trim();
    if (!questionText || isAnswering) return;

    setQuestion('');
    
    // Add question with pending answer
    setQAHistory(prev => [...prev, { question: questionText, answer: '' }]);

    const answer = await askAboutListing(questionText, listingData);

    // Update with answer
    setQAHistory(prev => 
      prev.map((qa, i) => 
        i === prev.length - 1 ? { ...qa, answer } : qa
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          AI Property FAQ
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 pt-0 gap-3">
        {/* Q&A History */}
        <ScrollArea className="flex-1 min-h-[150px] max-h-[250px]" ref={scrollRef}>
          <div className="space-y-4 pr-4">
            {qaHistory.length === 0 ? (
              <div className="text-center py-4 space-y-3">
                <Sparkles className="h-6 w-6 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">
                  Ask questions about this property
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleAsk(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              qaHistory.map((qa, i) => (
                <div key={i} className="space-y-2">
                  {/* Question */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="h-3 w-3" />
                    </div>
                    <div className="text-sm font-medium">{qa.question}</div>
                  </div>
                  
                  {/* Answer */}
                  <div className="flex items-start gap-2 pl-7">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {qa.answer || (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this property..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm"
            disabled={isAnswering}
          />
          <Button
            size="icon"
            onClick={() => handleAsk()}
            disabled={!question.trim() || isAnswering}
          >
            {isAnswering ? (
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
