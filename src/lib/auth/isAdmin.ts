import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Returns true if the given email is in the allowed_admins allowlist.
 * Used to gate the /careers/admin dashboard after a Supabase Auth login.
 *
 * Lookup runs with the service-role client because allowed_admins has no
 * public RLS policy (server-side access only).
 */
export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("allowed_admins")
    .select("email")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    console.error("[isAdmin] lookup failed:", error);
    return false;
  }
  return Boolean(data);
}
