create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_type as enum ('client', 'professional');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.service_type as enum ('photography', 'video', 'photo_video', 'event');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.media_type as enum ('image', 'video');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  city text,
  avatar_url text,
  user_type public.user_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  bio text,
  city text,
  neighborhood text,
  latitude double precision,
  longitude double precision,
  is_available boolean not null default false,
  is_verified boolean not null default false,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  total_reviews integer not null default 0 check (total_reviews >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professional_services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  service_type public.service_type not null,
  price_from numeric(10, 2) check (price_from is null or price_from >= 0),
  unique (professional_id, service_type)
);

create table if not exists public.professional_equipment (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  name text not null,
  category text
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  media_url text not null,
  media_type public.media_type not null,
  description text,
  created_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists professional_profiles_set_updated_at on public.professional_profiles;
create trigger professional_profiles_set_updated_at
before update on public.professional_profiles
for each row execute function public.set_updated_at();

drop view if exists public.public_professional_profiles;
create view public.public_professional_profiles
with (security_barrier = true)
as
select
  id,
  bio,
  city,
  neighborhood,
  is_available,
  is_verified,
  rating,
  total_reviews,
  created_at,
  updated_at
from public.professional_profiles;

alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.professional_services enable row level security;
alter table public.professional_equipment enable row level security;
alter table public.portfolio_items enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.professional_profiles from anon, authenticated;
revoke all on public.professional_services from anon, authenticated;
revoke all on public.professional_equipment from anon, authenticated;
revoke all on public.portfolio_items from anon, authenticated;
revoke all on public.public_professional_profiles from anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.professional_profiles to authenticated;
grant select, insert, update, delete on public.professional_services to authenticated;
grant select, insert, update, delete on public.professional_equipment to authenticated;
grant select, insert, update, delete on public.portfolio_items to authenticated;

grant select on public.public_professional_profiles to anon, authenticated;
grant select on public.professional_services to anon, authenticated;
grant select on public.professional_equipment to anon, authenticated;
grant select on public.portfolio_items to anon, authenticated;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
on public.profiles for delete
using (auth.uid() = user_id);

drop policy if exists "Professional profiles are public" on public.professional_profiles;

drop policy if exists "Professionals can read own profile" on public.professional_profiles;
create policy "Professionals can read own profile"
on public.professional_profiles for select
using (auth.uid() = user_id);

drop policy if exists "Professionals can insert own profile" on public.professional_profiles;
create policy "Professionals can insert own profile"
on public.professional_profiles for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.user_type = 'professional'
  )
);

drop policy if exists "Professionals can update own profile" on public.professional_profiles;
create policy "Professionals can update own profile"
on public.professional_profiles for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.user_type = 'professional'
  )
);

drop policy if exists "Professionals can delete own profile" on public.professional_profiles;
create policy "Professionals can delete own profile"
on public.professional_profiles for delete
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.user_type = 'professional'
  )
);

drop policy if exists "Professional services are public" on public.professional_services;
create policy "Professional services are public"
on public.professional_services for select
using (true);

drop policy if exists "Professionals manage own services" on public.professional_services;
create policy "Professionals manage own services"
on public.professional_services for all
using (
  exists (
    select 1
    from public.professional_profiles pp
    where pp.id = professional_id
      and pp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.professional_profiles pp
    where pp.id = professional_id
      and pp.user_id = auth.uid()
  )
);

drop policy if exists "Professional equipment is public" on public.professional_equipment;
create policy "Professional equipment is public"
on public.professional_equipment for select
using (true);

drop policy if exists "Professionals manage own equipment" on public.professional_equipment;
create policy "Professionals manage own equipment"
on public.professional_equipment for all
using (
  exists (
    select 1
    from public.professional_profiles pp
    where pp.id = professional_id
      and pp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.professional_profiles pp
    where pp.id = professional_id
      and pp.user_id = auth.uid()
  )
);

drop policy if exists "Portfolio items are public" on public.portfolio_items;
create policy "Portfolio items are public"
on public.portfolio_items for select
using (true);

drop policy if exists "Professionals manage own portfolio" on public.portfolio_items;
create policy "Professionals manage own portfolio"
on public.portfolio_items for all
using (
  exists (
    select 1
    from public.professional_profiles pp
    where pp.id = professional_id
      and pp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.professional_profiles pp
    where pp.id = professional_id
      and pp.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

drop policy if exists "Portfolio files are publicly readable" on storage.objects;
create policy "Portfolio files are publicly readable"
on storage.objects for select
using (bucket_id = 'portfolio');

drop policy if exists "Users upload own portfolio files" on storage.objects;
create policy "Users upload own portfolio files"
on storage.objects for insert
with check (
  bucket_id = 'portfolio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users update own portfolio files" on storage.objects;
create policy "Users update own portfolio files"
on storage.objects for update
using (
  bucket_id = 'portfolio'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'portfolio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users delete own portfolio files" on storage.objects;
create policy "Users delete own portfolio files"
on storage.objects for delete
using (
  bucket_id = 'portfolio'
  and auth.uid()::text = (storage.foldername(name))[1]
);
