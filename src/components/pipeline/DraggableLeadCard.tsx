import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead, LeadState, LEAD_STATE_REQUIREMENTS } from '@/types/bos';
import { validateLeadTransition } from '@/lib/state-machine';
import { Phone, Mail, User, ChevronRight, AlertCircle, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgingBadge } from '@/components/pipeline/AgingBadge';
import { NextActionBadge } from '@/components/pipeline/NextActionBadge';
import { LEAD_AGING_THRESHOLDS } from '@/hooks/useAgingAlerts';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type NextActionType = Database['public']['Enums']['next_action_type'];

interface DraggableLeadCardProps {
  lead: Lead & { 
    id: string; 
    next_action?: NextActionType | null;
    next_action_due?: string | null;
  };
  onClick: () => void;
  onTransition: (lead: Lead, targetState: LeadState) => void;
  onSetNextAction: (lead: Lead & { id: string }) => void;
}

export function DraggableLeadCard({ lead, onClick, onTransition, onSetNextAction }: DraggableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const requirements = LEAD_STATE_REQUIREMENTS[lead.lead_state];
  const nextStates = requirements.next_states.filter(s => s !== 'Disqualified');
  const nextState = nextStates[0];
  const validation = nextState ? validateLeadTransition(lead, nextState) : null;

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

      {/* Aging Badge & ID */}
      <div className="flex items-center justify-between mb-2 pl-6">
        <AgingBadge 
          updatedAt={lead.updated_at} 
          thresholds={LEAD_AGING_THRESHOLDS[lead.lead_state] || LEAD_AGING_THRESHOLDS.New} 
        />
        <span className="text-xs font-mono text-muted-foreground">
          {lead.lead_id.slice(-6)}
        </span>
      </div>

      {/* Next Action Badge */}
      <div 
        className="mb-2"
        onClick={(e) => {
          e.stopPropagation();
          onSetNextAction(lead);
        }}
      >
        <NextActionBadge
          nextAction={lead.next_action}
          nextActionDue={lead.next_action_due}
          className="cursor-pointer hover:opacity-80"
        />
      </div>

      {/* Lead Name & Source */}
      <div className="mb-2">
        <p className="font-medium text-foreground text-sm">
          {lead.contact_identity.full_name}
        </p>
        <p className="text-xs text-muted-foreground">{lead.source}</p>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="w-3 h-3" />
          <span>{lead.contact_identity.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="w-3 h-3" />
          <span className="truncate">{lead.contact_identity.email}</span>
        </div>
      </div>

      {/* Assigned Broker */}
      {lead.assigned_broker_id && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <User className="w-3 h-3" />
          <span>Assigned</span>
        </div>
      )}

      {/* Block Reasons */}
      {validation && !validation.allowed && (
        <div className="mb-3">
          <div className="text-xs text-destructive flex items-center gap-1 mb-1">
            <AlertCircle className="w-3 h-3" />
            <span>Blocked</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-0.5 pl-4">
            {validation.block_reasons.slice(0, 2).map((reason, i) => (
              <li key={i} className="truncate">• {reason}</li>
            ))}
            {validation.block_reasons.length > 2 && (
              <li className="text-muted-foreground">+{validation.block_reasons.length - 2} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      {nextStates.length > 0 && (
        <div className="flex gap-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
          {nextStates.map(targetState => {
            const canTransition = validateLeadTransition(lead, targetState).allowed;
            return (
              <Button
                key={targetState}
                size="sm"
                variant={canTransition ? 'default' : 'outline'}
                disabled={!canTransition}
                className="flex-1 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  if (canTransition) onTransition(lead, targetState);
                }}
              >
                {targetState}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
