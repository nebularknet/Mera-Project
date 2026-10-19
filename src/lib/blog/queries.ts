import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTable } from "./auth";
import type {
  Category,
  Pagination,
  PostSummary,
  PublicComment,
  PublicPost,
} from "./types";

/**
 * Read queries for the public blog. Every query is restricted to published
 * posts / approved comments. If the blog migration hasn't run yet, they return
 * empty results so the public pages still render ("no posts yet").
 */

const SUMMARY_FIELDS =
  "id, slug, title, excerpt, cover_image_url, tags, featured, reading_minutes, published_at, updated_at, " +
  "category:blog_categories(id, name, slug), author:blog_authors(id, name, bio, avatar_url)";

type Row = Record<string, unknown>;

// Supabase types one-to-one joins as arrays in some versions; normalize.
function one<T>(v: unknown): T | null {
  return (Array.isArray(v) ? v[0] : v) as T | null ?? null;
}

function toSummary(row: Row): PostSummary {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: (row.excerpt as string | null) ?? null,
    cover_image_url: (row.cover_image_url as string | null) ?? null,
    tags: (row.tags as string[] | null) ?? [],
    featured: row.featured === true,
    reading_minutes: (row.reading_minutes as number) ?? 1,
    published_at: (row.published_at as string | null) ?? null,
    updated_at: row.updated_at as string,
    category: one(row.category),
    author: one(row.author),
  };
}

function logError(where: string, error: { code?: string; message?: string } | null) {
  if (error && !isMissingTable(error)) console.error(`[blog:${where}]`, error);
}

export type ListOptions = {
  page?: number;
  limit?: number;
  query?: string;
  categorySlug?: string;
  tag?: string;
  excludeId?: string;
};

export async function listPublishedPosts(
  opts: ListOptions = {}
): Promise<{ posts: PostSummary[]; pagination: Pagination }> {
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const limit = opts.limit ?? 6;
  const empty = { posts: [], pagination: paginate(page, limit, 0) };
  const db = createAdminClient();

  let categoryId: string | null = null;
  if (opts.categorySlug) {
    const cat = await getCategoryBySlug(opts.categorySlug);
    if (!cat) return empty;
    categoryId = cat.id;
  }

  let q = db
    .from("blog_posts")
    .select(SUMMARY_FIELDS, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (categoryId) q = q.eq("category_id", categoryId);
  if (opts.tag) q = q.contains("tags", [opts.tag]);
  if (opts.excludeId) q = q.neq("id", opts.excludeId);
  if (opts.query?.trim()) {
    q = q.textSearch("search", opts.query.trim(), { type: "websearch", config: "english" });
  }

  const { data, error, count } = await q;
  if (error) {
    logError("listPublishedPosts", error);
    return empty;
  }
  return {
    posts: ((data ?? []) as unknown as Row[]).map(toSummary),
    pagination: paginate(page, limit, count ?? 0),
  };
}

function paginate(page: number, limit: number, total: number): Pagination {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
}

export async function getFeaturedPost(): Promise<PostSummary | null> {
  const { data, error } = await createAdminClient()
    .from("blog_posts")
    .select(SUMMARY_FIELDS)
    .eq("status", "published")
    .eq("featured", true)
    .maybeSingle();
  logError("getFeaturedPost", error);
  return data ? toSummary(data as unknown as Row) : null;
}

export async function getPublishedPost(slug: string): Promise<PublicPost | null> {
  const { data, error } = await createAdminClient()
    .from("blog_posts")
    .select(`${SUMMARY_FIELDS}, content_html, seo_title, seo_description`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  logError("getPublishedPost", error);
  if (!data) return null;
  const row = data as unknown as Row;
  return {
    ...toSummary(row),
    content_html: (row.content_html as string) ?? "",
    seo_title: (row.seo_title as string | null) ?? null,
    seo_description: (row.seo_description as string | null) ?? null,
  };
}

/** Same category or shared tags first, topped up with the latest posts. */
export async function getRelatedPosts(post: PostSummary, limit = 3): Promise<PostSummary[]> {
  const db = createAdminClient();
  const filters: string[] = [];
  if (post.category) filters.push(`category_id.eq.${post.category.id}`);
  if (post.tags.length) filters.push(`tags.ov.{${post.tags.map((t) => `"${t}"`).join(",")}}`);

  let related: PostSummary[] = [];
  if (filters.length) {
    const { data, error } = await db
      .from("blog_posts")
      .select(SUMMARY_FIELDS)
      .eq("status", "published")
      .neq("id", post.id)
      .or(filters.join(","))
      .order("published_at", { ascending: false })
      .limit(limit);
    logError("getRelatedPosts", error);
    related = ((data ?? []) as unknown as Row[]).map(toSummary);
  }
  if (related.length < limit) {
    const { posts } = await listPublishedPosts({ limit: limit + related.length + 1, excludeId: post.id });
    for (const p of posts) {
      if (related.length >= limit) break;
      if (!related.some((r) => r.id === p.id)) related.push(p);
    }
  }
  return related;
}

export async function getCategories(): Promise<(Category & { postCount: number })[]> {
  const db = createAdminClient();
  const [{ data: cats, error }, { data: posts }] = await Promise.all([
    db.from("blog_categories").select("id, name, slug, description").order("name"),
    db.from("blog_posts").select("category_id").eq("status", "published"),
  ]);
  logError("getCategories", error);
  const counts = new Map<string, number>();
  for (const p of posts ?? []) {
    if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }
  return ((cats ?? []) as Category[]).map((c) => ({ ...c, postCount: counts.get(c.id) ?? 0 }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await createAdminClient()
    .from("blog_categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .maybeSingle();
  logError("getCategoryBySlug", error);
  return (data as Category | null) ?? null;
}

export async function getApprovedComments(postId: string): Promise<PublicComment[]> {
  const { data, error } = await createAdminClient()
    .from("blog_comments")
    .select("id, name, body, created_at")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  logError("getApprovedComments", error);
  return (data as PublicComment[] | null) ?? [];
}

/** Lightweight list for the sitemap and RSS feed. */
export async function getAllPublishedForFeeds(limit = 1000) {
  const { data, error } = await createAdminClient()
    .from("blog_posts")
    .select("slug, title, excerpt, published_at, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  logError("getAllPublishedForFeeds", error);
  return (data ?? []) as {
    slug: string;
    title: string;
    excerpt: string | null;
    published_at: string | null;
    updated_at: string;
  }[];
}
