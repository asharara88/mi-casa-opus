-- Mi Casa CRM — Initial Schema
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text,
  email text,
  type text default 'landlord',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  name text not null,
  unit text,
  listing_type text not null check (listing_type in ('rent','sale')),
  price numeric,
  description text,
  location text,
  status text default 'available',
  bedrooms int,
  area_sqft numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  url text not null,
  storage_path text,
  media_type text default 'image',
  caption text,
  display_order int default 0,
  created_at timestamptz default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  activity_type text not null,
  body text,
  created_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();
create trigger trg_clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
