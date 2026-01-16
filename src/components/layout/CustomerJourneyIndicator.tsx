import { UserPlus, Users, Handshake, Trophy, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  section: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  { id: 'prospect', label: 'Prospect', icon: <UserPlus className="w-4 h-4" />, section: 'prospects' },
  { id: 'lead', label: 'Lead', icon: <Users className="w-4 h-4" />, section: 'leads' },
  { id: 'deal', label: 'Deal', icon: <Handshake className="w-4 h-4" />, section: 'deals' },
  { id: 'closed', label: 'Closed', icon: <Trophy className="w-4 h-4" />, section: 'deals' },
];

interface CustomerJourneyIndicatorProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function CustomerJourneyIndicator({ activeSection, onSectionChange }: CustomerJourneyIndicatorProps) {
  // Determine which step is active based on current section
  const getActiveStepIndex = () => {
    switch (activeSection) {
      case 'prospects': return 0;
      case 'leads': return 1;
      case 'deals': return 2;
      default: return -1;
    }
  };

  const activeStepIndex = getActiveStepIndex();
  const isCustomerSection = activeStepIndex >= 0;

  if (!isCustomerSection) return null;

  return (
    <div className="hidden md:flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
      <span className="text-xs text-muted-foreground mr-2">Customer Journey:</span>
      <div className="flex items-center">
        {JOURNEY_STEPS.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isPast = index < activeStepIndex;
          const isFuture = index > activeStepIndex;
          const isLast = index === JOURNEY_STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => step.section !== 'deals' || index !== 3 ? onSectionChange(step.section) : null}
                disabled={index === 3} // "Closed" is not clickable
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all',
                  isActive && 'bg-primary text-primary-foreground shadow-sm',
                  isPast && 'bg-emerald/20 text-emerald',
                  isFuture && 'bg-muted/50 text-muted-foreground',
                  !isActive && index !== 3 && 'hover:bg-secondary cursor-pointer',
                  index === 3 && 'cursor-default'
                )}
              >
                <span className={cn(
                  'flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold',
                  isActive && 'bg-primary-foreground/20',
                  isPast && 'bg-emerald/30',
                  isFuture && 'bg-muted'
                )}>
                  {isPast ? '✓' : step.icon}
                </span>
                <span className="hidden lg:inline">{step.label}</span>
              </button>
              
              {!isLast && (
                <ChevronRight className={cn(
                  'w-4 h-4 mx-0.5',
                  isPast ? 'text-emerald' : 'text-muted-foreground/50'
                )} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="hidden xl:flex items-center gap-2 ml-4 flex-1 max-w-xs">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-emerald rounded-full transition-all duration-500"
            style={{ width: `${((activeStepIndex + 1) / JOURNEY_STEPS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {Math.round(((activeStepIndex + 1) / JOURNEY_STEPS.length) * 100)}%
        </span>
      </div>
    </div>
  );
}
