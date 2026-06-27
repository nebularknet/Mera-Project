import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Route Handlers, and Server
 * Actions. Uses the ANON key and reads the user's auth session from cookies,
 * so RLS applies as the logged-in user (used for the admin dashboard auth flow).
 *
 * Do NOT use this for reading applicant data — that goes through the admin
 * (service_role) client. This one is for auth/session only.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Safe to ignore when middleware refreshes the session.
          }
        },
      },
    }
  );
}
