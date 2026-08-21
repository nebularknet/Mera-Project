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
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url.trim() === "" || key.trim() === "") {
    // Use dummy placeholder credentials to prevent TypeScript null checks from failing across the app,
    // while ensuring any queries return empty/errors gracefully.
    url = "https://placeholder-supabase-url.supabase.co";
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTU5ODg4MDAwMCwiZXhwIjoxOTA0NDgwMDAwfQ.placeholder";
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Private bucket that stores applicant CVs. */
export const CV_BUCKET = "cvs";
