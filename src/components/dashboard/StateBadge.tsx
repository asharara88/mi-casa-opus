import { cn } from '@/lib/utils';
import { LeadState, DealState } from '@/types/bos';
import { LEAD_STATE_COLORS, DEAL_STATE_COLORS } from '@/lib/state-machine';

interface StateBadgeProps {
  state: LeadState | DealState;
  type: 'lead' | 'deal';
  size?: 'sm' | 'md';
}

export function StateBadge({ state, type, size = 'md' }: StateBadgeProps) {
  const colors = type === 'lead' 
    ? LEAD_STATE_COLORS[state as LeadState] 
    : DEAL_STATE_COLORS[state as DealState];

  const displayState = state.replace('_', ' ');

  return (
    <span
      className={cn(
        'state-badge',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' && 'text-[10px] px-2 py-0.5'
      )}
    >
      {displayState}
    </span>
  );
}
