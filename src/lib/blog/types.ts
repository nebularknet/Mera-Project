export type PostStatus = "draft" | "in_review" | "published";
export type AuthorRole = "admin" | "writer";
export type CommentStatus = "pending" | "approved";

export type Author = {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  role: AuthorRole;
  active: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

/** Author fields that are safe to show publicly (no email). */
export type PublicAuthor = Pick<Author, "id" | "name" | "bio" | "avatar_url">;

/** A published post as listed on the blog (no body). */
export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[];
  featured: boolean;
  reading_minutes: number;
  published_at: string | null;
  updated_at: string;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  author: PublicAuthor | null;
};

/** A full published post for its own page. */
export type PublicPost = PostSummary & {
  content_html: string;
  seo_title: string | null;
  seo_description: string | null;
};

/** A post as loaded into the dashboard editor. */
export type EditablePost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_json: unknown;
  cover_image_url: string | null;
  category_id: string | null;
  tags: string[];
  status: PostStatus;
  review_note: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  view_count: number;
  author_id: string;
  published_at: string | null;
  updated_at: string;
};

export type PublicComment = {
  id: string;
  name: string;
  body: string;
  created_at: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
};
