// ============================================
// TEAM MEETINGS TYPES
// ============================================

export type MeetingType = 'zoom' | 'in_person' | 'phone' | 'video_call';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface TeamMeeting {
  id: string;
  meeting_id: string;
  title: string;
  description: string | null;
  meeting_type: MeetingType;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  zoom_meeting_id: string | null;
  zoom_join_url: string | null;
  zoom_host_url: string | null;
  organizer_id: string;
  status: MeetingStatus;
  recurrence: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  rsvp_status: RsvpStatus;
  is_required: boolean;
  invited_at: string;
  responded_at: string | null;
}

export interface MeetingWithParticipants extends TeamMeeting {
  participants: TeamMeetingParticipant[];
}

export interface CreateMeetingInput {
  title: string;
  description?: string;
  meeting_type: MeetingType;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  zoom_join_url?: string;
  participant_ids?: string[];
}

export interface UpdateMeetingInput {
  title?: string;
  description?: string;
  meeting_type?: MeetingType;
  scheduled_at?: string;
  duration_minutes?: number;
  location?: string;
  zoom_join_url?: string;
  status?: MeetingStatus;
}

// UI helper types
export type MeetingFilter = 'all' | 'today' | 'week' | 'upcoming' | 'past';

export interface MeetingTypeConfig {
  value: MeetingType;
  label: string;
  icon: string;
  color: string;
}

export const MEETING_TYPE_CONFIG: Record<MeetingType, MeetingTypeConfig> = {
  zoom: { value: 'zoom', label: 'Zoom', icon: '🎥', color: 'text-blue-500' },
  video_call: { value: 'video_call', label: 'Video Call', icon: '📹', color: 'text-purple-500' },
  in_person: { value: 'in_person', label: 'In Person', icon: '📍', color: 'text-green-500' },
  phone: { value: 'phone', label: 'Phone Call', icon: '📞', color: 'text-orange-500' },
};

export const MEETING_STATUS_CONFIG: Record<MeetingStatus, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export const RSVP_STATUS_CONFIG: Record<RsvpStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800' },
  tentative: { label: 'Maybe', color: 'bg-blue-100 text-blue-800' },
};
