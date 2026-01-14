import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DealPipeline,
  OffPlanDealState,
  SecondaryDealState,
  OFFPLAN_STATE_CONFIG,
  SECONDARY_STATE_CONFIG,
} from '@/types/pipeline';

interface PipelineStateBadgeProps {
  pipeline: DealPipeline;
  state: OffPlanDealState | SecondaryDealState;
  className?: string;
}

const STATE_COLORS: Record<string, string> = {
  // Off-Plan states
  LeadQualified: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  EOISubmitted: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  EOIPaid: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  SPASigned: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  PaymentPlan: 'bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-500/30',
  Construction: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
  Handover: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
  
  // Secondary states
  RequirementsCaptured: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  ViewingScheduled: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  ViewingCompleted: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  OfferSubmitted: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  OfferAccepted: 'bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-500/30',
  MOUSigned: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  NOCObtained: 'bg-lime-500/20 text-lime-700 dark:text-lime-400 border-lime-500/30',
  TransferBooked: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
  TransferComplete: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  
  // Terminal states
  ClosedWon: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  ClosedLost: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function PipelineStateBadge({ pipeline, state, className }: PipelineStateBadgeProps) {
  const config = pipeline === 'OffPlan'
    ? OFFPLAN_STATE_CONFIG[state as OffPlanDealState]
    : SECONDARY_STATE_CONFIG[state as SecondaryDealState];

  const label = config?.label || state;
  const colorClass = STATE_COLORS[state] || 'bg-muted text-muted-foreground';

  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium border', colorClass, className)}
    >
      {label}
    </Badge>
  );
}
