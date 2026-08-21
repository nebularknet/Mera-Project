-- ============================================================================
-- Nebulark Jobs Portal feature — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses "if not exists" / "drop policy if exists" guards.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

-- Job openings shown on /jobs and /jobs/[id]
create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  department      text not null,
  location        text not null,
  employment_type text not null, -- e.g. Full-time, Part-time, Contract, Internship
  experience      text not null, -- e.g. Entry Level, Mid Level, Senior
  salary          text not null, -- e.g. $80,000 - $100,000 or Competitive
  description     text not null,
  requirements    text[] not null default '{}',
  responsibilities text[] not null default '{}',
  benefits        text[] not null default '{}',
  featured        boolean not null default false,
  status          text not null default 'Open' check (status in ('Open', 'Closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists jobs_status_idx on public.jobs (status);
create index if not exists jobs_featured_idx on public.jobs (featured) where featured = true;

-- Applications submitted for job openings
create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid references public.jobs(id) on delete set null,
  first_name   text not null,
  last_name    text not null,
  email        text not null,
  phone        text not null,
  linkedin     text,
  portfolio    text,
  resume_url   text not null, -- path inside the private "resumes" Storage bucket
  cover_letter text,
  message      text,
  status       text not null default 'pending' check (status in ('pending', 'reviewed', 'shortlisted', 'rejected')),
  created_at   timestamptz not null default now()
);

create index if not exists applications_job_id_idx on public.applications (job_id);
create index if not exists applications_email_idx on public.applications (email);
create index if not exists applications_created_at_idx on public.applications (created_at desc);

-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- jobs: anyone may READ open roles (for the public jobs page).
-- Writes happen server-side (service_role), so no insert/update/delete policies are needed for anon/authenticated roles.
drop policy if exists "public can read open jobs" on public.jobs;
create policy "public can read open jobs"
  on public.jobs
  for select
  to anon, authenticated
  using (status = 'Open');

-- applications: NO policies for anon/authenticated => zero public access.
-- The apply form writes via a server action (service_role); RLS remains enabled with no permissive policy,
-- denying browser-based access.

-- ----------------------------------------------------------------------------
-- 3. STORAGE — private bucket for Resumes
-- ----------------------------------------------------------------------------

-- Create a PRIVATE bucket named "resumes" (public = false). Resumes are stored privately
-- and can only be accessed by admin users (e.g. through the Supabase service_role).
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. SEED DATA — Insert some initial sample jobs for demonstration
-- ----------------------------------------------------------------------------
insert into public.jobs (
  title, 
  department, 
  location, 
  employment_type, 
  experience, 
  salary, 
  description, 
  requirements, 
  responsibilities, 
  benefits, 
  featured, 
  status
) values 
  (
    'Cyber Security Analyst', 
    'Engineering', 
    'Remote', 
    'Full-time', 
    'Mid Level', 
    'Competitive', 
    'We are looking for a Cyber Security Analyst to join our engineering team. You will be responsible for maintaining security infrastructure, monitoring for security incidents, and implementing industry-standard security protocols across all Nebulark services.',
    array['BS in Computer Science, Cyber Security, or related field', '3+ years of experience in security engineering or security analysis', 'Familiarity with cloud security (AWS/GCP), IAM, and penetration testing tools', 'Relevant security certifications (CEH, CISSP, Security+) are a plus'],
    array['Monitor systems for security breaches and investigate network intrusions', 'Perform vulnerability assessments and threat modeling', 'Develop security standards, policies, and best practices for developers', 'Configure and maintain firewalls, intrusion detection systems, and encryption protocols'],
    array['Work from anywhere in the world', 'Generous health and wellness allowance', 'Learning and certification budgets', 'Company retreats'],
    true, 
    'Open'
  ),
  (
    'Lead Graphic Designer', 
    'Creative Studio', 
    'Islamabad, PK', 
    'Full-time', 
    'Senior', 
    'Market Competitive', 
    'Nebulark is seeking an experienced Lead Graphic Designer to drive creative projects, design visual identities, and collaborate with product teams to build immersive brand experiences for our international clients.',
    array['Degree in Fine Arts, Design, or related field, or equivalent experience', '5+ years of professional graphic design experience with a stellar portfolio', 'Expertise in Figma, Adobe Creative Cloud (Photoshop, Illustrator, InDesign)', 'Excellent visual communication and leadership skills'],
    array['Lead the creative direction for client branding and UI/UX assets', 'Collaborate with marketing and development teams to produce outstanding graphics', 'Mentor and guide junior designers in the creative studio team', 'Maintain visual consistency across all client deliverables'],
    array['Premium office environment in Islamabad', 'Competitive salary package', 'Performance-based bonuses', 'Creative freedom and ownership'],
    true, 
    'Open'
  ),
  (
    'UI/UX Designer', 
    'Creative Studio', 
    'Remote', 
    'Full-time', 
    'Mid Level', 
    'Competitive', 
    'Join us as a UI/UX Designer to craft beautiful, intuitive, and modern user interfaces for our digital products. You will turn user insights into functional, engaging designs that wow users.',
    array['3+ years of experience as a UI/UX Designer, Product Designer, or similar role', 'Proficient in Figma, prototyping tools, and wireframing', 'Strong understanding of user-centered design, typography, and color theory', 'Basic understanding of HTML/CSS is a plus but not required'],
    array['Create user flows, wireframes, prototypes, and high-fidelity mockups', 'Conduct user research and translate feedback into design improvements', 'Collaborate with front-end engineers to ensure design fidelity during implementation', 'Participate in design reviews and brainstorming sessions'],
    array['Flexible working hours', 'Home office setup budget', 'Health insurance support', 'Paid annual leave'],
    false, 
    'Open'
  ),
  (
    'Business Development Manager', 
    'Sales & Growth', 
    'Remote', 
    'Full-time', 
    'Mid-Senior', 
    'Base + Commission', 
    'We are hiring a Business Development Manager to expand our reach, identify new client partnerships, and present Nebulark services to startups and enterprise businesses worldwide.',
    array['Bachelor degree in Business Administration, Marketing, or similar field', '3+ years of experience in B2B tech sales or business development', 'Strong communication, presentation, and negotiation skills', 'Proven track record of meeting or exceeding sales targets'],
    array['Identify and research potential leads and client organizations', 'Pitch Nebulark design and engineering services to decision-makers', 'Build and maintain long-term relationships with clients', 'Prepare proposals, contracts, and negotiate deals'],
    array['Generous commission structure with no cap', 'Work from anywhere', 'Paid time off and holidays', 'Flexible schedule'],
    false, 
    'Open'
  )
on conflict do nothing;
