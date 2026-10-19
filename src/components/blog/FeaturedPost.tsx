import Link from "next/link";
import { ArrowRight, Clock, Star } from "lucide-react";

import type { PostSummary } from "@/lib/blog/types";
import { formatPostDate } from "@/lib/blog/format";
import { AuthorAvatar } from "./AuthorAvatar";

/** The pinned featured post at the top of the blog. */
export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <article className="group grid overflow-hidden rounded-2xl border border-[#0dcaf0]/25 bg-white/[0.03] md:grid-cols-2">
      <Link href={`/post/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-white/[0.04] md:aspect-auto md:min-h-[320px]">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0dcaf0]/25 to-transparent text-4xl font-bold text-white/20">
            nebulark
          </div>
        )}
      </Link>
      <div className="flex flex-col justify-center p-6 md:p-10">
        <span className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full bg-[#0dcaf0]/15 px-3 py-1 text-xs font-semibold text-[#0dcaf0]">
          <Star className="h-3 w-3" fill="currentColor" /> Featured
          {post.category && <span className="text-white/60">· {post.category.name}</span>}
        </span>
        <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl">
          <Link href={`/post/${post.slug}`} className="hover:text-[#0dcaf0]">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="mt-4 line-clamp-4 leading-relaxed text-white/70">{post.excerpt}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-white/55">
          {post.author && <AuthorAvatar author={post.author} size={28} />}
          <span>{post.author?.name}</span>
          <span aria-hidden>·</span>
          <span>{formatPostDate(post.published_at)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.reading_minutes} min read
          </span>
        </div>
        <Link
          href={`/post/${post.slug}`}
          className="more-button mt-6 inline-flex items-center gap-1.5 self-start"
        >
          Read article <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
