-- Create portal_name enum
CREATE TYPE portal_name AS ENUM ('PropertyFinder', 'Bayut', 'Dubizzle');

-- Create portal_status enum
CREATE TYPE portal_status AS ENUM ('pending', 'published', 'paused', 'removed', 'error');

-- Create portal_publications table
CREATE TABLE public.portal_publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  portal portal_name NOT NULL,
  status portal_status NOT NULL DEFAULT 'pending',
  external_ref TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  portal_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, portal)
);

-- Enable RLS
ALTER TABLE public.portal_publications ENABLE ROW LEVEL SECURITY;

-- RLS policies (allow authenticated users full access for now)
CREATE POLICY "Authenticated users can view portal publications"
  ON public.portal_publications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert portal publications"
  ON public.portal_publications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update portal publications"
  ON public.portal_publications FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete portal publications"
  ON public.portal_publications FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_portal_publications_updated_at
  BEFORE UPDATE ON public.portal_publications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-update portal publications when listing status changes
CREATE OR REPLACE FUNCTION public.sync_portal_status_on_listing_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If listing becomes Sold or Rented, mark portal publications for removal
  IF NEW.status IN ('Sold', 'Rented') AND OLD.status NOT IN ('Sold', 'Rented') THEN
    UPDATE public.portal_publications
    SET status = 'removed', updated_at = now()
    WHERE listing_id = NEW.id AND status IN ('published', 'pending', 'paused');
  END IF;
  
  -- If listing becomes Draft from Active, pause portal publications
  IF NEW.status = 'Draft' AND OLD.status = 'Active' THEN
    UPDATE public.portal_publications
    SET status = 'paused', updated_at = now()
    WHERE listing_id = NEW.id AND status = 'published';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to listings table
CREATE TRIGGER sync_portal_status_trigger
  AFTER UPDATE OF status ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_portal_status_on_listing_change();