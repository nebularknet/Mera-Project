import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

/**
 * Returns the logged-in user's email IF they have a valid Supabase session AND
 * are in the allowed_admins allowlist. Returns null otherwise.
 *
 * This is the single authorization gate for the admin dashboard — a valid login
 * alone is not enough; the email must be explicitly allow-listed.
 */
export async function getAdminEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? null;
  if (!email) return null;
  return (await isAdmin(email)) ? email : null;
}
