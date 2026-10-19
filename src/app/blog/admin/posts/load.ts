import "server-only";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogUser } from "@/lib/blog/auth";
import type { Category, EditablePost } from "@/lib/blog/types";

export async function loadCategories() {
  const { data } = await createAdminClient().from("blog_categories").select("id, name").order("name");
  return (data ?? []) as Pick<Category, "id" | "name">[];
}

/** Loads a post for the dashboard; writers can only open their own. */
export async function loadEditablePost(id: string, user: BlogUser) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await createAdminClient()
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, content_json, content_html, cover_image_url, category_id, tags, status, review_note, " +
        "featured, seo_title, seo_description, view_count, author_id, published_at, updated_at, reading_minutes, " +
        "author:blog_authors(id, name, bio, avatar_url), category:blog_categories(id, name, slug)"
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const row = data as unknown as EditablePost & {
    content_html: string;
    reading_minutes: number;
    author: unknown;
    category: unknown;
  };
  if (user.role !== "admin" && row.author_id !== user.author.id) notFound();
  return row;
}
