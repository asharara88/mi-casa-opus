import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal, DealState, DEAL_STATE_REQUIREMENTS, ValidationContext } from '@/types/bos';
import { validateDealTransition } from '@/lib/state-machine';
import { FileText, PenTool, AlertCircle, ChevronRight, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgingBadge } from '@/components/pipeline/AgingBadge';
import { NextActionBadge } from '@/components/pipeline/NextActionBadge';
import { DEAL_AGING_THRESHOLDS } from '@/hooks/useAgingAlerts';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type NextActionType = Database['public']['Enums']['next_action_type'];

interface DraggableDealCardProps {
  deal: Deal & { 
    dbId: string;
    next_action?: NextActionType | null;
    next_action_due?: string | null;
  };
  context: ValidationContext;
  onClick: () => void;
  onTransition: (deal: Deal, targetState: DealState) => void;
  onSetNextAction: (deal: Deal & { dbId: string }) => void;
}

export function DraggableDealCard({ deal, context, onClick, onTransition, onSetNextAction }: DraggableDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.dbId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const requirements = DEAL_STATE_REQUIREMENTS[deal.deal_state];
  const nextStates = requirements.next_states.filter(s => s !== 'Closed_Lost');
  const nextState = nextStates[0];
  const validation = nextState ? validateDealTransition(deal, nextState, context) : null;

  const formatPrice = (price?: number) => {
    if (!price) return 'TBD';
    if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M AED`;
    return `${(price / 1000).toFixed(0)}K AED`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'pipeline-card group relative',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Aging Badge & Deal ID */}
      <div className="flex items-center justify-between mb-2 pl-6">
        <AgingBadge 
          updatedAt={deal.updated_at} 
          thresholds={DEAL_AGING_THRESHOLDS[deal.deal_state] || DEAL_AGING_THRESHOLDS.Created} 
        />
        <span className="font-mono text-xs text-muted-foreground">
          {deal.deal_id.slice(-6)}
        </span>
      </div>

      {/* Next Action Badge */}
      <div 
        className="mb-2"
        onClick={(e) => {
          e.stopPropagation();
          onSetNextAction(deal);
        }}
      >
        <NextActionBadge
          nextAction={deal.next_action}
          nextActionDue={deal.next_action_due}
          className="cursor-pointer hover:opacity-80"
        />
      </div>

      {/* Deal Type */}
      <div className="mb-2">
        <p className="font-medium text-foreground text-sm">
          {deal.deal_type} • {deal.side}
        </p>
      </div>

      {/* Price */}
      <div className="mb-2">
        <p className="text-lg font-bold text-primary">
          {formatPrice(deal.agreed_price)}
        </p>
      </div>

      {/* Parties */}
      {deal.parties.length > 0 && (
        <div className="text-xs text-muted-foreground mb-2">
          {deal.parties[0].identity.full_name}
          {deal.parties.length > 1 && ` +${deal.parties.length - 1}`}
        </div>
      )}

      {/* Progress Indicators */}
      <div className="flex gap-2 mb-3">
        {requirements.required_documents.length > 0 && (
          <div className={cn(
            'flex items-center gap-1 text-xs px-2 py-1 rounded',
            validation?.missing_documents.length === 0
              ? 'bg-emerald/20 text-emerald'
              : 'bg-muted text-muted-foreground'
          )}>
            <FileText className="w-3 h-3" />
            <span>
              {requirements.required_documents.length - (validation?.missing_documents.length || 0)}/
              {requirements.required_documents.length}
            </span>
          </div>
        )}
        {requirements.required_signatures.length > 0 && (
          <div className={cn(
            'flex items-center gap-1 text-xs px-2 py-1 rounded',
            validation?.missing_signatures.length === 0
              ? 'bg-emerald/20 text-emerald'
              : 'bg-muted text-muted-foreground'
          )}>
            <PenTool className="w-3 h-3" />
            <span>
              {requirements.required_signatures.length - (validation?.missing_signatures.length || 0)}/
              {requirements.required_signatures.length}
            </span>
          </div>
        )}
      </div>

      {/* Block Reasons */}
      {validation && !validation.allowed && (
        <div className="mb-3 p-2 bg-destructive/10 rounded border border-destructive/20">
          <div className="text-xs text-destructive flex items-center gap-1 mb-1">
            <AlertCircle className="w-3 h-3" />
            <span>Transition Blocked</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {validation.block_reasons.slice(0, 2).map((reason, i) => (
              <li key={i} className="truncate">• {reason}</li>
            ))}
            {validation.block_reasons.length > 2 && (
              <li>+{validation.block_reasons.length - 2} more issues</li>
            )}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      {nextStates.length > 0 && (
        <div className="flex gap-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
          {nextStates.slice(0, 1).map(targetState => {
            const canTransition = validateDealTransition(deal, targetState, context).allowed;
            return (
              <Button
                key={targetState}
                size="sm"
                variant={canTransition ? 'default' : 'outline'}
                disabled={!canTransition}
                className="flex-1 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  if (canTransition) onTransition(deal, targetState);
                }}
              >
                → {targetState.replace('_', ' ')}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
