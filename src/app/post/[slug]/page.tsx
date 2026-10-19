import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { BlogPosting, WithContext } from "schema-dts";

import Footer from "@/components/Footer";
import { PostArticle } from "@/components/blog/PostArticle";
import { PostCard } from "@/components/blog/PostCard";
import { Comments } from "@/components/blog/Comments";
import { ViewTracker } from "@/components/blog/ViewTracker";
import { getApprovedComments, getPublishedPost, getRelatedPosts } from "@/lib/blog/queries";
import { getOgImageUrl } from "@/lib/ogImage";
import { BLOG, postUrl } from "@/lib/blog/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Article not found — Nebulark Blog" };

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || BLOG.description;
  const image = post.cover_image_url || getOgImageUrl(post.title);
  return {
    title: `${title} — Nebulark Blog`,
    description,
    alternates: { canonical: postUrl(post.slug) },
    openGraph: {
      type: "article",
      title,
      description,
      url: postUrl(post.slug),
      images: [image],
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author.name] : undefined,
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const [related, comments] = await Promise.all([getRelatedPosts(post), getApprovedComments(post.id)]);

  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description || post.excerpt || undefined,
    image: post.cover_image_url || getOgImageUrl(post.title),
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
    publisher: { "@type": "Organization", name: "Nebulark" },
    mainEntityOfPage: postUrl(post.slug),
    keywords: post.tags.join(", ") || undefined,
  };

  return (
    <>
      <div className="blog-page pt-28 pb-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <ViewTracker postId={post.id} />

        <div className="mx-auto mb-8 max-w-3xl px-4">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
        </div>

        <PostArticle post={post} html={post.content_html} shareUrl={postUrl(post.slug)} />

        <Comments postId={post.id} comments={comments} />

        {related.length > 0 && (
          <section className="mx-auto mt-16 max-w-6xl px-4">
            <h2 className="mb-6 text-2xl font-bold text-white">Related articles</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} compact />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
