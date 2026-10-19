import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";

import { requireBlogUser } from "@/lib/blog/auth";
import { STATUS_LABEL, type PublicAuthor } from "@/lib/blog/types";
import { PostArticle } from "@/components/blog/PostArticle";
import { loadEditablePost } from "../../load";

export const metadata: Metadata = {
  title: "Preview — Nebulark Blog Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Shows a draft exactly as it will look on the public site (signed-in users only). */
export default async function PreviewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireBlogUser();
  const { id } = await params;
  const post = await loadEditablePost(id, user);
  const author = (Array.isArray(post.author) ? post.author[0] : post.author) as PublicAuthor | null;
  const category = (Array.isArray(post.category) ? post.category[0] : post.category) as
    | { id: string; name: string; slug: string }
    | null;

  return (
    <div style={{ backgroundColor: "#000000", minHeight: "100vh" }} className="blog-page pb-16">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-yellow-400/30 bg-yellow-400/10 px-6 py-3 text-sm text-yellow-100 backdrop-blur">
        <span className="inline-flex items-center gap-2">
          <Eye className="h-4 w-4" /> Preview of the last saved version — {STATUS_LABEL[post.status]}
          {post.status === "published" ? "" : ". Not visible to the public yet."}
        </span>
        <Link href={`/blog/admin/posts/${post.id}`} className="inline-flex items-center gap-1.5 font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to editor
        </Link>
      </div>
      <div className="pt-12">
        <PostArticle
          post={{
            title: post.title,
            excerpt: post.excerpt,
            cover_image_url: post.cover_image_url,
            tags: post.tags ?? [],
            reading_minutes: post.reading_minutes,
            published_at: post.published_at,
            category,
            author,
          }}
          html={post.content_html}
        />
      </div>
    </div>
  );
}
