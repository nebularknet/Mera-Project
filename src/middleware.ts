import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || request.nextUrl.hostname;

  // Handle subdomain routing with redirects (these short-circuit before any
  // Supabase session work, which only matters for the main site / admin).
  if (hostname && (hostname.startsWith('academy.') || hostname.includes('academy.'))) {
    return NextResponse.redirect(new URL(`/academy${pathname}`, request.url));
  }

  if (hostname && (hostname.startsWith('studio.') || hostname.includes('studio.'))) {
    return NextResponse.redirect(new URL(`/studio${pathname}`, request.url));
  }

  // Handle redirects from main domain to subdomains
  if (hostname === 'nebulark.net' || hostname === 'www.nebulark.net') {
    if (pathname === '/studio') {
      return NextResponse.redirect(new URL('https://studio.nebulark.net', request.url));
    }
    if (pathname === '/academy') {
      return NextResponse.redirect(new URL('https://academy.nebulark.net', request.url));
    }
  }

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