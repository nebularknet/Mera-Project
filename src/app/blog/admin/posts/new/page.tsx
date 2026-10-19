import type { Metadata } from "next";

import { requireBlogUser } from "@/lib/blog/auth";
import { BlogAdminShell } from "../../shell";
import { PostEditor } from "../../post-editor";
import { loadCategories } from "../load";

export const metadata: Metadata = {
  title: "New post — Nebulark Blog Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const user = await requireBlogUser();
  const categories = await loadCategories();
  return (
    <BlogAdminShell user={user} active="posts">
      <PostEditor post={null} categories={categories} role={user.role} authorName={user.author.name} />
    </BlogAdminShell>
  );
}
