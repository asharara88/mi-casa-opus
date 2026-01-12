-- Create next_action_type enum for allowed action types
CREATE TYPE public.next_action_type AS ENUM (
  'Call',
  'WhatsApp',
  'Email',
  'Meeting',
  'Viewing',
  'FollowUp',
  'SendOffer',
  'CollectDocs',
  'Other'
);

-- Add next-action fields to leads table
ALTER TABLE public.leads
ADD COLUMN next_action public.next_action_type,
ADD COLUMN next_action_due timestamp with time zone,
ADD COLUMN next_action_owner uuid REFERENCES auth.users(id);

-- Add next-action fields to deals table  
ALTER TABLE public.deals
ADD COLUMN next_action public.next_action_type,
ADD COLUMN next_action_due timestamp with time zone,
ADD COLUMN next_action_owner uuid REFERENCES auth.users(id);

-- Create index for finding overdue actions
CREATE INDEX idx_leads_next_action_due ON public.leads(next_action_due) WHERE next_action_due IS NOT NULL;
CREATE INDEX idx_deals_next_action_due ON public.deals(next_action_due) WHERE next_action_due IS NOT NULL;