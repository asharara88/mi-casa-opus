import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
}

export function SuggestionChips({ 
  suggestions, 
  onSelect, 
  isLoading,
  className,
  compact = false
}: SuggestionChipsProps) {
  if (isLoading || suggestions.length === 0) return null;

  return (
    <div className={cn(
      "flex flex-wrap gap-2 border-t border-border bg-muted/30",
      compact ? "px-3 py-2" : "px-4 py-3",
      className
    )}>
      <div className="flex items-center gap-1.5 mr-1">
        <Sparkles className={cn(
          "text-primary",
          compact ? "w-3 h-3" : "w-3.5 h-3.5"
        )} />
        <span className={cn(
          "text-muted-foreground font-medium",
          compact ? "text-[10px]" : "text-xs"
        )}>
          Suggestions
        </span>
      </div>
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          className={cn(
            "bg-background hover:bg-accent transition-colors",
            compact ? "text-[10px] h-6 px-2" : "text-xs h-7 px-3"
          )}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
