-- Create enum types for team meetings
CREATE TYPE meeting_type AS ENUM ('zoom', 'in_person', 'phone', 'video_call');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE rsvp_status AS ENUM ('pending', 'accepted', 'declined', 'tentative');

-- Create team_meetings table
CREATE TABLE public.team_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_type meeting_type NOT NULL DEFAULT 'video_call',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  location TEXT,
  zoom_meeting_id TEXT,
  zoom_join_url TEXT,
  zoom_host_url TEXT,
  organizer_id UUID NOT NULL,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  recurrence JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_meeting_participants table
CREATE TABLE public.team_meeting_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.team_meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rsvp_status rsvp_status NOT NULL DEFAULT 'pending',
  is_required BOOLEAN NOT NULL DEFAULT true,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Add unique constraint to prevent duplicate participants
ALTER TABLE public.team_meeting_participants 
ADD CONSTRAINT unique_meeting_participant UNIQUE (meeting_id, user_id);

-- Create indexes for common queries
CREATE INDEX idx_team_meetings_scheduled_at ON public.team_meetings(scheduled_at);
CREATE INDEX idx_team_meetings_organizer ON public.team_meetings(organizer_id);
CREATE INDEX idx_team_meetings_status ON public.team_meetings(status);
CREATE INDEX idx_meeting_participants_user ON public.team_meeting_participants(user_id);
CREATE INDEX idx_meeting_participants_meeting ON public.team_meeting_participants(meeting_id);

-- Enable RLS
ALTER TABLE public.team_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_meeting_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_meetings
-- Operators can manage all meetings
CREATE POLICY "Operators can manage team meetings"
ON public.team_meetings
FOR ALL
USING (has_role(auth.uid(), 'Operator'::app_role))
WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- LegalOwners and Brokers can view meetings
CREATE POLICY "LegalOwners can view team meetings"
ON public.team_meetings
FOR SELECT
USING (has_role(auth.uid(), 'LegalOwner'::app_role));

CREATE POLICY "Brokers can view team meetings"
ON public.team_meetings
FOR SELECT
USING (has_role(auth.uid(), 'Broker'::app_role));

-- Users can create their own meetings
CREATE POLICY "Users can create own meetings"
ON public.team_meetings
FOR INSERT
WITH CHECK (organizer_id = auth.uid() AND (has_role(auth.uid(), 'Broker'::app_role) OR has_role(auth.uid(), 'LegalOwner'::app_role)));

-- RLS policies for team_meeting_participants
-- Operators can manage all participants
CREATE POLICY "Operators can manage meeting participants"
ON public.team_meeting_participants
FOR ALL
USING (has_role(auth.uid(), 'Operator'::app_role))
WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- LegalOwners and Brokers can view participants
CREATE POLICY "LegalOwners can view meeting participants"
ON public.team_meeting_participants
FOR SELECT
USING (has_role(auth.uid(), 'LegalOwner'::app_role));

CREATE POLICY "Brokers can view meeting participants"
ON public.team_meeting_participants
FOR SELECT
USING (has_role(auth.uid(), 'Broker'::app_role));

-- Users can update their own RSVP
CREATE POLICY "Users can update own RSVP"
ON public.team_meeting_participants
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_team_meetings_updated_at
BEFORE UPDATE ON public.team_meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live meeting updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_meetings;