-- ============================================================================
-- Nebulark Blog — authors without a login
-- Lets "Manage Blog" credit a post to any author name. Authors with an email
-- can sign in to the blog dashboard; authors without one are display-only.
-- Safe to re-run.
-- ============================================================================

alter table public.blog_authors
  alter column email drop not null;
