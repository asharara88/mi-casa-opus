-- Table to track portal lead inquiries before they become leads
CREATE TABLE public.portal_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id TEXT NOT NULL UNIQUE,
    portal portal_name NOT NULL,
    listing_id UUID REFERENCES public.listings(id),
    external_listing_ref TEXT,
    
    -- Inquirer details
    inquirer_name TEXT NOT NULL,
    inquirer_email TEXT,
    inquirer_phone TEXT,
    message TEXT,
    
    -- Tracking
    inquiry_type TEXT DEFAULT 'general', -- general, viewing_request, price_inquiry
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    lead_id UUID REFERENCES public.leads(id),
    
    -- Raw data for debugging
    raw_payload JSONB,
    source_type TEXT DEFAULT 'webhook', -- webhook, email_parse
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_portal_inquiries_portal ON public.portal_inquiries(portal);
CREATE INDEX idx_portal_inquiries_listing ON public.portal_inquiries(listing_id);
CREATE INDEX idx_portal_inquiries_received ON public.portal_inquiries(received_at DESC);
CREATE INDEX idx_portal_inquiries_processed ON public.portal_inquiries(processed_at) WHERE processed_at IS NULL;

-- Enable RLS
ALTER TABLE public.portal_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow authenticated users to manage inquiries
CREATE POLICY "Authenticated users can view portal inquiries"
ON public.portal_inquiries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert portal inquiries"
ON public.portal_inquiries FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update portal inquiries"
ON public.portal_inquiries FOR UPDATE
TO authenticated
USING (true);

-- Allow anon for webhook access (edge function will handle auth)
CREATE POLICY "Anon can insert portal inquiries via webhook"
ON public.portal_inquiries FOR INSERT
TO anon
WITH CHECK (true);

-- Add portal-specific source values to lead_source enum
-- First check if values exist, if not add them
DO $$
BEGIN
    -- Check if 'PropertyFinder' exists in lead_source enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'PropertyFinder' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'lead_source')
    ) THEN
        ALTER TYPE public.lead_source ADD VALUE 'PropertyFinder';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Bayut' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'lead_source')
    ) THEN
        ALTER TYPE public.lead_source ADD VALUE 'Bayut';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Dubizzle' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'lead_source')
    ) THEN
        ALTER TYPE public.lead_source ADD VALUE 'Dubizzle';
    END IF;
END$$;