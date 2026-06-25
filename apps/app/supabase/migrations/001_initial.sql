-- Swiss Trails — Supabase Initial Migration
-- Run this in your Supabase SQL editor or via `supabase db push`

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy search

-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────
create type user_role as enum ('user', 'admin');
create type location_category as enum (
  'hidden-lake', 'viewpoint', 'waterfall', 'gorge',
  'sunset-spot', 'night-sky', 'road-trip', 'photo-spot',
  'forest', 'glacier', 'alpine-meadow', 'river'
);
create type difficulty as enum ('easy', 'moderate', 'challenging', 'expert');
create type region as enum (
  'bern', 'zurich', 'graubunden', 'valais', 'lucerne',
  'uri', 'ticino', 'st-gallen', 'appenzell', 'fribourg',
  'vaud', 'obwalden'
);
create type season as enum ('spring', 'summer', 'autumn', 'winter', 'year-round');
create type purchase_status as enum ('pending', 'completed', 'refunded');

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
create table profiles (
  id                  uuid primary key default uuid_generate_v4(),
  email               text unique not null,
  name                text,
  avatar_url          text,
  role                user_role not null default 'user',
  has_purchased       boolean not null default false,
  purchased_at        timestamptz,
  stripe_customer_id  text unique,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-create profile on auth user creation
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

-- ─────────────────────────────────────────────
-- LOCATIONS
-- ─────────────────────────────────────────────
create table locations (
  id                    uuid primary key default uuid_generate_v4(),
  slug                  text unique not null,
  name                  text not null,
  tagline               text not null,
  description           text not null,
  long_description      text,
  category              location_category not null,
  difficulty            difficulty not null,
  region                region not null,
  lat                   double precision not null,
  lng                   double precision not null,
  hero_image_url        text not null,
  hero_image_alt        text not null,
  tags                  text[] not null default '{}',
  best_season           season[] not null default '{}',
  travel_time_minutes   integer not null,
  visit_duration_min    integer not null,
  visit_duration_max    integer not null,
  highlights            text[] not null default '{}',
  tips                  text[] not null default '{}',
  what_to_bring         text[] not null default '{}',
  access_info           text not null,
  parking_available     boolean not null default false,
  public_transport      boolean not null default false,
  elevation             integer,
  distance_km           double precision,
  is_featured           boolean not null default false,
  is_published          boolean not null default false,
  view_count            integer not null default 0,
  save_count            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index locations_category_idx on locations(category);
create index locations_region_idx on locations(region);
create index locations_difficulty_idx on locations(difficulty);
create index locations_featured_idx on locations(is_featured) where is_featured = true;
create index locations_published_idx on locations(is_published) where is_published = true;
create index locations_name_trgm on locations using gin(name gin_trgm_ops);

create trigger locations_updated_at
  before update on locations
  for each row execute procedure update_updated_at();

-- ─────────────────────────────────────────────
-- LOCATION IMAGES
-- ─────────────────────────────────────────────
create table location_images (
  id          uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  url         text not null,
  alt         text not null,
  width       integer,
  height      integer,
  credit      text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index location_images_location_idx on location_images(location_id);

-- ─────────────────────────────────────────────
-- FAVORITES
-- ─────────────────────────────────────────────
create table favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, location_id)
);

create index favorites_user_idx on favorites(user_id);
create index favorites_location_idx on favorites(location_id);

-- Update save_count when favorited/unfavorited
create or replace function update_location_save_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update locations set save_count = save_count + 1 where id = new.location_id;
  elsif tg_op = 'DELETE' then
    update locations set save_count = greatest(0, save_count - 1) where id = old.location_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger favorites_save_count
  after insert or delete on favorites
  for each row execute procedure update_location_save_count();

-- ─────────────────────────────────────────────
-- PURCHASES
-- ─────────────────────────────────────────────
create table purchases (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid not null references profiles(id) on delete cascade,
  stripe_session_id         text unique not null,
  stripe_payment_intent_id  text unique,
  amount                    numeric(10, 2) not null,
  currency                  text not null default 'chf',
  status                    purchase_status not null default 'pending',
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index purchases_user_idx on purchases(user_id);
create index purchases_status_idx on purchases(status);

create trigger purchases_updated_at
  before update on purchases
  for each row execute procedure update_updated_at();

-- ─────────────────────────────────────────────
-- TESTIMONIALS
-- ─────────────────────────────────────────────
create table testimonials (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  age              integer,
  city             text not null,
  country          text not null default 'Switzerland',
  avatar_url       text,
  content          text not null,
  rating           integer not null default 5 check (rating between 1 and 5),
  is_published     boolean not null default false,
  location_visited text,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────
create table audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete set null,
  action      text not null,
  resource    text not null,
  resource_id text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index audit_logs_user_idx on audit_logs(user_id);
create index audit_logs_resource_idx on audit_logs(resource, resource_id);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

-- Profiles: users can read/update their own
alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

create policy "profiles_select_admin" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Locations: published locations are public for authenticated users with access
alter table locations enable row level security;

create policy "locations_select_authenticated" on locations
  for select using (
    is_published = true
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and has_purchased = true
    )
  );

create policy "locations_all_admin" on locations
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Location images: same access as parent location
alter table location_images enable row level security;

create policy "location_images_select" on location_images
  for select using (
    exists (
      select 1 from locations l
      inner join profiles p on p.id = auth.uid()
      where l.id = location_id
      and l.is_published = true
      and p.has_purchased = true
    )
  );

-- Favorites: users can CRUD their own
alter table favorites enable row level security;

create policy "favorites_crud_own" on favorites
  for all using (auth.uid() = user_id);

-- Purchases: users can read own, admins can read all
alter table purchases enable row level security;

create policy "purchases_select_own" on purchases
  for select using (auth.uid() = user_id);

create policy "purchases_insert_service" on purchases
  for insert with check (true); -- service role only

create policy "purchases_select_admin" on purchases
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Testimonials: published are public
alter table testimonials enable row level security;

create policy "testimonials_select_published" on testimonials
  for select using (is_published = true);

create policy "testimonials_all_admin" on testimonials
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS (run in Supabase dashboard)
-- ─────────────────────────────────────────────
-- insert into storage.buckets (id, name, public) values
--   ('location-images', 'location-images', true),
--   ('user-uploads', 'user-uploads', false),
--   ('profile-images', 'profile-images', true);
