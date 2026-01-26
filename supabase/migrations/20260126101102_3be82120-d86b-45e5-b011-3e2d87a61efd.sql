-- Create enum types for marketing
CREATE TYPE public.campaign_type AS ENUM ('Email', 'SMS', 'WhatsApp', 'Social', 'Display', 'Search', 'Print', 'Event');
CREATE TYPE public.campaign_status AS ENUM ('Draft', 'Active', 'Paused', 'Completed', 'Cancelled');
CREATE TYPE public.campaign_channel AS ENUM ('Email', 'SMS', 'WhatsApp', 'Instagram', 'Facebook', 'LinkedIn', 'Google', 'Bayut', 'PropertyFinder', 'Dubizzle', 'Print', 'Billboard', 'Event');
CREATE TYPE public.ad_platform AS ENUM ('Bayut', 'PropertyFinder', 'Dubizzle', 'Instagram', 'Facebook', 'LinkedIn', 'Google', 'TikTok', 'YouTube', 'Print', 'Billboard', 'Brochure');
CREATE TYPE public.ad_status AS ENUM ('Draft', 'PendingApproval', 'Active', 'Paused', 'Expired', 'Rejected');
CREATE TYPE public.permit_status AS ENUM ('NotRequired', 'Pending', 'Approved', 'Expired', 'Rejected');
CREATE TYPE public.event_type AS ENUM ('Roadshow', 'PropertyLaunch', 'Exhibition', 'Networking', 'Seminar', 'OpenHouse', 'Other');
CREATE TYPE public.event_status AS ENUM ('Planning', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'Postponed');
CREATE TYPE public.referral_type AS ENUM ('Broker', 'Developer', 'Bank', 'Agency', 'Individual', 'Corporate', 'Other');

-- Marketing Campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type campaign_type NOT NULL,
  channel campaign_channel NOT NULL,
  status campaign_status NOT NULL DEFAULT 'Draft',
  budget NUMERIC DEFAULT 0,
  spend NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  target_audience JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{"impressions": 0, "clicks": 0, "leads": 0, "conversions": 0}',
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketing Events table
CREATE TABLE public.marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type event_type NOT NULL,
  venue TEXT,
  location TEXT,
  event_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  budget NUMERIC DEFAULT 0,
  spend NUMERIC DEFAULT 0,
  expected_attendees INTEGER DEFAULT 0,
  actual_attendees INTEGER DEFAULT 0,
  registered_attendees INTEGER DEFAULT 0,
  leads_captured INTEGER DEFAULT 0,
  status event_status NOT NULL DEFAULT 'Planning',
  notes TEXT,
  organizer TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketing Ads table
CREATE TABLE public.marketing_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  platform ad_platform NOT NULL,
  type TEXT,
  status ad_status NOT NULL DEFAULT 'Draft',
  listing_id UUID REFERENCES public.listings(id),
  campaign_id UUID REFERENCES public.marketing_campaigns(id),
  dari_permit_no TEXT,
  permit_status permit_status NOT NULL DEFAULT 'NotRequired',
  permit_valid_from DATE,
  permit_valid_until DATE,
  budget NUMERIC DEFAULT 0,
  spend NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  ad_content JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referral Sources table
CREATE TABLE public.referral_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type referral_type NOT NULL,
  company_name TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  commission_percent NUMERIC DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  total_commission_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add campaign_id to prospects table
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.marketing_campaigns(id);
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.marketing_events(id);
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS referral_source_id UUID REFERENCES public.referral_sources(id);

-- Enable RLS on all tables
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_campaigns
CREATE POLICY "Operators can manage campaigns"
  ON public.marketing_campaigns FOR ALL
  USING (has_role(auth.uid(), 'Operator'))
  WITH CHECK (has_role(auth.uid(), 'Operator'));

CREATE POLICY "Authenticated users can view campaigns"
  ON public.marketing_campaigns FOR SELECT
  USING (has_role(auth.uid(), 'Operator') OR has_role(auth.uid(), 'LegalOwner') OR has_role(auth.uid(), 'Broker'));

-- RLS Policies for marketing_events
CREATE POLICY "Operators can manage events"
  ON public.marketing_events FOR ALL
  USING (has_role(auth.uid(), 'Operator'))
  WITH CHECK (has_role(auth.uid(), 'Operator'));

CREATE POLICY "Authenticated users can view events"
  ON public.marketing_events FOR SELECT
  USING (has_role(auth.uid(), 'Operator') OR has_role(auth.uid(), 'LegalOwner') OR has_role(auth.uid(), 'Broker'));

-- RLS Policies for marketing_ads
CREATE POLICY "Operators can manage ads"
  ON public.marketing_ads FOR ALL
  USING (has_role(auth.uid(), 'Operator'))
  WITH CHECK (has_role(auth.uid(), 'Operator'));

CREATE POLICY "Authenticated users can view ads"
  ON public.marketing_ads FOR SELECT
  USING (has_role(auth.uid(), 'Operator') OR has_role(auth.uid(), 'LegalOwner') OR has_role(auth.uid(), 'Broker'));

-- RLS Policies for referral_sources
CREATE POLICY "Operators can manage referral sources"
  ON public.referral_sources FOR ALL
  USING (has_role(auth.uid(), 'Operator'))
  WITH CHECK (has_role(auth.uid(), 'Operator'));

CREATE POLICY "Authenticated users can view referral sources"
  ON public.referral_sources FOR SELECT
  USING (has_role(auth.uid(), 'Operator') OR has_role(auth.uid(), 'LegalOwner') OR has_role(auth.uid(), 'Broker'));

-- Create triggers for updated_at
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_events_updated_at
  BEFORE UPDATE ON public.marketing_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_ads_updated_at
  BEFORE UPDATE ON public.marketing_ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_sources_updated_at
  BEFORE UPDATE ON public.referral_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();