-- Create enum for communication channels
CREATE TYPE public.communication_channel AS ENUM ('whatsapp', 'sms', 'email');

-- Create enum for message direction
CREATE TYPE public.message_direction AS ENUM ('outbound', 'inbound');

-- Create enum for message status
CREATE TYPE public.message_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');

-- Create enum for viewing booking status
CREATE TYPE public.viewing_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled');

-- Create communication_logs table
CREATE TABLE public.communication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('prospect', 'lead', 'deal')),
  entity_id UUID NOT NULL,
  channel public.communication_channel NOT NULL,
  direction public.message_direction NOT NULL DEFAULT 'outbound',
  template_used TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  status public.message_status NOT NULL DEFAULT 'pending',
  external_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create viewing_bookings table
CREATE TABLE public.viewing_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cal_booking_id TEXT,
  deal_id UUID REFERENCES public.deals(id),
  prospect_id UUID REFERENCES public.prospects(id),
  listing_id UUID REFERENCES public.listings(id),
  agent_id UUID,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status public.viewing_status NOT NULL DEFAULT 'scheduled',
  location TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  confirmation_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_reason TEXT
);

-- Add columns to signature_envelopes for DocuSign integration
ALTER TABLE public.signature_envelopes 
ADD COLUMN IF NOT EXISTS docusign_envelope_id TEXT,
ADD COLUMN IF NOT EXISTS docusign_status TEXT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS voided_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS void_reason TEXT;

-- Enable RLS on communication_logs
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on viewing_bookings
ALTER TABLE public.viewing_bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for communication_logs
CREATE POLICY "Operators can manage communication logs"
ON public.communication_logs
FOR ALL
USING (has_role(auth.uid(), 'Operator'::app_role))
WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

CREATE POLICY "Brokers can view communication logs"
ON public.communication_logs
FOR SELECT
USING (has_role(auth.uid(), 'Broker'::app_role));

CREATE POLICY "Brokers can create communication logs"
ON public.communication_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'Broker'::app_role));

CREATE POLICY "LegalOwners can view communication logs"
ON public.communication_logs
FOR SELECT
USING (has_role(auth.uid(), 'LegalOwner'::app_role));

-- RLS policies for viewing_bookings
CREATE POLICY "Operators can manage viewing bookings"
ON public.viewing_bookings
FOR ALL
USING (has_role(auth.uid(), 'Operator'::app_role))
WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

CREATE POLICY "Brokers can view viewing bookings"
ON public.viewing_bookings
FOR SELECT
USING (has_role(auth.uid(), 'Broker'::app_role));

CREATE POLICY "Brokers can create viewing bookings"
ON public.viewing_bookings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'Broker'::app_role));

CREATE POLICY "LegalOwners can view viewing bookings"
ON public.viewing_bookings
FOR SELECT
USING (has_role(auth.uid(), 'LegalOwner'::app_role));

-- Add indexes for performance
CREATE INDEX idx_communication_logs_entity ON public.communication_logs(entity_type, entity_id);
CREATE INDEX idx_communication_logs_channel ON public.communication_logs(channel);
CREATE INDEX idx_communication_logs_status ON public.communication_logs(status);
CREATE INDEX idx_communication_logs_created_at ON public.communication_logs(created_at DESC);

CREATE INDEX idx_viewing_bookings_deal ON public.viewing_bookings(deal_id);
CREATE INDEX idx_viewing_bookings_prospect ON public.viewing_bookings(prospect_id);
CREATE INDEX idx_viewing_bookings_listing ON public.viewing_bookings(listing_id);
CREATE INDEX idx_viewing_bookings_scheduled ON public.viewing_bookings(scheduled_at);
CREATE INDEX idx_viewing_bookings_status ON public.viewing_bookings(status);

-- Add trigger for updated_at on viewing_bookings
CREATE TRIGGER update_viewing_bookings_updated_at
BEFORE UPDATE ON public.viewing_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();