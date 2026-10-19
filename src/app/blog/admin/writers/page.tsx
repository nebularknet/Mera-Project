import type { Metadata } from "next";

import { requireBlogUser } from "@/lib/blog/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogAdminShell } from "../shell";
import { WritersManager, type WriterRow } from "./writers-manager";

export const metadata: Metadata = {
  title: "Writers — Nebulark Blog Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BlogWritersPage() {
  const user = await requireBlogUser({ adminOnly: true });
  const db = createAdminClient();
  const [{ data: authors }, { data: posts }] = await Promise.all([
    db.from("blog_authors").select("id, name, email, role, active, created_at").order("created_at"),
    db.from("blog_posts").select("author_id, status"),
  ]);
  const counts = new Map<string, { total: number; published: number }>();
  for (const p of posts ?? []) {
    const c = counts.get(p.author_id) ?? { total: 0, published: 0 };
    c.total++;
    if (p.status === "published") c.published++;
    counts.set(p.author_id, c);
  }
  const rows: WriterRow[] = (authors ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    active: a.active,
    posts: counts.get(a.id)?.total ?? 0,
    published: counts.get(a.id)?.published ?? 0,
  }));

  return (
    <BlogAdminShell user={user} active="writers">
      <WritersManager rows={rows} />
    </BlogAdminShell>
  );
}
