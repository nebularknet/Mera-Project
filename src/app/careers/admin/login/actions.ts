"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export type LoginResult = { ok: false; error: string };

/**
 * Email + password sign-in for the careers admin dashboard.
 *
 * Two gates: valid Supabase credentials AND membership in allowed_admins. If a
 * valid Supabase user is not allow-listed we sign them straight back out so no
 * session lingers. On success we redirect to the dashboard.
 */
export async function signIn(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  if (!(await isAdmin(email))) {
    return { ok: false, error: "This account is not authorized for the dashboard." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: "Invalid email or password." };
  }

  redirect("/careers/admin");
}
