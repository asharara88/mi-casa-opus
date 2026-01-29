import { cn } from '@/lib/utils';
import { TrendingUp, Target } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { qualifyLead, type ProspectScoringData } from '@/utils/bosScoring';

interface LeadScoreBadgeProps {
  qualificationData?: ProspectScoringData | null;
  className?: string;
}

export function LeadScoreBadge({ qualificationData, className }: LeadScoreBadgeProps) {
  if (!qualificationData) return null;

  const { fitScore, intentScore, totalScore, status } = qualifyLead(qualificationData);
  const stage = status;
  
  // Don't show if no score
  if (totalScore === 0 && stage !== 'Disqualified') return null;

  const getScoreColor = (score: number) => {
    if (stage === 'Disqualified') return 'text-destructive';
    if (score >= 75) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getScoreBg = (score: number) => {
    if (stage === 'Disqualified') return 'bg-destructive/10 border-destructive/30';
    if (score >= 75) return 'bg-success/15 border-success/30';
    if (score >= 60) return 'bg-primary/15 border-primary/30';
    if (score >= 40) return 'bg-warning/15 border-warning/30';
    return 'bg-muted/50 border-border';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
              getScoreBg(totalScore),
              className
            )}
          >
            <Target className="w-2.5 h-2.5" />
            <span className={getScoreColor(totalScore)}>{totalScore}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-48">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">Lead Score</span>
              <span className={cn('text-sm font-bold', getScoreColor(totalScore))}>
                {totalScore}/100
              </span>
            </div>
            
            {/* Score breakdown */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fit Score</span>
                <span className="font-medium">{fitScore}/50</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(fitScore / 50) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Intent Score</span>
                <span className="font-medium">{intentScore}/50</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success transition-all"
                  style={{ width: `${(intentScore / 50) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Recommended stage */}
            <div className="pt-1 border-t border-border">
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Suggested:</span>
                <span
                  className={cn(
                    'font-medium',
                    stage === 'HighIntent' && 'text-success',
                    stage === 'Qualified' && 'text-primary',
                    stage === 'Interested' && 'text-warning',
                    stage === 'Disqualified' && 'text-destructive',
                    stage === 'Nurture' && 'text-muted-foreground'
                  )}
                >
                  {stage}
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
