-- ============================================================================
-- Nebulark Careers — role details, last date for roles + interview scheduling
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses "if not exists" guards.
-- ============================================================================

-- Last day a role accepts applications (calendar date, Pakistan time).
-- NULL = no deadline. After the date passes, "Apply Now" is hidden and only
-- "Check application status" remains on the role page.
alter table public.jobs
  add column if not exists last_date date;

-- Role details shown on the job page (one list item per line in the admin form).
alter table public.jobs
  add column if not exists requirements     text[] not null default '{}',
  add column if not exists responsibilities text[] not null default '{}';

-- Interview date/time chosen when an application is shortlisted. Shown in the
-- admin dashboard and to the applicant when they check their status.
alter table public.applications
  add column if not exists interview_at timestamptz;

-- Status lookups match on email + role.
create index if not exists applications_email_job_idx
  on public.applications (lower(email), job_id);
