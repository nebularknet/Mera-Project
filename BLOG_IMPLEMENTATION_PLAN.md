# Blog — Implementation Plan

Replace the third-party Wisp CMS blog with Nebulark's own blog, stored in the same Supabase
project as Careers. Requirements were agreed with the site owner on 2026-10-18 (decision record
at the bottom). This plan is the *what*; build details are settled during implementation.

> **Why:** `NEXT_PUBLIC_BLOG_ID` was left at the Wisp starter-template placeholder, so
> nebulark.net/blog shows someone else's 466 posts under the Nebulark name.

**Release order:** the 11 pending careers fixes ship first. The blog is a separate release with
its own Supabase migration and a local review before deploy.

---

## 1. Storage

| What | Where |
|------|-------|
| Posts, categories, tags, comments, view counts, author profiles | Supabase tables (new migration file in `supabase/`) |
| Images (inline + share images + author photos) | New public Supabase Storage bucket |
| Post body | **Tiptap JSON** (source of truth, reopens in the editor exactly) **+ sanitized HTML** generated on save (what the public page renders) |

Wisp is removed entirely: `@wisp-cms/client`, `@wisp-cms/react-custom-component`, `src/lib/wisp.ts`,
the Wisp comment components, and the `NEXT_PUBLIC_BLOG_*` env vars. The blog starts empty.

## 2. People and roles

| Role | Who | Can |
|------|-----|-----|
| **Admin** | Existing careers `allowed_admins` allow-list | Write/edit/publish/unpublish/delete any post; manage categories, writers, comments; set featured post |
| **Writer** | Created by an admin (email + temporary password, shared directly) | Create and edit **own drafts**, submit for review. Cannot edit once published. Never sees Careers. |

- One login page shared with Careers; writers land on the blog dashboard.
- Author profile: name, photo, short bio — shown on each post.

## 3. Writing and review flow

- **Editor:** rich text (Tiptap) — headings, bold/italic, lists, links, quotes, code blocks,
  inline image upload, YouTube embeds. Markdown typing shortcuts work but aren't required.
- **Statuses:** `draft` → `in_review` → `published`. Admin may edit, then **publish** or
  **send back with a note** (returns to `draft`, note visible to the writer).
- Preview before publishing. No scheduled publishing (publish is immediate).

## 4. Public blog

URLs unchanged: `/blog`, `/post/<slug>`, `/category`, `/category/<name>`.

- **Blog page:** one pinned **featured** post on top, **search** (titles + content), category
  filter, working pagination, footer.
- **Post page:** reading time, category + tags, share buttons (LinkedIn, X, Facebook, copy link),
  **related posts**, comments.
- **Categories:** managed by admins. **Tags:** free-form, typed by the author.
- **Comments:** name + email + comment; hidden until an admin approves; email never shown;
  spam protection (honeypot + rate limit). New comments email the team inbox
  (`CAREERS_NOTIFY_EMAIL`).
- **SEO & sharing:** per-post SEO title/description and share image; sitemap and RSS feed
  generated from our posts.
- **Reading stats:** view count per post (once per visitor session), shown in the dashboard.

## 5. Not in scope (not selected)

Scheduled publishing, separate blog-only logins, author pages, writers editing published posts.

---

## 6. Status and setup (built 2026-10-19)

**One-time setup:** run `supabase/blog-schema.sql` in the Supabase SQL editor. It creates the
tables, the public `blog-images` bucket, the view-counter function and three starter categories.
Until it runs, the public blog shows "No articles yet" and `/blog/admin` shows setup instructions.

| Where | What |
|-------|------|
| `/blog/admin` | Dashboard (sign in at `/careers/admin/login`; writers are sent here) |
| `/blog/admin/posts/new` | Editor — admins publish; writers save drafts / submit for review |
| `/blog/admin/comments` | Approve or delete comments (admins) |
| `/blog/admin/categories`, `/writers` | Manage categories and writer logins (admins) |
| `/blog/admin/profile` | Author name, photo, bio |

Code: `src/lib/blog/*` (auth, queries, sanitizing), `src/app/blog/admin/*` (dashboard),
`src/components/blog/*` (public UI), `src/app/post/actions.ts` (comments, view counting).

---

## Decision record (2026-10-18)

| Question | Decision |
|----------|----------|
| Who writes | Admins + writer role |
| Writer accounts | Admin sets email + temporary password |
| Writer workflow | Draft + submit for review; no edits after publishing |
| Editor | Rich text editor |
| Storage format | Tiptap JSON + sanitized HTML (owner approved) |
| Features | Categories & tags, comments, search |
| Extras | SEO & sharing, related & featured posts, reading stats |
| Comments | Approve before showing |
| URLs / order | Keep current URLs; deploy careers fixes first |
| Assumed (not objected) | Comment emails to team inbox; admin-managed categories, free tags; one featured post; no scheduling |
