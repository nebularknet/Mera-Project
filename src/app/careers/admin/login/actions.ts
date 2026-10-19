"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";
import { isActiveWriter } from "@/lib/blog/auth";

export type LoginResult = { ok: false; error: string };

/** Only internal dashboard paths are accepted as a post-login destination. */
function safeNext(next: string) {
  return /^\/(careers|blog)\/admin(\/[\w\-/]*)?$/.test(next) ? next : null;
}

/**
 * Email + password sign-in for the careers and blog dashboards.
 *
 * Two gates: valid Supabase credentials AND being allowed in — either the
 * careers allowed_admins list (admins: careers + blog) or an active blog
 * writer (blog only). Admins go to `next` or the careers dashboard; writers
 * always land on the blog dashboard.
 */
export async function signIn(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  const admin = await isAdmin(email);
  if (!admin && !(await isActiveWriter(email))) {
    return { ok: false, error: "This account is not authorized for the dashboard." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: "Invalid email or password." };
  }

  redirect(admin ? (next ?? "/careers/admin") : "/blog/admin");
}
