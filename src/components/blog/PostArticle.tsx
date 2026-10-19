import Link from "next/link";
import { Clock, Tag } from "lucide-react";

import type { PublicAuthor, PostSummary } from "@/lib/blog/types";
import { formatPostDate } from "@/lib/blog/format";
import { AuthorAvatar } from "./AuthorAvatar";
import { ShareButtons } from "./ShareButtons";

/**
 * The article body + header, used by the public post page and the dashboard
 * preview. `html` must already be sanitized (it is sanitized on save).
 */
export function PostArticle({
  post,
  html,
  shareUrl,
}: {
  post: Pick<PostSummary, "title" | "excerpt" | "cover_image_url" | "tags" | "reading_minutes" | "published_at" | "category"> & {
    author: PublicAuthor | null;
  };
  html: string;
  shareUrl?: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4">
      <header className="text-center">
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="text-sm font-semibold uppercase tracking-wide text-[#0dcaf0] hover:underline"
          >
            {post.category.name}
          </Link>
        )}
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white md:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65">{post.excerpt}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-white/55">
          {post.author && <AuthorAvatar author={post.author} size={32} />}
          <span className="font-medium text-white/85">{post.author?.name}</span>
          <span aria-hidden>·</span>
          <span>{post.published_at ? formatPostDate(post.published_at) : "Not published"}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.reading_minutes} min read
          </span>
        </div>
      </header>

      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt=""
          className="mt-10 aspect-[16/9] w-full rounded-2xl border border-white/10 object-cover"
        />
      )}

      <div
        className="blog-post-body prose prose-invert prose-lg mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-white/40" />
          {post.tags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 hover:border-[#0dcaf0]/50 hover:text-white"
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      {shareUrl && (
        <div className="mt-8 border-t border-white/10 pt-6">
          <ShareButtons url={shareUrl} title={post.title} />
        </div>
      )}

      {post.author && (
        <aside className="mt-10 flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <AuthorAvatar author={post.author} size={56} />
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40">Written by</p>
            <p className="text-lg font-semibold text-white">{post.author.name}</p>
            {post.author.bio && <p className="mt-1.5 text-sm leading-relaxed text-white/65">{post.author.bio}</p>}
          </div>
        </aside>
      )}
    </article>
  );
}
