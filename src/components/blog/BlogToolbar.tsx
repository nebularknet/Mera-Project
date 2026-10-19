"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import type { Category } from "@/lib/blog/types";

/** Category chips + search box above the post list. */
export function BlogToolbar({
  categories,
  activeSlug,
  query,
}: {
  categories: Pick<Category, "name" | "slug">[];
  activeSlug: string | null;
  query?: string;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState(query ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/blog?query=${encodeURIComponent(term)}` : "/blog");
  }

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? "border-[#0dcaf0] bg-[#0dcaf0]/10 text-white"
        : "border-white/10 text-white/65 hover:border-white/30 hover:text-white"
    }`;

  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Categories">
        <Link href="/blog" className={chip(activeSlug === null && !query)}>
          Latest
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className={chip(activeSlug === c.slug)}>
            {c.name}
          </Link>
        ))}
      </nav>
      <form onSubmit={submit} role="search" className="relative w-full md:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles…"
          aria-label="Search articles"
          className="h-10 w-full rounded-full border border-white/10 bg-[#121212] pl-9 pr-9 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0dcaf0]/50 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQ("");
              if (query) router.push("/blog");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
