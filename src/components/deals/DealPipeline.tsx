import { Deal, DealState, DEAL_STATE_REQUIREMENTS, ValidationContext } from '@/types/bos';
import { StateBadge } from '@/components/dashboard/StateBadge';
import { cn } from '@/lib/utils';
import { FileText, PenTool, AlertCircle, ChevronRight, DollarSign, Camera } from 'lucide-react';
import { validateDealTransition } from '@/lib/state-machine';
import { Button } from '@/components/ui/button';
import { AgingBadge } from '@/components/pipeline/AgingBadge';
import { DEAL_AGING_THRESHOLDS } from '@/hooks/useAgingAlerts';

interface DealPipelineProps {
  deals: Deal[];
  context: ValidationContext;
  onDealClick: (deal: Deal) => void;
  onTransition: (deal: Deal, targetState: DealState) => void;
}

const PIPELINE_STATES: DealState[] = ['Created', 'Qualified', 'Viewing', 'Offer', 'Reservation', 'SPA'];

export function DealPipeline({ deals, context, onDealClick, onTransition }: DealPipelineProps) {
  const getDealsByState = (state: DealState) => 
    deals.filter(d => d.deal_state === state);

  const getDealCount = (state: DealState) => 
    deals.filter(d => d.deal_state === state).length;

  const getTotalValue = (state: DealState) => {
    const stateDeals = deals.filter(d => d.deal_state === state);
    return stateDeals.reduce((sum, d) => sum + (d.agreed_price || 0), 0);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M AED`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K AED`;
    return `${value} AED`;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {PIPELINE_STATES.map(state => {
        const requirements = DEAL_STATE_REQUIREMENTS[state];
        const totalValue = getTotalValue(state);

        return (
          <div key={state} className="pipeline-column">
            {/* Column Header */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <StateBadge state={state} type="deal" />
                <span className="text-sm text-muted-foreground">
                  ({getDealCount(state)})
                </span>
              </div>
              {totalValue > 0 && (
                <p className="text-xs text-primary font-medium">
                  {formatCurrency(totalValue)}
                </p>
              )}
            </div>

            {/* Requirements Indicator */}
            <div className="flex gap-2 mb-3 text-xs text-muted-foreground">
              {requirements.required_documents.length > 0 && (
                <div className="flex items-center gap-1" title="Documents required">
                  <FileText className="w-3 h-3" />
                  <span>{requirements.required_documents.length}</span>
                </div>
              )}
              {requirements.required_signatures.length > 0 && (
                <div className="flex items-center gap-1" title="Signatures required">
                  <PenTool className="w-3 h-3" />
                  <span>{requirements.required_signatures.length}</span>
                </div>
              )}
              {requirements.required_evidence.length > 0 && (
                <div className="flex items-center gap-1" title="Evidence required">
                  <Camera className="w-3 h-3" />
                  <span>{requirements.required_evidence.length}</span>
                </div>
              )}
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {getDealsByState(state).map(deal => (
                <DealCard
                  key={deal.deal_id}
                  deal={deal}
                  context={context}
                  onClick={() => onDealClick(deal)}
                  onTransition={onTransition}
                />
              ))}

              {getDealsByState(state).length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No deals
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Closed Columns */}
      <div className="flex flex-col gap-4 min-w-[280px]">
        {/* Won */}
        <div className="pipeline-column bg-emerald/5 border border-emerald/20 flex-1">
          <div className="flex items-center justify-between mb-3">
            <StateBadge state="Closed_Won" type="deal" />
            <span className="text-sm text-muted-foreground">
              ({getDealCount('Closed_Won')})
            </span>
          </div>
          <div className="text-center py-4">
            <DollarSign className="w-6 h-6 text-emerald mx-auto mb-1" />
            <p className="text-lg font-bold text-emerald">
              {formatCurrency(getTotalValue('Closed_Won'))}
            </p>
          </div>
        </div>

        {/* Lost */}
        <div className="pipeline-column bg-destructive/5 border border-destructive/20 flex-1">
          <div className="flex items-center justify-between mb-3">
            <StateBadge state="Closed_Lost" type="deal" />
            <span className="text-sm text-muted-foreground">
              ({getDealCount('Closed_Lost')})
            </span>
          </div>
          <div className="text-sm text-muted-foreground text-center py-4">
            {getDealCount('Closed_Lost')} lost
          </div>
        </div>
      </div>
    </div>
  );
}

interface DealCardProps {
  deal: Deal;
  context: ValidationContext;
  onClick: () => void;
  onTransition: (deal: Deal, targetState: DealState) => void;
}

function DealCard({ deal, context, onClick, onTransition }: DealCardProps) {
  const requirements = DEAL_STATE_REQUIREMENTS[deal.deal_state];
  const nextStates = requirements.next_states.filter(s => s !== 'Closed_Lost');

  // Check validation for primary next state
  const nextState = nextStates[0];
  const validation = nextState ? validateDealTransition(deal, nextState, context) : null;

  const formatPrice = (price?: number) => {
    if (!price) return 'TBD';
    if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M AED`;
    return `${(price / 1000).toFixed(0)}K AED`;
  };

  return (
    <div className="pipeline-card group" onClick={onClick}>
      {/* Aging Badge & Deal ID */}
      <div className="flex items-center justify-between mb-2">
        <AgingBadge 
          updatedAt={deal.updated_at} 
          thresholds={DEAL_AGING_THRESHOLDS[deal.deal_state] || DEAL_AGING_THRESHOLDS.Created} 
        />
        <span className="font-mono text-xs text-muted-foreground">
          {deal.deal_id.slice(-6)}
        </span>
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
