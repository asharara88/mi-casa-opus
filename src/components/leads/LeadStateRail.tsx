import { LeadState } from '@/types/bos';
import { cn } from '@/lib/utils';
import { Check, Circle, Lock } from 'lucide-react';

interface LeadStateRailProps {
  currentState: LeadState;
  onStateClick?: (state: LeadState) => void;
}

const LEAD_STATES: LeadState[] = ['New', 'Contacted', 'Qualified', 'Converted'];

const STATE_CONFIG: Record<LeadState, { label: string; color: string }> = {
  New: { label: 'New', color: 'bg-blue-500' },
  Contacted: { label: 'Contacted', color: 'bg-amber-500' },
  Qualified: { label: 'Qualified', color: 'bg-emerald-500' },
  Disqualified: { label: 'Disqualified', color: 'bg-slate-500' },
  Converted: { label: 'Converted', color: 'bg-gold' },
};

export function LeadStateRail({ currentState, onStateClick }: LeadStateRailProps) {
  const currentIndex = LEAD_STATES.indexOf(currentState);
  const isDisqualified = currentState === 'Disqualified';

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Lead State
      </h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
        <div 
          className={cn(
            "absolute left-4 top-4 w-0.5 transition-all duration-300",
            isDisqualified ? 'bg-slate-500' : STATE_CONFIG[currentState].color
          )}
          style={{ 
            height: isDisqualified 
              ? '0%' 
              : `${(currentIndex / (LEAD_STATES.length - 1)) * 100}%` 
          }}
        />
        
        {/* State Steps */}
        <div className="relative space-y-4">
          {LEAD_STATES.map((state, index) => {
            const isPast = index < currentIndex;
            const isCurrent = state === currentState;
            const isFuture = index > currentIndex;
            const config = STATE_CONFIG[state];
            
            return (
              <button
                key={state}
                onClick={() => onStateClick?.(state)}
                disabled={isPast || isCurrent || isDisqualified}
                className={cn(
                  "flex items-center gap-3 w-full text-left transition-all group",
                  isFuture && !isDisqualified && "hover:bg-muted/50 rounded-lg p-2 -m-2"
                )}
              >
                {/* State Indicator */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all z-10",
                    isPast && `${config.color} border-transparent`,
                    isCurrent && `${config.color} border-transparent ring-4 ring-${config.color.replace('bg-', '')}/20`,
                    isFuture && "bg-background border-border group-hover:border-muted-foreground",
                    isDisqualified && "bg-muted border-border"
                  )}
                >
                  {isPast ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : isCurrent ? (
                    <Circle className="w-3 h-3 text-white fill-white" />
                  ) : (
                    <Circle className={cn(
                      "w-3 h-3",
                      isDisqualified ? "text-muted-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                  )}
                </div>
                
                {/* State Label */}
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isPast && "text-muted-foreground",
                    isCurrent && "text-foreground",
                    isFuture && "text-muted-foreground group-hover:text-foreground",
                    isDisqualified && "text-muted-foreground"
                  )}>
                    {config.label}
                  </p>
                </div>

                {/* Lock icon for future states when disqualified */}
                {isFuture && isDisqualified && (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Disqualified Banner */}
      {isDisqualified && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">Lead Disqualified</p>
          <p className="text-xs text-muted-foreground mt-1">
            This lead has been marked as disqualified and cannot progress.
          </p>
        </div>
      )}
    </div>
  );
}
