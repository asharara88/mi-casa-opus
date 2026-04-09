-- Enable RLS + public read for portfolio dashboard
alter table public.listings enable row level security;
alter table public.clients enable row level security;
alter table public.listing_media enable row level security;
alter table public.activity_log enable row level security;

create policy "Public can read listings"
  on public.listings for select using (true);

create policy "Public can read listing_media"
  on public.listing_media for select using (true);
