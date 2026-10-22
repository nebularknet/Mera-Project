import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAdminEmail } from "@/lib/auth/session";
import { getBlogUser } from "@/lib/blog/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogManager, type BlogRow } from "./blog-manager";

export const metadata: Metadata = {
  title: "Manage Blog — Nebulark Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ManageBlogPage() {
  const email = await getAdminEmail();
  if (!email) redirect("/careers/admin/login");
  // Ensures this admin has an author profile (and that the blog tables exist).
  const me = await getBlogUser().catch(() => null);

  const db = createAdminClient();
  const [{ data: posts }, { data: categories }, { data: authors }] = await Promise.all([
    db
      .from("blog_posts")
      .select("id, slug, title, status, published_at, updated_at, view_count, author:blog_authors(name)")
      .order("updated_at", { ascending: false }),
    db.from("blog_categories").select("id, name").order("name"),
    db.from("blog_authors").select("name").order("name"),
  ]);

  const rows: BlogRow[] = ((posts ?? []) as unknown as Record<string, unknown>[]).map((p) => {
    const author = (Array.isArray(p.author) ? p.author[0] : p.author) as { name: string } | null;
    return {
      id: p.id as string,
      slug: p.slug as string,
      title: p.title as string,
      authorName: author?.name ?? "—",
      visible: p.status === "published",
      publishedAt: (p.published_at as string | null) ?? null,
      views: (p.view_count as number) ?? 0,
    };
  });

  return (
    <main style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur lg:px-10">
        <Link
          href="/careers/admin"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 no-underline hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to applications
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Manage <span style={{ color: "#0dcaf0" }}>Blog</span>
        </h1>
        <p className="mt-0.5 text-sm text-white/50">
          Add, edit, show or hide posts on nebulark.net/blog.
        </p>
      </header>

      <div className="w-full px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <BlogManager
            rows={rows}
            categories={(categories ?? []) as { id: string; name: string }[]}
            authorNames={Array.from(new Set((authors ?? []).map((a) => a.name as string)))}
            defaultAuthor={me?.author.name ?? ""}
          />
        </div>
      </div>
    </main>
  );
}
