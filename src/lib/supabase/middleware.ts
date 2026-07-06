import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * Refreshes the Supabase auth session on every matched request and keeps the
 * auth cookies in sync between the request and the response. Without this the
 * server-side session can silently expire and the admin dashboard would bounce
 * logged-in reviewers back to the login page.
 *
 * Returns the response (with refreshed cookies) so the caller can hand it back
 * from middleware. Subdomain routing in src/middleware.ts runs first and short-
 * circuits with its own redirect when it matches, so this only runs for the
 * main site (which includes /careers/admin).
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touch the user to trigger a token refresh if needed. Do not gate routes
  // here — the admin layout does the real isAdmin authorization check.
  await supabase.auth.getUser();

  return response;
}
