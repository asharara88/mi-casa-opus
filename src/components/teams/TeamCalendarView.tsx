import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Video, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTeamMeetings } from '@/hooks/useTeamMeetings';
import { TeamMeeting, MEETING_TYPE_CONFIG } from '@/types/teams';
import { cn } from '@/lib/utils';

interface TeamCalendarViewProps {
  onMeetingClick: (meeting: TeamMeeting) => void;
}

export function TeamCalendarView({ onMeetingClick }: TeamCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { meetings } = useTeamMeetings('all');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get meetings for a specific day
  const getMeetingsForDay = (day: Date) => {
    return meetings.filter(meeting => 
      isSameDay(new Date(meeting.scheduled_at), day)
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate start padding (days from previous month to show)
  const startDayOfWeek = monthStart.getDay();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for padding */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 p-1 bg-muted/30 rounded" />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const dayMeetings = getMeetingsForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "h-24 p-1 rounded border overflow-hidden",
                  isCurrentDay ? "bg-primary/5 border-primary" : "bg-background border-border hover:bg-muted/50",
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isCurrentDay ? "text-primary" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </div>
                <ScrollArea className="h-16">
                  <div className="space-y-0.5">
                    {dayMeetings.slice(0, 3).map((meeting) => {
                      const typeConfig = MEETING_TYPE_CONFIG[meeting.meeting_type];
                      return (
                        <button
                          key={meeting.id}
                          onClick={() => onMeetingClick(meeting)}
                          className={cn(
                            "w-full text-left text-xs p-1 rounded truncate",
                            meeting.status === 'cancelled' 
                              ? "bg-muted text-muted-foreground line-through"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          )}
                          title={meeting.title}
                        >
                          <span className="mr-1">{typeConfig.icon}</span>
                          <span className="font-medium">{format(new Date(meeting.scheduled_at), 'HH:mm')}</span>
                          {' '}
                          {meeting.title}
                        </button>
                      );
                    })}
                    {dayMeetings.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-1">
                        +{dayMeetings.length - 3} more
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
