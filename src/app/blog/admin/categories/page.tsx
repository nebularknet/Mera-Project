import type { Metadata } from "next";

import { requireBlogUser } from "@/lib/blog/auth";
import { getCategories } from "@/lib/blog/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogAdminShell } from "../shell";
import { CategoriesManager } from "./categories-manager";

export const metadata: Metadata = {
  title: "Categories — Nebulark Blog Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BlogCategoriesPage() {
  const user = await requireBlogUser({ adminOnly: true });
  const [categories, { data: posts }] = await Promise.all([
    getCategories(),
    createAdminClient().from("blog_posts").select("category_id"),
  ]);
  // Count all posts (any status) so admins see what a delete would affect.
  const counts = new Map<string, number>();
  for (const p of posts ?? []) if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);

  return (
    <BlogAdminShell user={user} active="categories">
      <CategoriesManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          postCount: counts.get(c.id) ?? 0,
        }))}
      />
    </BlogAdminShell>
  );
}
