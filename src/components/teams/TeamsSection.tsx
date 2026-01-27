import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Video } from 'lucide-react';
import { TeamMeetingsList } from './TeamMeetingsList';
import { TeamCalendarView } from './TeamCalendarView';
import { TeamDirectoryList } from './TeamDirectoryList';
import { AddMeetingModal } from './AddMeetingModal';
import { MeetingDetailSheet } from './MeetingDetailSheet';
import { TeamMeeting } from '@/types/teams';
import { useTeamMeetings } from '@/hooks/useTeamMeetings';

interface TeamsSectionProps {
  initialTab?: 'meetings' | 'calendar' | 'directory';
}

export function TeamsSection({ initialTab = 'meetings' }: TeamsSectionProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<TeamMeeting | null>(null);
  const [viewingMeeting, setViewingMeeting] = useState<TeamMeeting | null>(null);
  
  const { cancelMeeting } = useTeamMeetings();

  const handleAddMeeting = () => {
    setEditingMeeting(null);
    setIsAddModalOpen(true);
  };

  const handleEditMeeting = (meeting: TeamMeeting) => {
    setViewingMeeting(null);
    setEditingMeeting(meeting);
    setIsAddModalOpen(true);
  };

  const handleViewDetails = (meeting: TeamMeeting) => {
    setViewingMeeting(meeting);
  };

  const handleCancelMeeting = async () => {
    if (viewingMeeting && confirm(`Are you sure you want to cancel "${viewingMeeting.title}"?`)) {
      await cancelMeeting(viewingMeeting.id);
      setViewingMeeting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="meetings" className="gap-2">
            <Video className="w-4 h-4" />
            Meetings
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="directory" className="gap-2">
            <Users className="w-4 h-4" />
            Directory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="mt-6">
          <TeamMeetingsList
            onAddMeeting={handleAddMeeting}
            onEditMeeting={handleEditMeeting}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <TeamCalendarView onMeetingClick={handleViewDetails} />
        </TabsContent>

        <TabsContent value="directory" className="mt-6">
          <TeamDirectoryList />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Meeting Modal */}
      <AddMeetingModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        editMeeting={editingMeeting}
      />

      {/* Meeting Detail Sheet */}
      <MeetingDetailSheet
        meeting={viewingMeeting}
        open={!!viewingMeeting}
        onOpenChange={(open) => !open && setViewingMeeting(null)}
        onEdit={() => viewingMeeting && handleEditMeeting(viewingMeeting)}
        onCancel={handleCancelMeeting}
      />
    </div>
  );
}
