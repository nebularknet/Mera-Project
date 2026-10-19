import "server-only";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/isAdmin";
import type { Author } from "./types";

export type BlogUser = { email: string; role: Author["role"]; author: Author };

/** Postgres/PostgREST "table does not exist" — the blog migration hasn't run. */
export function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const msg = error.message ?? "";
  return /blog_\w+/.test(msg) && /does not exist|schema cache/.test(msg);
}

export class BlogNotSetUpError extends Error {}

function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * The signed-in blog user, or null.
 *
 * - Careers admins (allowed_admins) are blog admins. Their author profile is
 *   created on first visit, and kept in sync if the allow-list changes.
 * - Writers are active blog_authors rows with role "writer", created by an admin.
 *
 * Throws BlogNotSetUpError if supabase/blog-schema.sql hasn't been run.
 */
export async function getBlogUser(): Promise<BlogUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase().trim();
  if (!email) return null;

  const db = createAdminClient();
  const { data: existing, error } = await db
    .from("blog_authors")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) throw new BlogNotSetUpError();
    console.error("[getBlogUser] lookup failed:", error);
    return null;
  }

  if (await isAdmin(email)) {
    if (!existing) {
      const { data: created, error: insErr } = await db
        .from("blog_authors")
        .insert({ email, name: nameFromEmail(email), role: "admin" })
        .select("*")
        .single();
      if (insErr || !created) {
        console.error("[getBlogUser] admin profile create failed:", insErr);
        return null;
      }
      return { email, role: "admin", author: created as Author };
    }
    if (existing.role !== "admin" || !existing.active) {
      await db.from("blog_authors").update({ role: "admin", active: true }).eq("id", existing.id);
    }
    return { email, role: "admin", author: { ...(existing as Author), role: "admin", active: true } };
  }

  if (existing && existing.role === "writer" && existing.active) {
    return { email, role: "writer", author: existing as Author };
  }
  return null;
}

/**
 * Page guard for /blog/admin: signs-in redirect, or the setup notice when the
 * migration hasn't been run.
 */
export async function requireBlogUser(opts: { adminOnly?: boolean } = {}): Promise<BlogUser> {
  let user: BlogUser | null;
  try {
    user = await getBlogUser();
  } catch (err) {
    if (err instanceof BlogNotSetUpError) redirect("/blog/admin/setup");
    throw err;
  }
  if (!user) redirect("/careers/admin/login?next=/blog/admin");
  if (opts.adminOnly && user.role !== "admin") redirect("/blog/admin");
  return user;
}

/** True if this email belongs to an active writer (used by the shared login). */
export async function isActiveWriter(email: string): Promise<boolean> {
  const { data, error } = await createAdminClient()
    .from("blog_authors")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .eq("role", "writer")
    .eq("active", true)
    .maybeSingle();
  if (error && !isMissingTable(error)) console.error("[isActiveWriter] failed:", error);
  return Boolean(data);
}
