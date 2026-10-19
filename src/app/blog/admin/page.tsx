import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { requireBlogUser } from "@/lib/blog/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PostStatus } from "@/lib/blog/types";
import { BlogAdminShell } from "./shell";
import { PostsTable, type PostRow } from "./posts-table";

export const metadata: Metadata = {
  title: "Posts — Nebulark Blog Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FILTERS: { id: "all" | PostStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "in_review", label: "In review" },
  { id: "published", label: "Published" },
];

type SearchParams = Promise<{ status?: string }>;

export default async function BlogAdminPostsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireBlogUser();
  const { status: statusParam } = await searchParams;
  const status = FILTERS.some((f) => f.id === statusParam) ? (statusParam as PostStatus | "all") : "all";

  const db = createAdminClient();
  let query = db
    .from("blog_posts")
    .select(
      "id, slug, title, status, featured, view_count, updated_at, published_at, review_note, author_id, " +
        "author:blog_authors(name), category:blog_categories(name)"
    )
    .order("updated_at", { ascending: false });
  // Writers only ever see their own posts.
  if (user.role === "writer") query = query.eq("author_id", user.author.id);
  const { data } = await query;

  const all = ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => {
    const author = (Array.isArray(r.author) ? r.author[0] : r.author) as { name: string } | null;
    const category = (Array.isArray(r.category) ? r.category[0] : r.category) as { name: string } | null;
    return {
      id: r.id as string,
      slug: r.slug as string,
      title: r.title as string,
      status: r.status as PostStatus,
      featured: r.featured === true,
      viewCount: (r.view_count as number) ?? 0,
      updatedAt: r.updated_at as string,
      reviewNote: (r.review_note as string | null) ?? null,
      authorName: author?.name ?? "—",
      categoryName: category?.name ?? null,
      isOwn: r.author_id === user.author.id,
    } satisfies PostRow;
  });

  const counts = {
    all: all.length,
    draft: all.filter((p) => p.status === "draft").length,
    in_review: all.filter((p) => p.status === "in_review").length,
    published: all.filter((p) => p.status === "published").length,
  };
  const rows = status === "all" ? all : all.filter((p) => p.status === status);

  return (
    <BlogAdminShell user={user} active="posts">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={f.id === "all" ? "/blog/admin" : `/blog/admin?status=${f.id}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                status === f.id
                  ? "border-[#0dcaf0] bg-[#0dcaf0]/10 text-white"
                  : "border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  f.id === "in_review" && counts.in_review > 0 && user.role === "admin"
                    ? "bg-yellow-400/20 text-yellow-300"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {counts[f.id]}
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/blog/admin/posts/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0dcaf0] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#0dcaf0]/90"
        >
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      {user.role === "admin" && counts.in_review > 0 && status !== "in_review" && (
        <p className="mb-4 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
          {counts.in_review} post{counts.in_review === 1 ? " is" : "s are"} waiting for your review.{" "}
          <Link href="/blog/admin?status=in_review" className="font-semibold underline">
            Review now
          </Link>
        </p>
      )}

      <PostsTable rows={rows} isAdmin={user.role === "admin"} />
    </BlogAdminShell>
  );
}
