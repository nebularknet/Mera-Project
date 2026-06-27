import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the SERVICE_ROLE key. Bypasses RLS.
 *
 * SECURITY: server-only. The `import "server-only"` above makes the build fail
 * if this module is ever imported into client code. Use it exclusively in
 * Server Actions / Route Handlers for:
 *   - inserting applications + uploading CVs (apply form)
 *   - reading applications and writing status history (dashboard)
 *   - generating short-lived signed URLs for CV downloads
 *
 * Never return the raw service-role client or its key to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/** Private bucket that stores applicant CVs. */
export const CV_BUCKET = "cvs";
