import type { Metadata } from "next";

import { requireBlogUser } from "@/lib/blog/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogAdminShell } from "../shell";
import { CommentsManager, type CommentRow } from "./comments-manager";

export const metadata: Metadata = {
  title: "Comments — Nebulark Blog Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BlogCommentsPage() {
  const user = await requireBlogUser({ adminOnly: true });
  const { data } = await createAdminClient()
    .from("blog_comments")
    .select("id, name, email, body, status, created_at, post:blog_posts(title, slug)")
    .order("created_at", { ascending: false })
    .limit(300);

  const rows: CommentRow[] = ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => {
    const post = (Array.isArray(r.post) ? r.post[0] : r.post) as { title: string; slug: string } | null;
    return {
      id: r.id as string,
      name: r.name as string,
      email: r.email as string,
      body: r.body as string,
      status: r.status as CommentRow["status"],
      createdAt: r.created_at as string,
      postTitle: post?.title ?? "(deleted post)",
      postSlug: post?.slug ?? null,
    };
  });

  return (
    <BlogAdminShell user={user} active="comments">
      <CommentsManager rows={rows} />
    </BlogAdminShell>
  );
}
