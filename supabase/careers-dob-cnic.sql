-- ============================================================================
-- Nebulark Careers — applicant date of birth + CNIC number (apply form step 2)
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- BEFORE deploying the matching code, otherwise new applications fail to save.
-- Safe to re-run: uses "if not exists" guards. Existing rows keep NULL.
-- ============================================================================

alter table public.applications
  add column if not exists dob  date,   -- date of birth
  add column if not exists cnic text;   -- stored as "xxxxx-xxxxxxx-x"
