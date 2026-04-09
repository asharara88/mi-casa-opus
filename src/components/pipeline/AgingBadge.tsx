import { cn } from '@/lib/utils';
import { Clock, AlertTriangle } from 'lucide-react';
import { 
  AgingLevel, 
  AgingThresholds, 
  calculateAgingLevel, 
  getDaysInStage, 
  getAgingLabel 
} from '@/hooks/useAgingAlerts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AgingBadgeProps {
  updatedAt: string | Date;
  thresholds: AgingThresholds;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function AgingBadge({ 
  updatedAt, 
  thresholds, 
  showLabel = true,
  size = 'sm' 
}: AgingBadgeProps) {
  const agingLevel = calculateAgingLevel(updatedAt, thresholds);
  const daysInStage = getDaysInStage(updatedAt);
  const label = getAgingLabel(daysInStage);

  // Don't show badge for fresh items
  if (agingLevel === 'fresh') return null;

  const Icon = agingLevel === 'red' ? AlertTriangle : Clock;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-1 rounded-full font-medium',
              size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
              agingLevel === 'yellow' && 'bg-warning/20 text-warning border border-warning/30',
              agingLevel === 'red' && 'bg-destructive/20 text-destructive border border-destructive/30 animate-pulse'
            )}
          >
            <Icon className={cn(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
            {showLabel && <span>{label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs">
            <p className="font-medium">
              {agingLevel === 'yellow' ? 'Needs Attention' : 'Stale - Requires Action'}
            </p>
            <p className="text-muted-foreground mt-0.5">
              {daysInStage} days in current stage
            </p>
            <p className="text-muted-foreground">
              Threshold: {thresholds.yellow}d (yellow) / {thresholds.red}d (red)
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
