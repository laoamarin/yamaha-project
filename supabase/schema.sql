-- Yamaha Concert Registration System
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

-- Extensions (must run before trigram index)
create extension if not exists pg_trgm;

-- Events
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  qr_token text unique not null default gen_random_uuid()::text,
  extra_fields jsonb default '[]',
  -- e.g. [{"key":"phone","label":"เบอร์โทร","required":true},{"key":"registered_by","label":"ชื่อผู้ปกครอง","required":true}]
  certificate_template_url text,
  certificate_config jsonb,
  -- {"x_pct":50,"y_pct":62,"font_size":48,"font_color":"#1a1a4e","font_family":"Sarabun","align":"center"}
  certificates_released boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Students
create table students (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  full_name text not null,
  nickname text,
  instrument text,
  teacher_name text,
  search_name text generated always as (
    lower(regexp_replace(coalesce(full_name,'') || ' ' || coalesce(nickname,''), '[ด.ช.ด.ญ()]', '', 'g'))
  ) stored
);

create index idx_students_search on students using gin(search_name gin_trgm_ops);
create index idx_students_event_id on students(event_id);

-- Registrations
create table registrations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  extra_data jsonb default '{}',
  registered_at timestamptz default now(),
  unique(student_id, event_id)
);

create index idx_registrations_event_id on registrations(event_id);

-- Row Level Security
alter table events enable row level security;
alter table students enable row level security;
alter table registrations enable row level security;

-- Public read policies
create policy "public can read active events"
  on events for select
  using (is_active = true);

create policy "public can read students"
  on students for select
  using (true);

create policy "public can read registrations"
  on registrations for select
  using (true);

create policy "public can insert registrations"
  on registrations for insert
  with check (true);

-- Admin write policies (authenticated role) — add in step 3

-- Enable Realtime for admin dashboard (step 6)
alter publication supabase_realtime add table registrations;
