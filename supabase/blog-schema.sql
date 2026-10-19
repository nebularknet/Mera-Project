-- ============================================================================
-- Nebulark Blog — Supabase schema (replaces the third-party Wisp CMS)
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses "if not exists" / "or replace" / "drop … if exists".
-- See BLOG_IMPLEMENTATION_PLAN.md for the agreed requirements.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

-- Everyone who can sign in to the blog dashboard. Admins come from the careers
-- allowed_admins allow-list (a row is created for them on first visit);
-- writers are created by an admin.
create table if not exists public.blog_authors (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid,                          -- Supabase Auth user (writers created by an admin)
  email       text not null unique,          -- lower-case
  name        text not null,
  bio         text,
  avatar_url  text,
  role        text not null default 'writer' check (role in ('admin', 'writer')),
  active      boolean not null default true, -- false = writer removed, can't sign in
  created_at  timestamptz not null default now()
);

-- Admin-managed categories (URL: /category/<slug>).
create table if not exists public.blog_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,      -- URL: /post/<slug>
  title            text not null,
  excerpt          text,                      -- short summary for cards / SEO fallback
  content_json     jsonb not null default '{}'::jsonb, -- Tiptap document (editor source of truth)
  content_html     text not null default '',  -- sanitized HTML rendered on the public page
  content_text     text not null default '',  -- plain text, for search + reading time
  cover_image_url  text,                      -- also the social share image
  category_id      uuid references public.blog_categories(id) on delete set null,
  tags             text[] not null default '{}',
  status           text not null default 'draft'
                   check (status in ('draft', 'in_review', 'published')),
  review_note      text,                      -- admin's note when sending a post back
  featured         boolean not null default false,
  seo_title        text,
  seo_description  text,
  reading_minutes  integer not null default 1,
  view_count       integer not null default 0,
  author_id        uuid not null references public.blog_authors(id) on delete restrict,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  search           tsvector generated always as (
                     setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                     setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
                     setweight(to_tsvector('english', coalesce(content_text, '')), 'C')
                   ) stored
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts (category_id);
create index if not exists blog_posts_author_idx   on public.blog_posts (author_id);
create index if not exists blog_posts_tags_idx     on public.blog_posts using gin (tags);
create index if not exists blog_posts_search_idx   on public.blog_posts using gin (search);
-- At most one featured post.
create unique index if not exists blog_posts_one_featured_idx
  on public.blog_posts (featured) where featured;

-- Reader comments; hidden until an admin approves them.
create table if not exists public.blog_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.blog_posts(id) on delete cascade,
  name        text not null,
  email       text not null,                 -- never shown publicly
  body        text not null,
  status      text not null default 'pending' check (status in ('pending', 'approved')),
  ip_hash     text,                          -- hashed client IP, for rate limiting only
  created_at  timestamptz not null default now()
);

create index if not exists blog_comments_post_idx   on public.blog_comments (post_id, status, created_at);
create index if not exists blog_comments_status_idx on public.blog_comments (status, created_at desc);
create index if not exists blog_comments_ip_idx     on public.blog_comments (ip_hash, created_at desc);

-- ----------------------------------------------------------------------------
-- 2. FUNCTIONS
-- ----------------------------------------------------------------------------

-- Atomic view counter (called server-side once per visitor session).
create or replace function public.blog_increment_view(p_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.blog_posts
     set view_count = view_count + 1
   where id = p_post_id and status = 'published';
$$;

revoke all on function public.blog_increment_view(uuid) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- Same model as Careers: RLS on, no public policies. All reads and writes go
-- through server-side code with the service_role key, which filters to
-- published posts / approved comments for the public site.
-- ----------------------------------------------------------------------------

alter table public.blog_authors    enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts      enable row level security;
alter table public.blog_comments   enable row level security;

-- ----------------------------------------------------------------------------
-- 4. STORAGE — public bucket for blog images (covers, inline images, avatars)
-- Uploads happen server-side (service_role) after an auth check; the public
-- can only read files by URL.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 5. SEED (optional) — starter categories. Edit in the dashboard later.
-- ----------------------------------------------------------------------------

insert into public.blog_categories (name, slug, description) values
  ('Design',      'design',      'Branding, UI/UX and visual design.'),
  ('Development', 'development', 'Web and app engineering.'),
  ('Company',     'company',     'News and updates from Nebulark.')
on conflict (slug) do nothing;
