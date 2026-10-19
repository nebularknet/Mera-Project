import type { PublicAuthor } from "@/lib/blog/types";
import { initials } from "@/lib/blog/format";

export function AuthorAvatar({ author, size = 32 }: { author: Pick<PublicAuthor, "name" | "avatar_url">; size?: number }) {
  return author.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={author.avatar_url}
      alt={author.name}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#0dcaf0]/20 font-semibold text-[#0dcaf0]"
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    >
      {initials(author.name)}
    </span>
  );
}
