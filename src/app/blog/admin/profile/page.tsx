import type { Metadata } from "next";

import { requireBlogUser } from "@/lib/blog/auth";
import { BlogAdminShell } from "../shell";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "My profile — Nebulark Blog Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BlogProfilePage() {
  const user = await requireBlogUser();
  return (
    <BlogAdminShell user={user} active="profile">
      <ProfileForm
        name={user.author.name}
        bio={user.author.bio ?? ""}
        avatarUrl={user.author.avatar_url ?? ""}
        email={user.email}
      />
    </BlogAdminShell>
  );
}
