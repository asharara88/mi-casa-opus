-- Create prospects table for cold outreach
CREATE TABLE public.prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source TEXT,
  city TEXT,
  crm_customer_id TEXT UNIQUE,
  crm_created_date TIMESTAMP WITH TIME ZONE,
  crm_stage TEXT DEFAULT 'Prospect',
  crm_confidence_level TEXT,
  -- Outreach tracking
  outreach_status TEXT DEFAULT 'not_contacted',
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  contact_attempts INTEGER DEFAULT 0,
  notes TEXT,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Operators and LegalOwners can view all prospects
CREATE POLICY "Operators and LegalOwners can view prospects"
ON public.prospects FOR SELECT
USING (has_role(auth.uid(), 'Operator'::app_role) OR has_role(auth.uid(), 'LegalOwner'::app_role));

-- Operators can manage prospects
CREATE POLICY "Operators can manage prospects"
ON public.prospects FOR ALL
USING (has_role(auth.uid(), 'Operator'::app_role))
WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- Brokers can view and update prospects
CREATE POLICY "Brokers can view prospects"
ON public.prospects FOR SELECT
USING (has_role(auth.uid(), 'Broker'::app_role));

CREATE POLICY "Brokers can update prospects"
ON public.prospects FOR UPDATE
USING (has_role(auth.uid(), 'Broker'::app_role));

-- Update timestamp trigger
CREATE TRIGGER update_prospects_updated_at
BEFORE UPDATE ON public.prospects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for common queries
CREATE INDEX idx_prospects_outreach_status ON public.prospects(outreach_status);
CREATE INDEX idx_prospects_confidence_level ON public.prospects(crm_confidence_level);
CREATE INDEX idx_prospects_city ON public.prospects(city);