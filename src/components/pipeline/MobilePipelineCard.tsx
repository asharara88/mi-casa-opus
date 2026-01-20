import { useState } from 'react';
import { 
  ChevronRight, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PipelineType } from './MobilePipelineView';

interface MobilePipelineCardProps {
  id: string;
  type: PipelineType;
  title: string;
  subtitle: string;
  state: string;
  stateLabel: string;
  value?: number;
  nextAction?: { type: string; due?: string } | null;
  onClick: () => void;
  onStateTransition?: (newState: string) => void;
  onSetNextAction?: () => void;
  availableStates: string[];
  stateLabels?: Record<string, string>;
}

const STATE_COLORS: Record<string, string> = {
  // Lead states
  New: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  Contacted: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  Qualified: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  Converted: 'bg-primary/10 text-primary border-primary/30',
  Disqualified: 'bg-muted text-muted-foreground border-muted',
  // Deal states
  Created: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
  Viewing: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
  Offer: 'bg-violet-500/10 text-violet-500 border-violet-500/30',
  Reservation: 'bg-pink-500/10 text-pink-500 border-pink-500/30',
  SPA: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
  ClosedWon: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  ClosedLost: 'bg-destructive/10 text-destructive border-destructive/30',
  // Off-plan states
  LeadQualified: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  EOISubmitted: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  EOIPaid: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  SPASigned: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  PaymentPlan: 'bg-violet-500/10 text-violet-500 border-violet-500/30',
  Construction: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
  Handover: 'bg-pink-500/10 text-pink-500 border-pink-500/30',
};

const NEXT_ACTION_ICONS: Record<string, typeof Phone> = {
  Call: Phone,
  WhatsApp: MessageCircle,
  Email: Mail,
  Meeting: Calendar,
  Viewing: Calendar,
  FollowUp: Calendar,
};

export function MobilePipelineCard({
  id,
  type,
  title,
  subtitle,
  state,
  stateLabel,
  value,
  nextAction,
  onClick,
  onStateTransition,
  onSetNextAction,
  availableStates,
  stateLabels,
}: MobilePipelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M AED`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K AED`;
    return `${val} AED`;
  };

  const stateColor = STATE_COLORS[state] || 'bg-muted text-muted-foreground border-muted';
  const NextActionIcon = nextAction?.type ? NEXT_ACTION_ICONS[nextAction.type] || Calendar : null;

  const currentStateIndex = availableStates.indexOf(state);
  const nextState = currentStateIndex < availableStates.length - 1 
    ? availableStates[currentStateIndex + 1] 
    : null;

  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden transition-all",
        "active:scale-[0.98] touch-manipulation"
      )}
    >
      {/* Main Content - Clickable */}
      <button
        onClick={onClick}
        className="w-full p-4 text-left flex items-center gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn("shrink-0 text-xs", stateColor)}>
              {stateLabel}
            </Badge>
            {value && value > 0 && (
              <span className="text-xs font-medium text-primary">
                {formatCurrency(value)}
              </span>
            )}
          </div>
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          <p className="text-sm text-foreground/65 truncate">{subtitle}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </button>

      {/* Quick Actions Bar */}
      <div className="px-4 pb-3 flex items-center gap-2">
        {/* Next Action Badge */}
        {nextAction && NextActionIcon && (
          <Badge 
            variant="outline" 
            className="bg-primary/5 border-primary/20 text-primary gap-1"
          >
            <NextActionIcon className="w-3 h-3" />
            <span className="text-xs">{nextAction.type}</span>
            {nextAction.due && (
              <span className="text-xs opacity-70">
                • {new Date(nextAction.due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </Badge>
        )}

        <div className="flex-1" />

        {/* Quick State Transition */}
        {nextState && onStateTransition && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onStateTransition(nextState);
            }}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            {stateLabels?.[nextState] || nextState}
          </Button>
        )}

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onSetNextAction && (
              <DropdownMenuItem onClick={onSetNextAction}>
                <Calendar className="w-4 h-4 mr-2" />
                Set Next Action
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onClick}>
              <ChevronRight className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {onStateTransition && (
              <>
                <DropdownMenuSeparator />
                {availableStates
                  .filter(s => s !== state)
                  .slice(0, 4)
                  .map(s => (
                    <DropdownMenuItem 
                      key={s} 
                      onClick={() => onStateTransition(s)}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Move to {stateLabels?.[s] || s}
                    </DropdownMenuItem>
                  ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
