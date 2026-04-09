
CREATE TABLE public.listing_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  file_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_media_listing_id ON public.listing_media(listing_id);

ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view listing media"
  ON public.listing_media FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can manage listing media"
  ON public.listing_media FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'Manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'Manager'::app_role));

CREATE POLICY "Brokers can insert listing media"
  ON public.listing_media FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'Broker'::app_role));
