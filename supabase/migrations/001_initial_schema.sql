-- ThermoTwin: Digital Twin for CSS + SRP Operations
-- Baghewala Field, Oil India Limited

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'viewer' check (role in ('engineer', 'viewer', 'admin')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'engineer');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Wells ───────────────────────────────────────────────────────────────────
create table if not exists public.wells (
  id text primary key,
  name text not null,
  api_gravity real not null,
  depth_m real not null,
  pump_depth_m real not null,
  rod_string jsonb not null default '[]'::jsonb,
  lat real not null,
  lng real not null,
  status text not null default 'shut-in'
    check (status in ('producing', 'injecting', 'soaking', 'shut-in', 'workover'))
);

alter table public.wells enable row level security;

create policy "Authenticated users can read wells"
  on public.wells for select
  to authenticated
  using (true);

create policy "Engineers and admins can insert wells"
  on public.wells for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('engineer', 'admin'))
  );

-- ─── CSS Cycles ──────────────────────────────────────────────────────────────
create table if not exists public.css_cycles (
  id text primary key,
  well_id text references public.wells(id) on delete cascade,
  cycle_no integer not null,
  steam_volume_bbl real not null,
  inj_pressure_kpa real not null,
  soak_days integer not null,
  start_date timestamptz not null,
  end_date timestamptz,
  cum_oil_bbl real not null default 0,
  sor real not null default 0
);

alter table public.css_cycles enable row level security;

create policy "Authenticated users can read css_cycles"
  on public.css_cycles for select
  to authenticated
  using (true);

create policy "Engineers can manage css_cycles"
  on public.css_cycles for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('engineer', 'admin'))
  );

-- ─── Telemetry ───────────────────────────────────────────────────────────────
create table if not exists public.telemetry (
  id text primary key,
  well_id text references public.wells(id) on delete cascade,
  ts timestamptz not null,
  spm real not null,
  stroke_len_m real not null,
  vfd_hz real not null,
  motor_kw real not null,
  wellhead_temp_c real not null,
  sandface_temp_c real not null,
  viscosity_cp real not null,
  fillage_pct real not null,
  oil_rate_bpd real not null,
  days_since_steam integer not null,
  mode text not null default 'baseline' check (mode in ('baseline', 'thermotwin'))
);

alter table public.telemetry enable row level security;

create policy "Authenticated users can read telemetry"
  on public.telemetry for select
  to authenticated
  using (true);

create policy "System can insert telemetry"
  on public.telemetry for insert
  to authenticated
  with check (true);

create index idx_telemetry_well_ts on public.telemetry(well_id, ts desc);

-- ─── Dyno Cards ──────────────────────────────────────────────────────────────
create table if not exists public.dyno_cards (
  id text primary key,
  well_id text references public.wells(id) on delete cascade,
  ts timestamptz not null,
  position real[] not null,
  load real[] not null,
  downhole_load real[] not null,
  class text not null check (class in ('full_pump', 'fluid_pound', 'gas_interference', 'pump_off', 'rod_floating', 'tagging'))
);

alter table public.dyno_cards enable row level security;

create policy "Authenticated users can read dyno_cards"
  on public.dyno_cards for select
  to authenticated
  using (true);

create policy "System can insert dyno_cards"
  on public.dyno_cards for insert
  to authenticated
  with check (true);

-- ─── Alerts ──────────────────────────────────────────────────────────────────
create table if not exists public.alerts (
  id text primary key,
  well_id text references public.wells(id) on delete cascade,
  ts timestamptz not null,
  type text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  message text not null,
  acknowledged boolean not null default false
);

alter table public.alerts enable row level security;

create policy "Authenticated users can read alerts"
  on public.alerts for select
  to authenticated
  using (true);

create policy "Engineers can update alerts"
  on public.alerts for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('engineer', 'admin'))
  );

create policy "System can insert alerts"
  on public.alerts for insert
  to authenticated
  with check (true);

-- ─── Failures ────────────────────────────────────────────────────────────────
create table if not exists public.failures (
  id text primary key,
  well_id text references public.wells(id) on delete cascade,
  ts timestamptz not null,
  type text not null check (type in ('rod_break', 'pump_failure', 'tubing_leak')),
  cycle_no integer not null,
  days_since_steam integer not null
);

alter table public.failures enable row level security;

create policy "Authenticated users can read failures"
  on public.failures for select
  to authenticated
  using (true);

-- ─── Recommendations ────────────────────────────────────────────────────────
create table if not exists public.recommendations (
  id text primary key,
  well_id text references public.wells(id) on delete cascade,
  ts timestamptz not null,
  kind text not null check (kind in ('spm_change', 'vfd_profile', 'cycle_cutoff', 'steam_volume')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

alter table public.recommendations enable row level security;

create policy "Authenticated users can read recommendations"
  on public.recommendations for select
  to authenticated
  using (true);

create policy "Engineers can update recommendations"
  on public.recommendations for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('engineer', 'admin'))
  );

-- ─── Enable Realtime ─────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.telemetry;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.dyno_cards;
