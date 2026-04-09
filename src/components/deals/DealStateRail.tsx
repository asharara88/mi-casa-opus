import React from 'react';
import { DealState, DEAL_STATE_REQUIREMENTS } from '@/types/bos';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Lock, ChevronRight } from 'lucide-react';

interface DealStateRailProps {
  currentState: DealState;
  onStateClick?: (state: DealState) => void;
  canTransition?: (state: DealState) => boolean;
}

const DEAL_STATES: DealState[] = [
  'Created',
  'Qualified',
  'Viewing',
  'Offer',
  'Reservation',
  'SPA',
  'Closed_Won',
];

const STATE_CONFIG: Record<DealState, { label: string; description: string }> = {
  Created: { label: 'Created', description: 'Deal initiated from lead' },
  Qualified: { label: 'Qualified', description: 'Requirements confirmed' },
  Viewing: { label: 'Viewing', description: 'Property viewings scheduled' },
  Offer: { label: 'Offer', description: 'Offer submitted' },
  Reservation: { label: 'Reserved', description: 'Deposit paid, property reserved' },
  SPA: { label: 'SPA', description: 'Sale agreement in progress' },
  Closed_Won: { label: 'Closed', description: 'Deal successfully completed' },
  Closed_Lost: { label: 'Lost', description: 'Deal did not proceed' },
};

export const DealStateRail: React.FC<DealStateRailProps> = ({
  currentState,
  onStateClick,
  canTransition,
}) => {
  const currentIndex = DEAL_STATES.indexOf(currentState);

  const getStateStatus = (state: DealState, index: number) => {
    if (currentState === 'Closed_Lost') return 'lost';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    if (index === currentIndex + 1) return 'next';
    return 'future';
  };

  return (
    <div className="space-y-1">
      {DEAL_STATES.map((state, index) => {
        const status = getStateStatus(state, index);
        const config = STATE_CONFIG[state];
        const requirements = DEAL_STATE_REQUIREMENTS[state];
        const isClickable = onStateClick && (status === 'next' || status === 'current');
        const canMove = canTransition ? canTransition(state) : false;

        return (
          <div
            key={state}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-all',
              status === 'completed' && 'bg-emerald/10',
              status === 'current' && 'bg-primary/10 border border-primary/30',
              status === 'next' && 'bg-muted/50 hover:bg-muted',
              status === 'future' && 'opacity-50',
              status === 'lost' && 'bg-destructive/10',
              isClickable && canMove && 'cursor-pointer hover:bg-primary/20'
            )}
            onClick={() => isClickable && canMove && onStateClick?.(state)}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-emerald" />
              ) : status === 'current' ? (
                <Circle className="w-5 h-5 text-primary fill-primary" />
              ) : status === 'next' && canMove ? (
                <ChevronRight className="w-5 h-5 text-primary" />
              ) : (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'font-medium text-sm',
                  status === 'current' && 'text-primary',
                  status === 'completed' && 'text-emerald',
                  (status === 'future' || status === 'next') && 'text-muted-foreground'
                )}>
                  {config.label}
                </span>
                {status === 'current' && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {config.description}
              </p>
            </div>

            {/* Requirements Count */}
            {status === 'next' && requirements && (
              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-muted-foreground">
                  {requirements.required_documents.length > 0 && (
                    <span className="mr-2">📄 {requirements.required_documents.length}</span>
                  )}
                  {requirements.required_signatures.length > 0 && (
                    <span className="mr-2">✍️ {requirements.required_signatures.length}</span>
                  )}
                  {requirements.required_evidence.length > 0 && (
                    <span>📷 {requirements.required_evidence.length}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Closed Lost Option */}
      {currentState !== 'Closed_Won' && currentState !== 'Closed_Lost' && (
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg mt-4 border border-destructive/30 bg-destructive/5',
            onStateClick && 'cursor-pointer hover:bg-destructive/10'
          )}
          onClick={() => onStateClick?.('Closed_Lost')}
        >
          <Lock className="w-5 h-5 text-destructive" />
          <div>
            <span className="font-medium text-sm text-destructive">Mark as Lost</span>
            <p className="text-xs text-muted-foreground">Close deal without completion</p>
          </div>
        </div>
      )}
    </div>
  );
};
