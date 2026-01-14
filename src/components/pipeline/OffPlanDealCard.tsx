import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Building2, Calendar, AlertCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PipelineDeal } from '@/hooks/usePipelineDeals';
import { NextActionBadge } from './NextActionBadge';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

interface OffPlanDealCardProps {
  deal: PipelineDeal;
  onClick: () => void;
  onSetNextAction: () => void;
}

export function OffPlanDealCard({
  deal,
  onClick,
  onSetNextAction,
}: OffPlanDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const price = deal.deal_economics?.agreed_price || deal.deal_economics?.asking_price;
  const isOverdue = deal.next_action_due && isPast(parseISO(deal.next_action_due));

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'pipeline-card cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary',
        isOverdue && 'border-destructive/50'
      )}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('button')) {
          onClick();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Building2 className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium text-sm text-foreground truncate">
            {deal.developer_project_name || deal.deal_id}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSetNextAction}>
              Set Next Action
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onClick}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* EOI / Price */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-muted-foreground">{deal.side}</span>
        {price && (
          <span className="font-semibold text-primary">
            {formatPrice(price)} AED
          </span>
        )}
      </div>

      {/* EOI Info */}
      {deal.eoi_amount && (
        <div className="text-xs text-muted-foreground mb-2">
          EOI: {formatPrice(deal.eoi_amount)} AED
          {deal.eoi_paid_at && ' (Paid)'}
        </div>
      )}

      {/* Construction Milestone */}
      {deal.construction_milestone && (
        <div className="text-xs text-amber-600 dark:text-amber-400 mb-2">
          Milestone: {deal.construction_milestone}
        </div>
      )}

      {/* Next Action */}
      {deal.next_action && (
        <NextActionBadge
          action={deal.next_action}
          dueDate={deal.next_action_due}
        />
      )}

      {/* Overdue Indicator */}
      {isOverdue && (
        <div className="flex items-center gap-1 text-xs text-destructive mt-2">
          <AlertCircle className="w-3 h-3" />
          <span>Overdue</span>
        </div>
      )}
    </div>
  );
}
