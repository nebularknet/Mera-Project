"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminEmail } from "@/lib/auth/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/** Finds the Supabase Auth user for an email (the admin API has no lookup by email). */
async function findAuthUser(db: SupabaseClient, email: string): Promise<User | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error("[findAuthUser] listUsers failed:", error);
      return null;
    }
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 1000) return null;
  }
  return null;
}

/** Sets a login's password, creating the login if the email has none yet. */
async function setPassword(db: SupabaseClient, email: string, password: string): Promise<string | null> {
  const user = await findAuthUser(db, email);
  const { error } = user
    ? await db.auth.admin.updateUserById(user.id, { password, email_confirm: true })
    : await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    console.error("[setPassword] failed:", error);
    return /password/i.test(error.message) ? error.message : "Could not set the password.";
  }
  return null;
}

/** Adds an admin (dashboard access to careers + blog) with a password. */
export async function addAdmin(emailRaw: string, password: string): Promise<ActionResult> {
  if (!(await getAdminEmail())) return { ok: false, error: "Not authorized." };
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const db = createAdminClient();
  const { data: existing } = await db.from("allowed_admins").select("email").eq("email", email).maybeSingle();
  if (existing) return { ok: false, error: "That email is already an admin. Use Change password instead." };

  const pwError = await setPassword(db, email, password);
  if (pwError) return { ok: false, error: pwError };

  const { error } = await db.from("allowed_admins").insert({ email });
  if (error) {
    console.error("[addAdmin] insert failed:", error);
    return { ok: false, error: "Could not add the admin." };
  }
  revalidatePath("/careers/admin/admins");
  return { ok: true };
}

/** Changes another admin's (or your own) password — e.g. when they've forgotten it. */
export async function changeAdminPassword(emailRaw: string, password: string): Promise<ActionResult> {
  if (!(await getAdminEmail())) return { ok: false, error: "Not authorized." };
  const email = emailRaw.trim().toLowerCase();
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }
  const db = createAdminClient();
  const { data: admin } = await db.from("allowed_admins").select("email").eq("email", email).maybeSingle();
  if (!admin) return { ok: false, error: "That email isn't an admin." };

  const pwError = await setPassword(db, email, password);
  if (pwError) return { ok: false, error: pwError };
  return { ok: true };
}

/** Removes dashboard access. You can't remove yourself or the last admin. */
export async function removeAdmin(emailRaw: string): Promise<ActionResult> {
  const me = await getAdminEmail();
  if (!me) return { ok: false, error: "Not authorized." };
  const email = emailRaw.trim().toLowerCase();
  if (email === me.toLowerCase()) return { ok: false, error: "You can't remove yourself." };

  const db = createAdminClient();
  const { count } = await db.from("allowed_admins").select("email", { count: "exact", head: true });
  if ((count ?? 0) <= 1) return { ok: false, error: "There must always be at least one admin." };

  const { error } = await db.from("allowed_admins").delete().eq("email", email);
  if (error) {
    console.error("[removeAdmin] failed:", error);
    return { ok: false, error: "Could not remove the admin." };
  }
  revalidatePath("/careers/admin/admins");
  return { ok: true };
}
