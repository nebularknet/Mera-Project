import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import { FullWidthHeader } from "@/components/FullWidthHeader";
import { PostPagination } from "@/components/PostPagination";
import { BlogToolbar } from "@/components/blog/BlogToolbar";
import { PostGrid } from "@/components/blog/PostCard";
import { getCategories, getCategoryBySlug, listPublishedPosts } from "@/lib/blog/queries";
import { getOgImageUrl } from "@/lib/ogImage";

export const dynamic = "force-dynamic";

type Params = Promise<{ tag: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tag } = await params;
  const category = await getCategoryBySlug(tag);
  if (!category) return { title: "Category not found — Nebulark Blog" };
  const title = `${category.name} — Nebulark Blog`;
  const description = category.description || `Articles about ${category.name} from the Nebulark team.`;
  return { title, description, openGraph: { title, description, images: [getOgImageUrl(title)] } };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { tag } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const category = await getCategoryBySlug(tag);
  if (!category) notFound();

  const [categories, { posts, pagination }] = await Promise.all([
    getCategories(),
    listPublishedPosts({ page, limit: 9, categorySlug: category.slug }),
  ]);

  return (
    <>
      <div className="blog-page pt-20">
        <FullWidthHeader
          title={category.name}
          description={category.description ?? ""}
          breadcrumb={[
            { label: "Blog", href: "/blog" },
            { label: "Categories", href: "/category" },
            { label: category.name, href: `/category/${category.slug}` },
          ]}
        />
        <div className="container mx-auto max-w-6xl px-4 pb-16">
          <BlogToolbar
            categories={categories.filter((c) => c.postCount > 0 || c.slug === category.slug)}
            activeSlug={category.slug}
          />
          <div className="mt-8">
            {posts.length > 0 ? (
              <PostGrid posts={posts} />
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-16 text-center text-lg text-white/70">
                No articles in this category yet.
              </div>
            )}
          </div>
          <PostPagination
            pagination={pagination}
            className="mt-14 blog-pagination"
            basePath={`/category/${category.slug}`}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
