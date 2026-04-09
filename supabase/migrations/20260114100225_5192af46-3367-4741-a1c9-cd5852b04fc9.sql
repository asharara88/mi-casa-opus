-- Add indexes for common query patterns (constraint already exists)
CREATE INDEX IF NOT EXISTS idx_prospects_email ON public.prospects(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_phone ON public.prospects(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_crm_stage ON public.prospects(crm_stage);
CREATE INDEX IF NOT EXISTS idx_prospects_crm_confidence_level ON public.prospects(crm_confidence_level);
CREATE INDEX IF NOT EXISTS idx_prospects_source ON public.prospects(source);
CREATE INDEX IF NOT EXISTS idx_prospects_outreach_status ON public.prospects(outreach_status);