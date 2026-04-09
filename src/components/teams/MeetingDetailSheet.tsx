import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Video, Users, Link as LinkIcon, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TeamMeeting, MEETING_TYPE_CONFIG, MEETING_STATUS_CONFIG } from '@/types/teams';

interface MeetingDetailSheetProps {
  meeting: TeamMeeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onCancel?: () => void;
}

export function MeetingDetailSheet({ 
  meeting, 
  open, 
  onOpenChange,
  onEdit,
  onCancel 
}: MeetingDetailSheetProps) {
  if (!meeting) return null;

  const typeConfig = MEETING_TYPE_CONFIG[meeting.meeting_type];
  const statusConfig = MEETING_STATUS_CONFIG[meeting.status];
  const meetingDate = new Date(meeting.scheduled_at);
  const isActive = meeting.status === 'scheduled' || meeting.status === 'in_progress';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <span className="text-xl">{typeConfig.icon}</span>
                {meeting.title}
              </SheetTitle>
              <SheetDescription className="mt-1">
                Meeting ID: {meeting.meeting_id}
              </SheetDescription>
            </div>
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-foreground">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span>{format(meetingDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>
                {format(meetingDate, 'h:mm a')} • {meeting.duration_minutes} minutes
              </span>
            </div>
          </div>

          <Separator />

          {/* Location / Meeting Link */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {meeting.meeting_type === 'in_person' ? 'Location' : 'Meeting Details'}
            </h4>
            
            {meeting.meeting_type === 'in_person' && meeting.location && (
              <div className="flex items-center gap-3 text-foreground">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span>{meeting.location}</span>
              </div>
            )}

            {(meeting.meeting_type === 'zoom' || meeting.meeting_type === 'video_call') && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-foreground">
                  <Video className="w-5 h-5 text-muted-foreground" />
                  <span>{typeConfig.label}</span>
                </div>
                {meeting.zoom_join_url && (
                  <a 
                    href={meeting.zoom_join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline text-sm ml-8"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Join Meeting
                  </a>
                )}
              </div>
            )}

            {meeting.meeting_type === 'phone' && (
              <div className="flex items-center gap-3 text-foreground">
                <Video className="w-5 h-5 text-muted-foreground" />
                <span>Phone Call</span>
              </div>
            )}
          </div>

          {/* Description */}
          {meeting.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Agenda
                </h4>
                <p className="text-foreground whitespace-pre-wrap">{meeting.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            {meeting.zoom_join_url && isActive && (
              <Button asChild className="flex-1">
                <a href={meeting.zoom_join_url} target="_blank" rel="noopener noreferrer">
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </a>
              </Button>
            )}
            
            {isActive && (
              <>
                <Button variant="outline" onClick={onEdit}>
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
