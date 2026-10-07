import { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  // studio./academy. subdomains are redirected to /studio and /academy by
  // vercel.json. Don't redirect back to the subdomains here — that loops.

  // Main site: refresh the Supabase auth session so the admin dashboard stays
  // logged in. Only does real work for /careers/admin (others have no session).
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 