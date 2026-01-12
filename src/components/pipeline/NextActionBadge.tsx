import { format, isPast, isToday, isTomorrow, differenceInHours } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Calendar, 
  MapPin, 
  Clock,
  FileText,
  FolderOpen,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type NextActionType = Database['public']['Enums']['next_action_type'];

const ACTION_ICONS: Record<NextActionType, React.ComponentType<{ className?: string }>> = {
  Call: Phone,
  WhatsApp: MessageCircle,
  Email: Mail,
  Meeting: Calendar,
  Viewing: MapPin,
  FollowUp: Clock,
  SendOffer: FileText,
  CollectDocs: FolderOpen,
  Other: MoreHorizontal,
};

const ACTION_LABELS: Record<NextActionType, string> = {
  Call: 'Call',
  WhatsApp: 'WhatsApp',
  Email: 'Email',
  Meeting: 'Meeting',
  Viewing: 'Viewing',
  FollowUp: 'Follow Up',
  SendOffer: 'Send Offer',
  CollectDocs: 'Collect Docs',
  Other: 'Other',
};

interface NextActionBadgeProps {
  nextAction?: NextActionType | null;
  nextActionDue?: string | null;
  className?: string;
}

export function NextActionBadge({ nextAction, nextActionDue, className }: NextActionBadgeProps) {
  if (!nextAction) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="outline" 
              className={cn(
                'gap-1 text-xs border-destructive text-destructive bg-destructive/10',
                className
              )}
            >
              <AlertTriangle className="w-3 h-3" />
              No Action
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">⚠️ No next action defined</p>
            <p className="text-xs text-muted-foreground">Every record needs a next step</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const Icon = ACTION_ICONS[nextAction];
  const dueDate = nextActionDue ? new Date(nextActionDue) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);
  const isDueTomorrow = dueDate && isTomorrow(dueDate);
  const hoursRemaining = dueDate ? differenceInHours(dueDate, new Date()) : null;

  let statusColor = 'bg-muted text-muted-foreground border-border';
  let statusLabel = 'Scheduled';

  if (isOverdue) {
    statusColor = 'bg-destructive/10 text-destructive border-destructive';
    statusLabel = 'Overdue';
  } else if (isDueToday) {
    statusColor = 'bg-warning/10 text-warning border-warning';
    statusLabel = 'Due Today';
  } else if (isDueTomorrow) {
    statusColor = 'bg-primary/10 text-primary border-primary';
    statusLabel = 'Due Tomorrow';
  }

  const formatDueDate = () => {
    if (!dueDate) return 'No due date';
    if (isOverdue) return `Overdue: ${format(dueDate, 'MMM d, h:mm a')}`;
    if (isDueToday) return `Today at ${format(dueDate, 'h:mm a')}`;
    if (isDueTomorrow) return `Tomorrow at ${format(dueDate, 'h:mm a')}`;
    return format(dueDate, 'MMM d, h:mm a');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="outline" 
            className={cn('gap-1 text-xs', statusColor, className)}
          >
            <Icon className="w-3 h-3" />
            {ACTION_LABELS[nextAction]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium">{statusLabel}</p>
          <p className="text-xs text-muted-foreground">{formatDueDate()}</p>
          {hoursRemaining !== null && hoursRemaining > 0 && hoursRemaining <= 24 && (
            <p className="text-xs text-warning mt-1">
              {hoursRemaining} hours remaining
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const NEXT_ACTION_OPTIONS: { value: NextActionType; label: string }[] = [
  { value: 'Call', label: 'Call' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Email', label: 'Email' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Viewing', label: 'Viewing' },
  { value: 'FollowUp', label: 'Follow Up' },
  { value: 'SendOffer', label: 'Send Offer' },
  { value: 'CollectDocs', label: 'Collect Documents' },
  { value: 'Other', label: 'Other' },
];
