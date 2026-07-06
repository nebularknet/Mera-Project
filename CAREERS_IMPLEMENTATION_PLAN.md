# Careers Feature — Implementation Plan

Public careers page + job application form + internal HR review dashboard, added to the
existing Next.js 15 (App Router) / React 19 / Tailwind site. Backed by Supabase, emails via Resend.

> Design decisions were locked in a grilling session — see the decision record at the bottom.
> This plan is the *how*. Replaces the two static Bootstrap prototypes
> (`~/Downloads/JobApplyForm.html`, `~/Downloads/JobDashboard.html`), which are reference only.

---

## 0. Prerequisites (do these first — one has DNS lead time)

| Task | Why first | Notes |
|------|-----------|-------|
| Create a **Supabase project** (free tier) | Everything depends on it | Grab project URL + `anon` key + `service_role` key |
| Create a **Resend account** + add `nebulark.com` as a domain | **DNS verification has lead time** (minutes–48h) | Paste the SPF/DKIM/DMARC records into nebulark.com's DNS now; it verifies in the background while you build. Test against `onboarding@resend.dev` until verified. |
| Decide the **team email allowlist** | Gates dashboard access | List of emails allowed into `/careers/admin` |
| Decide the **"new application" notify address** | Team notification | A shared inbox e.g. `careers@nebulark.com` |

**Resend cost:** free tier (~3,000 emails/mo, ~100/day, 1 domain) is ample — at <20 applications/month
you'll send ~60 emails/month. Verify current numbers at resend.com/pricing before go-live.

---

## 1. Dependencies to add

```
@supabase/supabase-js          # Supabase client
@supabase/ssr                  # cookie-based auth for Next.js App Router
resend                         # transactional email
@radix-ui/react-select         # for the job-post dropdown (no select.tsx exists yet)
```

`react-hook-form`, `zod`, `@hookform/resolvers` are already installed and used in `CommentForm.tsx`.

### Environment variables (add to `.env`, and to Vercel project settings)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, NEVER exposed to client
RESEND_API_KEY=
CAREERS_NOTIFY_EMAIL=careers@nebulark.com   # where "new application" alerts go
CAREERS_FROM_EMAIL=careers@nebulark.com     # verified sender (use onboarding@resend.dev until verified)
```

---

## 2. Database schema (Supabase SQL)

Run in the Supabase SQL editor.

```sql
-- Open roles shown on /careers and in the apply dropdown
create table jobs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  location    text,
  is_open     boolean not null default true,
  created_at  timestamptz not null default now()
);

-- One row per submitted application (mirrors the prototype's form fields)
create table applications (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid references jobs(id),
  full_name   text not null,
  gender      text,
  education   text,
  university  text,
  start_date  text,            -- "month" inputs; store as text or date
  end_date    text,
  city        text,
  email       text not null,
  contact     text,
  experience  text,
  cv_path     text not null,   -- path inside the private Storage bucket
  status      text not null default 'pending',  -- pending | shortlisted | rejected
  created_at  timestamptz not null default now()
);

-- Audit trail: who changed a status, when, to what (team is 4+ and growing)
create table application_status_history (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  old_status     text,
  new_status     text not null,
  changed_by     text not null,   -- reviewer email
  changed_at     timestamptz not null default now()
);

-- Allowlist of emails permitted into the dashboard
create table allowed_admins (
  email      text primary key,
  created_at timestamptz not null default now()
);
```

### Row Level Security (RLS)
- `jobs`: public **read** of `is_open = true`; writes restricted to admins.
- `applications`, `application_status_history`: **no public access at all.** All reads/writes go through
  server-side code using the `service_role` key (never the client). This is the key privacy guardrail.
- `allowed_admins`: server-side only.

### Storage
- Create a **private** bucket `cvs`. No public access.
- Reviewers get files via short-lived **signed URLs** generated server-side on click.

---

## 3. Shared server utilities

- `src/lib/supabase/server.ts` — server client using `@supabase/ssr` (reads auth cookie).
- `src/lib/supabase/admin.ts` — service-role client for privileged server actions (applications, signed URLs).
- `src/lib/resend.ts` — Resend client + small `sendEmail()` helper.
- `src/lib/careers/schema.ts` — zod schemas: `applicationSchema` (validates form, enforces PDF + ≤5MB),
  shared between the form and the server action.
- `src/lib/auth/isAdmin.ts` — given the session email, check membership in `allowed_admins`.

---

## 4. Public careers page  (`/careers`)  — Tailwind only

**Route:** `src/app/careers/page.tsx`
- Server component. Fetches `jobs where is_open = true`.
- Renders a branded hero + a list of open roles (title, location, description). Matches site styling
  via Tailwind/Radix (NOT Bootstrap). Each role links to / opens the apply form.
- If no roles open: a "no current openings" state.

**Apply form:** `src/app/careers/apply/page.tsx` (or a client component on `/careers`)
- Client component, `react-hook-form` + `zodResolver(applicationSchema)` (same pattern as `CommentForm.tsx`).
- Fields (from prototype): job post (Radix Select from `jobs`), full name, gender, education,
  university, start/end month, city, email, contact, CV (file, PDF only ≤5MB), experience (textarea).
- Uses existing UI primitives: `input`, `textarea`, `label`, `button`, `form`, `toast`. Add `select.tsx`.
- Submits to a **server action** (`src/app/careers/actions.ts`):
  1. Re-validate with zod server-side (never trust client).
  2. Re-check file is PDF and ≤5MB.
  3. Upload CV to private `cvs` bucket (path like `cvs/{uuid}-{filename}`).
  4. Insert `applications` row (status `pending`).
  5. Email applicant "we received your application" (Resend).
  6. Email `CAREERS_NOTIFY_EMAIL` "new application for {role}" (Resend).
  7. Return success → toast + thank-you state.
- **Dropped:** the prototype's public "Application Status" lookup (privacy leak). Applicants hear back by email.

---

## 5. Internal dashboard  (`/careers/admin`)  — Tailwind only, auth-gated

**Auth:** `src/app/careers/admin/layout.tsx`
- Supabase Auth, **magic-link**, email allowlist.
- Login page at `/careers/admin/login` — enter email → magic link sent (only if email ∈ `allowed_admins`).
- Layout checks session + `isAdmin(email)`; redirect to login if not. No public signup.

**Dashboard:** `src/app/careers/admin/page.tsx`
- Server component fetches `applications` (service-role) joined with `jobs`.
- Table columns (from prototype): job post, name, gender, education, duration, experience, city,
  university, email, contact, **CV** (button → server action returns a signed URL), status, action.
- **Filters** (client-side over fetched rows, like the prototype): job, gender, education, experience, city.
- **Approve / Reject** buttons → server action:
  1. Update `applications.status`.
  2. Insert `application_status_history` row (`changed_by` = session email, old/new status).
  3. Email the applicant their status change (Resend).
- **Manage Jobs** sub-screen (`/careers/admin/jobs`): list/add/edit jobs, toggle `is_open`.
  Keeps the careers page and apply dropdown current without code deploys.

---

## 6. Routing / middleware
- No subdomain needed. `/careers` and `/careers/admin` are plain routes on the main domain.
- Confirm `src/middleware.ts` (subdomain routing) doesn't intercept `/careers` — add an exclusion if it does.

---

## 7. Build order (suggested, each step shippable/testable)
1. Prereqs (§0) — kick off Resend DNS verification **first**.
2. Add deps + env (§1), create schema + bucket + RLS (§2).
3. Shared utils (§3).
4. `/careers` + apply form + submit action (§4) — test an application lands in DB + CV in bucket + emails fire (use `onboarding@resend.dev` until domain verified).
5. Admin auth + login (§5 auth).
6. Dashboard table + filters + CV signed URLs (§5).
7. Approve/reject + status emails + history (§5).
8. Manage Jobs screen (§5).
9. QA pass: RLS can't leak applications publicly; signed URLs expire; non-allowlisted email can't log in; file-type/size rejected server-side.

---

## 8. Out of scope (explicitly deferred)
- **AI resume parsing / scoring** — unjustified at <20 apps/month. Add only if volume ~10×'s.
- **Public application-status lookup** — removed (privacy). Email notifications replace it.
- **Site-wide Bootstrap → Tailwind migration** — Bootstrap is currently load-bearing (imported in
  `src/app/layout.tsx`; react-bootstrap used across Navbar/Footer/LandingPage/Products/Services/Values/
  AboutUs + academy/services/studio). That's a separate dedicated project. All *new* careers code is
  Tailwind-only, which moves the site toward Tailwind one page at a time.

---

## Decision record (from grilling session, 2026-06-28)
| # | Decision | Choice |
|---|----------|--------|
| 1 | Backend | Supabase (Postgres + Storage + Auth) |
| 2 | Dashboard access | Supabase Auth, magic-link, email allowlist, no public signup |
| 3 | Job postings | `jobs` table + minimal manage-jobs admin screen |
| 4 | Resume filtering | Manual review, NO AI (<20/mo doesn't justify a pipeline) |
| 4b | Team scale | 4+ reviewers, growing → record who+when on every status change |
| 5 | Placement | Public `/careers`, auth-gated `/careers/admin`, no new subdomain |
| 6 | Applicant comms | Resend emails on status change + team alert on new app; dropped public status lookup |
| 7 | CV storage | Private bucket, on-demand signed URLs, PDF only, ~5MB cap, enforced form + server |
| 8 | Styling | New screens Tailwind-only; defer site-wide Bootstrap removal |
