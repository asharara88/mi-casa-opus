import { useState } from 'react';
import { format, isToday, isTomorrow, startOfDay } from 'date-fns';
import { Plus, Search, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamMeetingCard } from './TeamMeetingCard';
import { useTeamMeetings } from '@/hooks/useTeamMeetings';
import { TeamMeeting, MeetingFilter } from '@/types/teams';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamMeetingsListProps {
  onAddMeeting: () => void;
  onEditMeeting: (meeting: TeamMeeting) => void;
  onViewDetails: (meeting: TeamMeeting) => void;
}

export function TeamMeetingsList({ 
  onAddMeeting, 
  onEditMeeting,
  onViewDetails 
}: TeamMeetingsListProps) {
  const [filter, setFilter] = useState<MeetingFilter>('upcoming');
  const [search, setSearch] = useState('');
  
  const { meetings, isLoading, cancelMeeting } = useTeamMeetings(filter);

  // Filter by search
  const filteredMeetings = meetings.filter(meeting => 
    meeting.title.toLowerCase().includes(search.toLowerCase()) ||
    meeting.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Group meetings by date
  const groupedMeetings = filteredMeetings.reduce((groups, meeting) => {
    const date = startOfDay(new Date(meeting.scheduled_at)).toISOString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(meeting);
    return groups;
  }, {} as Record<string, TeamMeeting[]>);

  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const handleJoin = (meeting: TeamMeeting) => {
    if (meeting.zoom_join_url) {
      window.open(meeting.zoom_join_url, '_blank');
    }
  };

  const handleCancel = async (meeting: TeamMeeting) => {
    if (confirm(`Are you sure you want to cancel "${meeting.title}"?`)) {
      await cancelMeeting(meeting.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onAddMeeting} className="gap-2">
          <Plus className="w-4 h-4" />
          New Meeting
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as MeetingFilter)}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Meetings List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No meetings found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? 'Try a different search term' : 'Schedule your first team meeting'}
          </p>
          {!search && (
            <Button onClick={onAddMeeting} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Schedule Meeting
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMeetings)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dateMeetings]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {formatGroupDate(date)}
                </h3>
                <div className="space-y-2">
                  {dateMeetings.map((meeting) => (
                    <TeamMeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onJoin={() => handleJoin(meeting)}
                      onEdit={() => onEditMeeting(meeting)}
                      onCancel={() => handleCancel(meeting)}
                      onViewDetails={() => onViewDetails(meeting)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
