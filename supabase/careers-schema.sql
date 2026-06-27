-- ============================================================================
-- Nebulark Careers feature — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses "if not exists" / "drop policy if exists" guards.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

-- Open roles shown on /careers and in the apply-form dropdown.
create table if not exists public.jobs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  location    text,
  is_open     boolean not null default true,
  created_at  timestamptz not null default now()
);

-- One row per submitted application (mirrors the apply-form fields).
create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid references public.jobs(id) on delete set null,
  full_name   text not null,
  gender      text,
  education   text,
  university  text,
  start_date  text,            -- HTML "month" inputs; stored as "YYYY-MM"
  end_date    text,
  city        text,
  email       text not null,
  contact     text,
  experience  text,
  cv_path     text not null,   -- path inside the private "cvs" Storage bucket
  status      text not null default 'pending'
              check (status in ('pending', 'shortlisted', 'rejected')),
  created_at  timestamptz not null default now()
);

create index if not exists applications_status_idx  on public.applications (status);
create index if not exists applications_job_id_idx   on public.applications (job_id);
create index if not exists applications_created_idx  on public.applications (created_at desc);

-- Audit trail: who changed a status, when, and to what (team is 4+ and growing).
create table if not exists public.application_status_history (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  old_status     text,
  new_status     text not null,
  changed_by     text not null,   -- reviewer email
  changed_at     timestamptz not null default now()
);

create index if not exists status_history_app_idx
  on public.application_status_history (application_id, changed_at desc);

-- Allowlist of emails permitted into the /careers/admin dashboard.
create table if not exists public.allowed_admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- Privacy guardrail: applicant data is NEVER readable by the public.
-- All privileged access goes through server-side code using the
-- service_role key, which bypasses RLS. The anon (browser) client only
-- gets what the policies below explicitly allow.
-- ----------------------------------------------------------------------------

alter table public.jobs                       enable row level security;
alter table public.applications               enable row level security;
alter table public.application_status_history enable row level security;
alter table public.allowed_admins             enable row level security;

-- jobs: anyone may READ open roles (for the public careers page).
-- Writes happen server-side (service_role), so no insert/update policy here.
drop policy if exists "public can read open jobs" on public.jobs;
create policy "public can read open jobs"
  on public.jobs
  for select
  to anon, authenticated
  using (is_open = true);

-- applications, application_status_history, allowed_admins:
-- NO policies for anon/authenticated => zero public access.
-- The apply form writes via a server action (service_role); the dashboard
-- reads/writes via service_role. RLS stays enabled with no permissive policy,
-- which denies the browser client entirely. That is intentional.

-- ----------------------------------------------------------------------------
-- 3. STORAGE — private bucket for CVs
-- ----------------------------------------------------------------------------

-- Create a PRIVATE bucket named "cvs" (public = false). CVs are only ever
-- served to authenticated reviewers via short-lived signed URLs generated
-- server-side. Re-running is a no-op thanks to on conflict.
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

-- No storage RLS policies for the public/anon role => the bucket is not
-- browseable or downloadable by the public. Uploads (apply form) and signed
-- URL creation (dashboard) both run server-side with the service_role key.

-- ----------------------------------------------------------------------------
-- 4. SEED (optional) — example open roles from the prototype.
--    Edit or delete; the "Manage Jobs" admin screen will replace this.
-- ----------------------------------------------------------------------------
insert into public.jobs (title, location, is_open) values
  ('Cyber Security',        'Remote', true),
  ('Graphic Designing',     'Remote', true),
  ('UI Designer',           'Remote', true),
  ('Business Development',   'Remote', true)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- 5. ADMIN ALLOWLIST — add your team's emails here, or via the dashboard later.
--    Only these emails can receive a magic link into /careers/admin.
-- ----------------------------------------------------------------------------
-- insert into public.allowed_admins (email) values
--   ('you@nebulark.com'),
--   ('teammate@nebulark.com')
-- on conflict do nothing;
