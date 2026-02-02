import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CheckCircle, Star, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewingCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewingId: string;
  propertyName?: string;
  onComplete: (data: {
    feedbackScore: number;
    feedbackNotes: string;
    clientInterest: 'high' | 'medium' | 'low' | 'none';
  }) => Promise<void>;
  isLoading?: boolean;
}

const interestLevels = [
  { value: 'high', label: 'Very Interested', icon: ThumbsUp, color: 'text-emerald-500' },
  { value: 'medium', label: 'Somewhat Interested', icon: Meh, color: 'text-amber-500' },
  { value: 'low', label: 'Not Very Interested', icon: ThumbsDown, color: 'text-orange-500' },
  { value: 'none', label: 'Not Interested', icon: ThumbsDown, color: 'text-destructive' },
];

export function ViewingCompletionDialog({
  open,
  onOpenChange,
  viewingId,
  propertyName,
  onComplete,
  isLoading = false,
}: ViewingCompletionDialogProps) {
  const [feedbackScore, setFeedbackScore] = useState<number>(0);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [clientInterest, setClientInterest] = useState<'high' | 'medium' | 'low' | 'none'>('medium');

  const handleComplete = async () => {
    await onComplete({
      feedbackScore,
      feedbackNotes,
      clientInterest,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Complete Viewing
          </DialogTitle>
          <DialogDescription>
            {propertyName 
              ? `Record feedback for the viewing at ${propertyName}`
              : 'Record viewing feedback and client interest level'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Overall Experience (1-5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFeedbackScore(score)}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    feedbackScore >= score
                      ? 'text-amber-500'
                      : 'text-muted-foreground hover:text-amber-300'
                  )}
                >
                  <Star
                    className="h-8 w-8"
                    fill={feedbackScore >= score ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Client Interest Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Client Interest Level</Label>
            <div className="grid grid-cols-2 gap-2">
              {interestLevels.map((level) => {
                const Icon = level.icon;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setClientInterest(level.value as typeof clientInterest)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border-2 transition-all',
                      clientInterest === level.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', level.color)} />
                    <span className="text-sm font-medium">{level.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Viewing Notes</Label>
            <Textarea
              placeholder="Client feedback, property condition, negotiation points..."
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Next Steps Suggestion */}
          {clientInterest === 'high' && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm">
              <p className="font-medium text-emerald-600">🎯 High Interest Detected</p>
              <p className="text-muted-foreground mt-1">
                Consider scheduling a follow-up or preparing an offer letter.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleComplete} 
            disabled={isLoading || feedbackScore === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Viewing
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
