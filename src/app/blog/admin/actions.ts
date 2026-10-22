"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/isAdmin";
import { getBlogUser, type BlogUser } from "@/lib/blog/auth";
import {
  htmlToText,
  normalizeTags,
  readingMinutes,
  sanitizePostHtml,
  slugify,
} from "@/lib/blog/content";
import type { PostStatus } from "@/lib/blog/types";
import { uniqueSlug } from "@/lib/blog/posts";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const BLOG_IMAGES_BUCKET = "blog-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Every action re-checks who is signed in — never trust the page that called it. */
async function currentUser(): Promise<BlogUser | null> {
  try {
    return await getBlogUser();
  } catch {
    return null;
  }
}

function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/blog/admin");
  revalidatePath("/category", "layout");
  if (slug) revalidatePath(`/post/${slug}`);
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export type PostIntent = "save" | "submit" | "publish" | "unpublish" | "send_back";

export type SavePostInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  contentJson: unknown;
  contentHtml: string;
  coverImageUrl: string;
  categoryId: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  intent: PostIntent;
  reviewNote?: string;
};

/**
 * Creates or updates a post and applies the workflow step in `intent`.
 *
 * Writers: own posts only, only while they're drafts; may save or submit for
 * review. Admins: any post; may also publish, unpublish, or send back with a note.
 */
export async function savePost(
  input: SavePostInput
): Promise<ActionResult<{ id: string; slug: string; status: PostStatus }>> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const isAdminUser = user.role === "admin";

  if (!isAdminUser && !["save", "submit"].includes(input.intent)) {
    return { ok: false, error: "Only admins can publish posts." };
  }

  const title = input.title.trim();
  if (title.length < 3 || title.length > 200) {
    return { ok: false, error: "Enter a title (3–200 characters)." };
  }

  const db = createAdminClient();

  // Load the existing post (if any) and check permission to change it.
  type Existing = { id: string; status: PostStatus; author_id: string; slug: string; published_at: string | null };
  let existing: Existing | null = null;
  if (input.id) {
    const { data } = await db
      .from("blog_posts")
      .select("id, status, author_id, slug, published_at")
      .eq("id", input.id)
      .maybeSingle();
    if (!data) return { ok: false, error: "Post not found." };
    existing = data as Existing;
    if (!isAdminUser) {
      if (existing.author_id !== user.author.id) return { ok: false, error: "Not your post." };
      if (existing.status !== "draft") {
        return { ok: false, error: "This post is in review or published and can't be edited." };
      }
    }
  }

  const html = sanitizePostHtml(input.contentHtml ?? "");
  const text = htmlToText(html);

  if ((input.intent === "publish" || input.intent === "submit") && text.length < 20) {
    return { ok: false, error: "Write some content before submitting or publishing." };
  }
  if (input.intent === "send_back" && !input.reviewNote?.trim()) {
    return { ok: false, error: "Add a note for the writer." };
  }

  const slug = await uniqueSlug(slugify(input.slug || title) || `post-${Date.now()}`, existing?.id);

  // Workflow
  let status: PostStatus = existing?.status ?? "draft";
  let reviewNote: string | null | undefined = undefined; // undefined = unchanged
  let publishedAt = existing?.published_at ?? null;
  switch (input.intent) {
    case "submit":
      status = "in_review";
      reviewNote = null;
      break;
    case "publish":
      status = "published";
      reviewNote = null;
      publishedAt = publishedAt ?? new Date().toISOString();
      break;
    case "unpublish":
      status = "draft";
      break;
    case "send_back":
      status = "draft";
      reviewNote = input.reviewNote!.trim().slice(0, 2000);
      break;
  }

  const coverUrl = input.coverImageUrl.trim();
  if (coverUrl && !/^https:\/\//.test(coverUrl)) {
    return { ok: false, error: "Cover image must be an uploaded image." };
  }

  const row = {
    title,
    slug,
    excerpt: input.excerpt.trim().slice(0, 300) || null,
    content_json: input.contentJson ?? {},
    content_html: html,
    content_text: text,
    reading_minutes: readingMinutes(text),
    cover_image_url: coverUrl || null,
    category_id: input.categoryId || null,
    tags: normalizeTags(input.tags),
    seo_title: input.seoTitle.trim().slice(0, 70) || null,
    seo_description: input.seoDescription.trim().slice(0, 160) || null,
    status,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
    ...(reviewNote !== undefined ? { review_note: reviewNote } : {}),
    // An unpublished post can't stay featured.
    ...(status !== "published" ? { featured: false } : {}),
  };

  if (existing) {
    const { error } = await db.from("blog_posts").update(row).eq("id", existing.id);
    if (error) {
      console.error("[savePost] update failed:", error);
      return { ok: false, error: "Could not save the post." };
    }
    revalidateBlog(slug);
    if (existing.slug !== slug) revalidatePath(`/post/${existing.slug}`);
    return { ok: true, id: existing.id, slug, status };
  }

  const { data: created, error } = await db
    .from("blog_posts")
    .insert({ ...row, author_id: user.author.id })
    .select("id")
    .single();
  if (error || !created) {
    console.error("[savePost] insert failed:", error);
    return { ok: false, error: "Could not create the post." };
  }
  revalidateBlog(slug);
  return { ok: true, id: created.id as string, slug, status };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const db = createAdminClient();
  const { data: post } = await db
    .from("blog_posts")
    .select("id, slug, status, author_id")
    .eq("id", id)
    .maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };
  if (user.role !== "admin" && (post.author_id !== user.author.id || post.status !== "draft")) {
    return { ok: false, error: "You can only delete your own drafts." };
  }
  const { error } = await db.from("blog_posts").delete().eq("id", id);
  if (error) {
    console.error("[deletePost] failed:", error);
    return { ok: false, error: "Could not delete the post." };
  }
  revalidateBlog(post.slug as string);
  return { ok: true };
}

/** Makes this the single featured post (or clears it). Published posts only. */
export async function setFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const user = await currentUser();
  if (user?.role !== "admin") return { ok: false, error: "Only admins can feature posts." };
  const db = createAdminClient();
  if (featured) {
    const { data: post } = await db.from("blog_posts").select("status").eq("id", id).maybeSingle();
    if (post?.status !== "published") return { ok: false, error: "Only published posts can be featured." };
    await db.from("blog_posts").update({ featured: false }).eq("featured", true);
  }
  const { error } = await db.from("blog_posts").update({ featured }).eq("id", id);
  if (error) {
    console.error("[setFeatured] failed:", error);
    return { ok: false, error: "Could not update the featured post." };
  }
  revalidateBlog();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

/** Uploads a cover, inline or profile image; returns its public URL. */
export async function uploadBlogImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image." };
  if (!IMAGE_TYPES.includes(file.type)) return { ok: false, error: "Use a JPG, PNG, WebP or GIF image." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const db = createAdminClient();
  const { error } = await db.storage
    .from(BLOG_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("[uploadBlogImage] failed:", error);
    return { ok: false, error: "Could not upload the image." };
  }
  const { data } = db.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

// ---------------------------------------------------------------------------
// Comments (admin)
// ---------------------------------------------------------------------------

export async function approveComment(id: string): Promise<ActionResult> {
  return updateComment(id, "approve");
}

export async function deleteComment(id: string): Promise<ActionResult> {
  return updateComment(id, "delete");
}

async function updateComment(id: string, op: "approve" | "delete"): Promise<ActionResult> {
  const user = await currentUser();
  if (user?.role !== "admin") return { ok: false, error: "Only admins can moderate comments." };
  const db = createAdminClient();
  const { data: c } = await db
    .from("blog_comments")
    .select("id, post:blog_posts(slug)")
    .eq("id", id)
    .maybeSingle();
  if (!c) return { ok: false, error: "Comment not found." };
  const { error } =
    op === "approve"
      ? await db.from("blog_comments").update({ status: "approved" }).eq("id", id)
      : await db.from("blog_comments").delete().eq("id", id);
  if (error) {
    console.error(`[${op}Comment] failed:`, error);
    return { ok: false, error: "Could not update the comment." };
  }
  const post = (Array.isArray(c.post) ? c.post[0] : c.post) as { slug: string } | null;
  revalidatePath("/blog/admin/comments");
  if (post) revalidatePath(`/post/${post.slug}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Categories (admin)
// ---------------------------------------------------------------------------

export async function saveCategory(input: {
  id?: string;
  name: string;
  description: string;
}): Promise<ActionResult> {
  const user = await currentUser();
  if (user?.role !== "admin") return { ok: false, error: "Only admins can manage categories." };
  const name = input.name.trim();
  if (name.length < 2 || name.length > 60) return { ok: false, error: "Enter a name (2–60 characters)." };
  const slug = slugify(name);
  if (!slug) return { ok: false, error: "Use letters or numbers in the name." };

  const db = createAdminClient();
  const row = { name, slug, description: input.description.trim().slice(0, 300) || null };
  const { error } = input.id
    ? await db.from("blog_categories").update(row).eq("id", input.id)
    : await db.from("blog_categories").insert(row);
  if (error) {
    console.error("[saveCategory] failed:", error);
    return {
      ok: false,
      error: error.code === "23505" ? "A category with that name already exists." : "Could not save the category.",
    };
  }
  revalidateBlog();
  revalidatePath("/blog/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const user = await currentUser();
  if (user?.role !== "admin") return { ok: false, error: "Only admins can manage categories." };
  // Posts keep existing; their category is cleared (on delete set null).
  const { error } = await createAdminClient().from("blog_categories").delete().eq("id", id);
  if (error) {
    console.error("[deleteCategory] failed:", error);
    return { ok: false, error: "Could not delete the category." };
  }
  revalidateBlog();
  revalidatePath("/blog/admin/categories");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Writers (admin)
// ---------------------------------------------------------------------------

/** Creates a writer's login (email + temporary password set by the admin). */
export async function createWriter(input: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResult> {
  const user = await currentUser();
  if (user?.role !== "admin") return { ok: false, error: "Only admins can add writers." };

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) return { ok: false, error: "Enter the writer's name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email." };
  if (input.password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (await isAdmin(email)) return { ok: false, error: "That email is already an admin." };

  const db = createAdminClient();
  const { data: existing } = await db.from("blog_authors").select("id").eq("email", email).maybeSingle();
  if (existing) return { ok: false, error: "A writer with that email already exists." };

  const { data: created, error: authErr } = await db.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (authErr || !created.user) {
    console.error("[createWriter] auth create failed:", authErr);
    return {
      ok: false,
      error: /already|registered|exists/i.test(authErr?.message ?? "")
        ? "That email already has a login. Use a different email."
        : "Could not create the login.",
    };
  }

  const { error } = await db
    .from("blog_authors")
    .insert({ email, name, role: "writer", user_id: created.user.id });
  if (error) {
    console.error("[createWriter] profile insert failed:", error);
    await db.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: "Could not create the writer." };
  }
  revalidatePath("/blog/admin/writers");
  return { ok: true };
}

/** Removing a writer blocks their sign-in; their posts stay. */
export async function setWriterActive(id: string, active: boolean): Promise<ActionResult> {
  const user = await currentUser();
  if (user?.role !== "admin") return { ok: false, error: "Only admins can manage writers." };
  const { error } = await createAdminClient()
    .from("blog_authors")
    .update({ active })
    .eq("id", id)
    .eq("role", "writer");
  if (error) {
    console.error("[setWriterActive] failed:", error);
    return { ok: false, error: "Could not update the writer." };
  }
  revalidatePath("/blog/admin/writers");
  return { ok: true };
}

export async function resetWriterPassword(id: string, password: string): Promise<ActionResult> {
  const user = await currentUser();
  if (user?.role !== "admin") return { ok: false, error: "Only admins can manage writers." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  const db = createAdminClient();
  const { data: writer } = await db
    .from("blog_authors")
    .select("user_id")
    .eq("id", id)
    .eq("role", "writer")
    .maybeSingle();
  if (!writer?.user_id) return { ok: false, error: "Writer login not found." };
  const { error } = await db.auth.admin.updateUserById(writer.user_id as string, { password });
  if (error) {
    console.error("[resetWriterPassword] failed:", error);
    return { ok: false, error: "Could not reset the password." };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Own profile
// ---------------------------------------------------------------------------

export async function updateProfile(input: {
  name: string;
  bio: string;
  avatarUrl: string;
}): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) return { ok: false, error: "Enter your name." };
  const avatar = input.avatarUrl.trim();
  if (avatar && !/^https:\/\//.test(avatar)) return { ok: false, error: "Upload a photo instead." };
  const { error } = await createAdminClient()
    .from("blog_authors")
    .update({ name, bio: input.bio.trim().slice(0, 400) || null, avatar_url: avatar || null })
    .eq("id", user.author.id);
  if (error) {
    console.error("[updateProfile] failed:", error);
    return { ok: false, error: "Could not save your profile." };
  }
  revalidateBlog();
  return { ok: true };
}
