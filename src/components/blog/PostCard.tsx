import Link from "next/link";
import { Clock } from "lucide-react";

import type { PostSummary } from "@/lib/blog/types";
import { formatPostDate } from "@/lib/blog/format";
import { AuthorAvatar } from "./AuthorAvatar";

/** Post card used on the blog, category pages and related posts. */
export function PostCard({ post, compact = false }: { post: PostSummary; compact?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors hover:border-[#0dcaf0]/40">
      <Link href={`/post/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-white/[0.04]">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0dcaf0]/20 to-transparent text-3xl font-bold text-white/20">
            nebulark
          </div>
        )}
      </Link>
      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-6"}`}>
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="mb-2 self-start text-xs font-semibold uppercase tracking-wide text-[#0dcaf0] hover:underline"
          >
            {post.category.name}
          </Link>
        )}
        <h2 className={`font-bold leading-snug text-white ${compact ? "text-lg" : "text-xl md:text-2xl"}`}>
          <Link href={`/post/${post.slug}`} className="hover:text-[#0dcaf0]">
            {post.title}
          </Link>
        </h2>
        {!compact && post.excerpt && (
          <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-white/65">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-white/50">
          {post.author && <AuthorAvatar author={post.author} size={24} />}
          <span className="truncate">{post.author?.name}</span>
          <span aria-hidden>·</span>
          <span className="whitespace-nowrap">{formatPostDate(post.published_at)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Clock className="h-3 w-3" /> {post.reading_minutes} min read
          </span>
        </div>
      </div>
    </article>
  );
}

export function PostGrid({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
