import type { Metadata } from "next";

import { requireBlogUser } from "@/lib/blog/auth";
import { BlogAdminShell } from "../../shell";
import { PostEditor } from "../../post-editor";
import { loadCategories, loadEditablePost } from "../load";

export const metadata: Metadata = {
  title: "Edit post — Nebulark Blog Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireBlogUser();
  const { id } = await params;
  const [post, categories] = await Promise.all([loadEditablePost(id, user), loadCategories()]);
  const author = (Array.isArray(post.author) ? post.author[0] : post.author) as { name: string } | null;
  return (
    <BlogAdminShell user={user} active="posts">
      {/* key: remount the editor with fresh state after saves/refreshes */}
      <PostEditor
        key={post.updated_at}
        post={post}
        categories={categories}
        role={user.role}
        authorName={author?.name ?? "Unknown"}
      />
    </BlogAdminShell>
  );
}
