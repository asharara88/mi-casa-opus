-- Create enum for alert types
CREATE TYPE price_alert_type AS ENUM ('new_listing', 'price_drop', 'price_increase', 'listing_removed');

-- Create table for price watch configurations
CREATE TABLE public.price_watches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  watch_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  community TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Abu Dhabi',
  portals portal_name[] NOT NULL DEFAULT ARRAY['PropertyFinder'::portal_name, 'Bayut'::portal_name, 'Dubizzle'::portal_name],
  property_type TEXT,
  min_price NUMERIC,
  max_price NUMERIC,
  bedrooms INTEGER,
  listing_type TEXT DEFAULT 'Sale',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for price snapshots (historical tracking)
CREATE TABLE public.price_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  watch_id UUID NOT NULL REFERENCES public.price_watches(id) ON DELETE CASCADE,
  portal portal_name NOT NULL,
  external_ref TEXT NOT NULL,
  title TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'AED',
  bedrooms INTEGER,
  bathrooms INTEGER,
  sqft NUMERIC,
  url TEXT,
  image_url TEXT,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(watch_id, portal, external_ref, captured_at)
);

-- Create table for price alerts
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id TEXT NOT NULL UNIQUE,
  watch_id UUID NOT NULL REFERENCES public.price_watches(id) ON DELETE CASCADE,
  alert_type price_alert_type NOT NULL,
  portal portal_name NOT NULL,
  external_ref TEXT,
  title TEXT,
  current_price NUMERIC,
  previous_price NUMERIC,
  price_change_percent NUMERIC,
  url TEXT,
  image_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for price_watches
CREATE POLICY "Authenticated users can view price watches"
  ON public.price_watches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage price watches"
  ON public.price_watches FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for price_snapshots
CREATE POLICY "Authenticated users can view price snapshots"
  ON public.price_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage price snapshots"
  ON public.price_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for price_alerts
CREATE POLICY "Authenticated users can view price alerts"
  ON public.price_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage price alerts"
  ON public.price_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger for updated_at on price_watches
CREATE TRIGGER update_price_watches_updated_at
  BEFORE UPDATE ON public.price_watches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient querying
CREATE INDEX idx_price_snapshots_watch_portal ON public.price_snapshots(watch_id, portal, external_ref);
CREATE INDEX idx_price_alerts_watch_unread ON public.price_alerts(watch_id, is_read) WHERE NOT is_dismissed;
CREATE INDEX idx_price_alerts_created ON public.price_alerts(created_at DESC);