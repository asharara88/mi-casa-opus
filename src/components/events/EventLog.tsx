import { EventLogEntry } from '@/types/bos';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, User, Hash } from 'lucide-react';

interface EventLogProps {
  events: EventLogEntry[];
  maxItems?: number;
}

export function EventLog({ events, maxItems }: EventLogProps) {
  const displayEvents = maxItems ? events.slice(-maxItems).reverse() : [...events].reverse();

  return (
    <div className="space-y-0">
      {displayEvents.map((event, index) => (
        <EventLogItem key={event.event_id} event={event} isFirst={index === 0} />
      ))}
      
      {events.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No events recorded
        </div>
      )}
    </div>
  );
}

function EventLogItem({ event, isFirst }: { event: EventLogEntry; isFirst: boolean }) {
  const isAllowed = event.decision === 'ALLOWED';

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className={cn(
      'event-log-entry',
      isAllowed ? 'event-allowed' : 'event-blocked',
      isFirst && 'animate-slide-in'
    )}>
      {/* Status Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {isAllowed ? (
          <CheckCircle className="w-4 h-4 text-emerald" />
        ) : (
          <XCircle className="w-4 h-4 text-destructive" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {formatAction(event.action)}
          </span>
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            isAllowed ? 'bg-emerald/20 text-emerald' : 'bg-destructive/20 text-destructive'
          )}>
            {event.decision}
          </span>
        </div>

        {/* Entity Reference */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
          <span className="font-mono">
            {event.entity_ref.entity_type}:{event.entity_ref.entity_id}
          </span>
        </div>

        {/* Actor */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span>{event.actor_user_id}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{event.actor_role}</span>
        </div>

        {/* Block Reasons */}
        {!isAllowed && event.block_reasons.length > 0 && (
          <div className="mt-2 space-y-1">
            {event.block_reasons.map((reason, i) => (
              <div key={i} className="block-reason">
                <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* State Change */}
        {event.before && event.after && (
          <div className="mt-2 text-xs">
            <span className="text-muted-foreground">
              {JSON.stringify(event.before)} → {JSON.stringify(event.after)}
            </span>
          </div>
        )}
      </div>

      {/* Timestamp & Hash */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatTimestamp(event.timestamp)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground/50 mt-1 font-mono">
          <Hash className="w-3 h-3" />
          <span>{event.event_hash.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
}
