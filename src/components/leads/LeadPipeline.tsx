import { Lead, LeadState, LEAD_STATE_REQUIREMENTS } from '@/types/bos';
import { StateBadge } from '@/components/dashboard/StateBadge';
import { cn } from '@/lib/utils';
import { Phone, Mail, Calendar, User, ChevronRight, AlertCircle } from 'lucide-react';
import { validateLeadTransition } from '@/lib/state-machine';
import { Button } from '@/components/ui/button';

interface LeadPipelineProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onTransition: (lead: Lead, targetState: LeadState) => void;
}

const PIPELINE_STATES: LeadState[] = ['New', 'Contacted', 'Qualified', 'Converted'];

export function LeadPipeline({ leads, onLeadClick, onTransition }: LeadPipelineProps) {
  const getLeadsByState = (state: LeadState) => 
    leads.filter(l => l.lead_state === state);

  const getLeadCount = (state: LeadState) => 
    leads.filter(l => l.lead_state === state).length;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {PIPELINE_STATES.map(state => (
        <div key={state} className="pipeline-column">
          {/* Column Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StateBadge state={state} type="lead" />
              <span className="text-sm text-muted-foreground">
                ({getLeadCount(state)})
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            {getLeadsByState(state).map(lead => (
              <LeadCard
                key={lead.lead_id}
                lead={lead}
                onClick={() => onLeadClick(lead)}
                onTransition={onTransition}
              />
            ))}

            {getLeadsByState(state).length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No leads
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Disqualified Column (collapsed view) */}
      <div className="pipeline-column bg-muted/20">
        <div className="flex items-center justify-between mb-3">
          <StateBadge state="Disqualified" type="lead" />
          <span className="text-sm text-muted-foreground">
            ({getLeadCount('Disqualified')})
          </span>
        </div>
        <div className="text-sm text-muted-foreground text-center py-4">
          {getLeadCount('Disqualified')} archived
        </div>
      </div>
    </div>
  );
}

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onTransition: (lead: Lead, targetState: LeadState) => void;
}

function LeadCard({ lead, onClick, onTransition }: LeadCardProps) {
  const requirements = LEAD_STATE_REQUIREMENTS[lead.lead_state];
  const nextStates = requirements.next_states.filter(s => s !== 'Disqualified');

  // Check validation for next state
  const nextState = nextStates[0];
  const validation = nextState ? validateLeadTransition(lead, nextState) : null;

  return (
    <div className="pipeline-card group" onClick={onClick}>
      {/* Lead Name & Source */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-foreground text-sm">
            {lead.contact_identity.full_name}
          </p>
          <p className="text-xs text-muted-foreground">{lead.source}</p>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {lead.lead_id.slice(-6)}
        </span>
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
