"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminEmail } from "@/lib/auth/session";
import { normalizeTags, slugify } from "@/lib/blog/content";
import { authorIdForName, bodyFields, uniqueSlug } from "@/lib/blog/posts";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

function revalidateBlog(slug?: string) {
  revalidatePath("/careers/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/category", "layout");
  revalidatePath("/blog/admin");
  if (slug) revalidatePath(`/post/${slug}`);
}

export type BlogPostInput = {
  id?: string;
  title: string;
  authorName: string;
  categoryId: string;
  coverImageUrl: string;
  excerpt: string;
  tags: string;
  contentJson: unknown;
  contentHtml: string;
  visible: boolean;
};

/** Adds or updates a post from the Manage Blog popup (careers admins only). */
export async function saveBlogPost(input: BlogPostInput): Promise<ActionResult<{ id: string; slug: string }>> {
  if (!(await getAdminEmail())) return { ok: false, error: "Not authorized." };

  const title = input.title.trim();
  if (title.length < 3 || title.length > 200) return { ok: false, error: "Enter a title (3–200 characters)." };
  if (input.authorName.trim().length < 2) return { ok: false, error: "Enter the author's name." };
  const cover = input.coverImageUrl.trim();
  if (cover && !/^https:\/\//.test(cover)) return { ok: false, error: "Upload the image instead of pasting a link." };

  const body = bodyFields(input.contentHtml);
  if (input.visible && body.content_text.length < 20) {
    return { ok: false, error: "Write some content before showing the post on the website." };
  }

  const authorId = await authorIdForName(input.authorName);
  if (!authorId) return { ok: false, error: "Could not save the author." };

  const db = createAdminClient();
  type Existing = { id: string; slug: string; published_at: string | null };
  let existing: Existing | null = null;
  if (input.id) {
    const { data } = await db.from("blog_posts").select("id, slug, published_at").eq("id", input.id).maybeSingle();
    if (!data) return { ok: false, error: "Post not found." };
    existing = data as Existing;
  }

  const now = new Date().toISOString();
  const slug = existing?.slug ?? (await uniqueSlug(slugify(title) || `post-${Date.now()}`));
  const row = {
    title,
    excerpt: input.excerpt.trim().slice(0, 300) || null,
    content_json: input.contentJson ?? {},
    ...body,
    cover_image_url: cover || null,
    category_id: input.categoryId || null,
    tags: normalizeTags(input.tags),
    author_id: authorId,
    status: input.visible ? "published" : "draft",
    review_note: null,
    published_at: input.visible ? (existing?.published_at ?? now) : (existing?.published_at ?? null),
    updated_at: now,
    ...(input.visible ? {} : { featured: false }),
  };

  if (existing) {
    const { error } = await db.from("blog_posts").update(row).eq("id", existing.id);
    if (error) {
      console.error("[saveBlogPost] update failed:", error);
      return { ok: false, error: "Could not save the post." };
    }
    revalidateBlog(slug);
    return { ok: true, id: existing.id, slug };
  }

  const { data: created, error } = await db
    .from("blog_posts")
    .insert({ ...row, slug })
    .select("id")
    .single();
  if (error || !created) {
    console.error("[saveBlogPost] insert failed:", error);
    return { ok: false, error: "Could not add the post." };
  }
  revalidateBlog(slug);
  return { ok: true, id: created.id as string, slug };
}

/** Loads a post's full content into the edit popup. */
export async function getBlogPostForEdit(id: string): Promise<
  ActionResult<{
    post: {
      id: string;
      title: string;
      authorName: string;
      categoryId: string;
      coverImageUrl: string;
      excerpt: string;
      tags: string;
      contentJson: unknown;
      visible: boolean;
    };
  }>
> {
  if (!(await getAdminEmail())) return { ok: false, error: "Not authorized." };
  const { data } = await createAdminClient()
    .from("blog_posts")
    .select("id, title, excerpt, cover_image_url, category_id, tags, content_json, status, author:blog_authors(name)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return { ok: false, error: "Post not found." };
  const author = (Array.isArray(data.author) ? data.author[0] : data.author) as { name: string } | null;
  return {
    ok: true,
    post: {
      id: data.id as string,
      title: data.title as string,
      authorName: author?.name ?? "",
      categoryId: (data.category_id as string | null) ?? "",
      coverImageUrl: (data.cover_image_url as string | null) ?? "",
      excerpt: (data.excerpt as string | null) ?? "",
      tags: ((data.tags as string[] | null) ?? []).join(", "),
      contentJson: data.content_json,
      visible: data.status === "published",
    },
  };
}

/** View = show on the website (published); Hide = take it off (draft). */
export async function setBlogPostVisible(id: string, visible: boolean): Promise<ActionResult> {
  if (!(await getAdminEmail())) return { ok: false, error: "Not authorized." };
  const db = createAdminClient();
  const { data: post } = await db
    .from("blog_posts")
    .select("slug, published_at, content_text")
    .eq("id", id)
    .maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };
  if (visible && ((post.content_text as string) ?? "").length < 20) {
    return { ok: false, error: "This post has no content yet — edit it first." };
  }
  const { error } = await db
    .from("blog_posts")
    .update(
      visible
        ? { status: "published", published_at: post.published_at ?? new Date().toISOString() }
        : { status: "draft", featured: false }
    )
    .eq("id", id);
  if (error) {
    console.error("[setBlogPostVisible] failed:", error);
    return { ok: false, error: "Could not update the post." };
  }
  revalidateBlog(post.slug as string);
  return { ok: true };
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  if (!(await getAdminEmail())) return { ok: false, error: "Not authorized." };
  const db = createAdminClient();
  const { data: post } = await db.from("blog_posts").select("slug").eq("id", id).maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };
  // Comments are removed with the post (on delete cascade).
  const { error } = await db.from("blog_posts").delete().eq("id", id);
  if (error) {
    console.error("[deleteBlogPost] failed:", error);
    return { ok: false, error: "Could not delete the post." };
  }
  revalidateBlog(post.slug as string);
  return { ok: true };
}
