import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";

import { PostPagination } from "@/components/PostPagination";
import { FullWidthHeader } from "@/components/FullWidthHeader";
import Footer from "@/components/Footer";
import { BlogToolbar } from "@/components/blog/BlogToolbar";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import { PostGrid } from "@/components/blog/PostCard";
import { getCategories, getFeaturedPost, listPublishedPosts } from "@/lib/blog/queries";
import { getOgImageUrl } from "@/lib/ogImage";
import { BLOG } from "@/lib/blog/site";

export const metadata: Metadata = {
  title: `Blog — Nebulark`,
  description: BLOG.description,
  alternates: { types: { "application/rss+xml": "/rss" } },
  openGraph: {
    title: "Blog — Nebulark",
    description: BLOG.description,
    images: [getOgImageUrl("Nebulark Blog")],
  },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ query?: string; page?: string; tag?: string }>;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const query = sp.query?.trim() || undefined;
  const tag = sp.tag?.trim().toLowerCase() || undefined;
  const filtered = Boolean(query || tag);

  // The featured post is pinned on the first page of the unfiltered list.
  const showFeatured = page === 1 && !filtered;
  const [featured, categories] = await Promise.all([
    showFeatured ? getFeaturedPost() : Promise.resolve(null),
    getCategories(),
  ]);
  const { posts, pagination } = await listPublishedPosts({
    page,
    limit: 9,
    query,
    tag,
    excludeId: featured?.id,
  });

  return (
    <>
      <div className="blog-page pt-20">
        <FullWidthHeader title="Nebulark Blog" description={BLOG.description} />
        <div className="container mx-auto max-w-6xl px-4 pb-16">
          <BlogToolbar
            categories={categories.filter((c) => c.postCount > 0)}
            activeSlug={null}
            query={query}
          />

          {filtered && (
            <div className="mt-6 flex flex-wrap items-center gap-3 text-white/70">
              <span>
                {pagination.total} result{pagination.total === 1 ? "" : "s"}
                {query && <> for &ldquo;<span className="text-white">{query}</span>&rdquo;</>}
                {tag && <> tagged <span className="text-white">#{tag}</span></>}
              </span>
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-[#0dcaf0] hover:underline">
                <X className="h-3.5 w-3.5" /> Clear
              </Link>
            </div>
          )}

          {featured && (
            <div className="mt-8">
              <FeaturedPost post={featured} />
            </div>
          )}

          <div className="mt-8">
            {posts.length > 0 ? (
              <PostGrid posts={posts} />
            ) : (
              !featured && (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-16 text-center">
                  <p className="text-lg text-white/70">
                    {filtered ? "No articles match your search." : "No articles yet — check back soon."}
                  </p>
                </div>
              )
            )}
          </div>

          <PostPagination
            pagination={pagination}
            className="mt-14 blog-pagination"
            query={query}
            tag={tag}
            basePath="/blog"
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
