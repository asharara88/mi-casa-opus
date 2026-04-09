import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { Video, MapPin, Phone, Clock, Users, ExternalLink, MoreVertical, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMeeting, MEETING_TYPE_CONFIG, MEETING_STATUS_CONFIG } from '@/types/teams';
import { cn } from '@/lib/utils';

interface TeamMeetingCardProps {
  meeting: TeamMeeting;
  onJoin?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
}

const MeetingTypeIcon = ({ type }: { type: TeamMeeting['meeting_type'] }) => {
  switch (type) {
    case 'zoom':
    case 'video_call':
      return <Video className="w-4 h-4" />;
    case 'in_person':
      return <MapPin className="w-4 h-4" />;
    case 'phone':
      return <Phone className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

const formatMeetingDate = (date: string) => {
  const meetingDate = new Date(date);
  if (isToday(meetingDate)) return 'Today';
  if (isTomorrow(meetingDate)) return 'Tomorrow';
  return format(meetingDate, 'EEE, MMM d');
};

export function TeamMeetingCard({ 
  meeting, 
  onJoin, 
  onEdit, 
  onCancel,
  onViewDetails 
}: TeamMeetingCardProps) {
  const meetingDate = new Date(meeting.scheduled_at);
  const typeConfig = MEETING_TYPE_CONFIG[meeting.meeting_type];
  const statusConfig = MEETING_STATUS_CONFIG[meeting.status];
  const isActive = meeting.status === 'scheduled' || meeting.status === 'in_progress';
  const canJoin = isActive && (meeting.zoom_join_url || meeting.location);
  const isUpcoming = isFuture(meetingDate);

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      meeting.status === 'cancelled' && "opacity-60",
      meeting.status === 'in_progress' && "ring-2 ring-primary"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Meeting Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-lg", typeConfig.color)}>{typeConfig.icon}</span>
              <h3 className="font-semibold text-foreground truncate">{meeting.title}</h3>
              {meeting.status === 'in_progress' && (
                <Badge variant="default" className="bg-primary animate-pulse">Live</Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {formatMeetingDate(meeting.scheduled_at)}, {format(meetingDate, 'h:mm a')}
                </span>
                <span className="text-muted-foreground/60">• {meeting.duration_minutes} min</span>
              </div>
              
              {meeting.location && (
                <div className="flex items-center gap-1">
                  <MeetingTypeIcon type={meeting.meeting_type} />
                  <span className="truncate max-w-[200px]">{meeting.location}</span>
                </div>
              )}
            </div>

            {meeting.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {meeting.description}
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {canJoin && meeting.zoom_join_url && (
              <Button 
                size="sm" 
                onClick={onJoin}
                className="gap-1.5"
              >
                <Video className="w-4 h-4" />
                Join
              </Button>
            )}
            
            {isActive && !canJoin && meeting.meeting_type === 'in_person' && (
              <Badge variant="outline" className="gap-1">
                <MapPin className="w-3 h-3" />
                In Person
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDetails}>
                  View Details
                </DropdownMenuItem>
                {isUpcoming && isActive && (
                  <>
                    <DropdownMenuItem onClick={onEdit}>
                      Edit Meeting
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={onCancel}
                      className="text-destructive focus:text-destructive"
                    >
                      Cancel Meeting
                    </DropdownMenuItem>
                  </>
                )}
                {meeting.zoom_join_url && (
                  <DropdownMenuItem asChild>
                    <a 
                      href={meeting.zoom_join_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Zoom Link
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
