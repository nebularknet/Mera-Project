import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Footer from "@/components/Footer";
import { FullWidthHeader } from "@/components/FullWidthHeader";
import { getCategories } from "@/lib/blog/queries";

export const metadata: Metadata = {
  title: "Categories — Nebulark Blog",
  description: "Browse Nebulark blog articles by topic.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="blog-page pt-20">
        <FullWidthHeader
          title="Categories"
          description="Browse articles by topic."
          breadcrumb={[
            { label: "Blog", href: "/blog" },
            { label: "Categories", href: "/category" },
          ]}
        />
        <div className="container mx-auto max-w-6xl px-4 pb-16">
          {categories.length === 0 ? (
            <p className="text-center text-white/60">No categories yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:border-[#0dcaf0]/40"
                >
                  <span className="text-xl font-bold text-white group-hover:text-[#0dcaf0]">{c.name}</span>
                  {c.description && <span className="mt-2 text-sm text-white/60">{c.description}</span>}
                  <span className="mt-auto flex items-center justify-between pt-5 text-sm text-white/45">
                    {c.postCount} article{c.postCount === 1 ? "" : "s"}
                    <ArrowRight className="h-4 w-4 text-[#0dcaf0] transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
