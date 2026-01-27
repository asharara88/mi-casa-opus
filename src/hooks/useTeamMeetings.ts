// ============================================
// TEAM MEETINGS HOOK
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  TeamMeeting, 
  TeamMeetingParticipant,
  CreateMeetingInput, 
  UpdateMeetingInput,
  MeetingFilter 
} from '@/types/teams';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, addWeeks } from 'date-fns';

// Generate unique meeting ID
const generateMeetingId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `MTG-${timestamp}${random}`;
};

// Filter meetings based on date range
const applyDateFilter = (query: any, filter: MeetingFilter) => {
  const now = new Date();
  
  switch (filter) {
    case 'today':
      return query
        .gte('scheduled_at', startOfDay(now).toISOString())
        .lte('scheduled_at', endOfDay(now).toISOString());
    case 'week':
      return query
        .gte('scheduled_at', startOfWeek(now).toISOString())
        .lte('scheduled_at', endOfWeek(now).toISOString());
    case 'upcoming':
      return query.gte('scheduled_at', now.toISOString());
    case 'past':
      return query.lt('scheduled_at', now.toISOString());
    default:
      return query;
  }
};

export function useTeamMeetings(filter: MeetingFilter = 'all') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all meetings
  const { data: meetings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['team-meetings', filter],
    queryFn: async () => {
      let query = supabase
        .from('team_meetings')
        .select('*')
        .order('scheduled_at', { ascending: true });
      
      query = applyDateFilter(query, filter);
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TeamMeeting[];
    },
    enabled: !!user,
  });

  // Fetch participants for a meeting
  const fetchParticipants = async (meetingId: string): Promise<TeamMeetingParticipant[]> => {
    const { data, error } = await supabase
      .from('team_meeting_participants')
      .select('*')
      .eq('meeting_id', meetingId);
    
    if (error) throw error;
    return data as TeamMeetingParticipant[];
  };

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (input: CreateMeetingInput) => {
      if (!user) throw new Error('Not authenticated');

      const meetingData = {
        meeting_id: generateMeetingId(),
        title: input.title,
        description: input.description || null,
        meeting_type: input.meeting_type,
        scheduled_at: input.scheduled_at,
        duration_minutes: input.duration_minutes,
        location: input.location || null,
        zoom_join_url: input.zoom_join_url || null,
        organizer_id: user.id,
        status: 'scheduled' as const,
      };

      const { data: meeting, error: meetingError } = await supabase
        .from('team_meetings')
        .insert(meetingData)
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Add participants if provided
      if (input.participant_ids && input.participant_ids.length > 0) {
        const participants = input.participant_ids.map(userId => ({
          meeting_id: meeting.id,
          user_id: userId,
          rsvp_status: 'pending' as const,
          is_required: true,
        }));

        const { error: participantsError } = await supabase
          .from('team_meeting_participants')
          .insert(participants);

        if (participantsError) throw participantsError;
      }

      return meeting as TeamMeeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-meetings'] });
      toast.success('Meeting created successfully');
    },
    onError: (error) => {
      console.error('Failed to create meeting:', error);
      toast.error('Failed to create meeting');
    },
  });

  // Update meeting mutation
  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMeetingInput }) => {
      const { data: meeting, error } = await supabase
        .from('team_meetings')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return meeting as TeamMeeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-meetings'] });
      toast.success('Meeting updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update meeting:', error);
      toast.error('Failed to update meeting');
    },
  });

  // Cancel meeting mutation
  const cancelMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_meetings')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-meetings'] });
      toast.success('Meeting cancelled');
    },
    onError: (error) => {
      console.error('Failed to cancel meeting:', error);
      toast.error('Failed to cancel meeting');
    },
  });

  // Delete meeting mutation
  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-meetings'] });
      toast.success('Meeting deleted');
    },
    onError: (error) => {
      console.error('Failed to delete meeting:', error);
      toast.error('Failed to delete meeting');
    },
  });

  // Update RSVP
  const updateRsvpMutation = useMutation({
    mutationFn: async ({ meetingId, status }: { meetingId: string; status: TeamMeetingParticipant['rsvp_status'] }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('team_meeting_participants')
        .update({ 
          rsvp_status: status,
          responded_at: new Date().toISOString(),
        })
        .eq('meeting_id', meetingId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-meetings'] });
      toast.success('RSVP updated');
    },
    onError: (error) => {
      console.error('Failed to update RSVP:', error);
      toast.error('Failed to update RSVP');
    },
  });

  return {
    meetings,
    isLoading,
    error,
    refetch,
    fetchParticipants,
    createMeeting: createMeetingMutation.mutateAsync,
    updateMeeting: updateMeetingMutation.mutateAsync,
    cancelMeeting: cancelMeetingMutation.mutateAsync,
    deleteMeeting: deleteMeetingMutation.mutateAsync,
    updateRsvp: updateRsvpMutation.mutateAsync,
    isCreating: createMeetingMutation.isPending,
    isUpdating: updateMeetingMutation.isPending,
  };
}
