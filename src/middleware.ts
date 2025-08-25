import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || request.nextUrl.hostname;
  
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Host:', hostname);
  console.log('Pathname:', pathname);
  console.log('Full URL:', request.url);
  console.log('Headers host:', request.headers.get('host'));
  console.log('NextUrl hostname:', request.nextUrl.hostname);
  
  // Test route for debugging
  if (pathname === '/test-subdomain') {
    console.log('🧪 Test subdomain route accessed');
    return NextResponse.next();
  }
  
  // Handle subdomain routing with more specific checks
  if (hostname && (hostname.startsWith('academy.') || hostname.includes('academy.'))) {
    console.log('✅ Academy subdomain detected - rewriting to /academy');
    const rewriteUrl = new URL(`/academy${pathname}`, request.url);
    console.log('Rewrite URL:', rewriteUrl.toString());
    return NextResponse.rewrite(rewriteUrl);
  }
  
  if (hostname && (hostname.startsWith('studio.') || hostname.includes('studio.'))) {
    console.log('✅ Studio subdomain detected - rewriting to /studio');
    const rewriteUrl = new URL(`/studio${pathname}`, request.url);
    console.log('Rewrite URL:', rewriteUrl.toString());
    return NextResponse.rewrite(rewriteUrl);
  }
  
  // Handle redirects from main domain to subdomains
  if (hostname === 'nebulark.net' || hostname === 'www.nebulark.net') {
    if (pathname === '/studio') {
      console.log('🔄 Redirecting /studio to studio.nebulark.net');
      return NextResponse.redirect(new URL('https://studio.nebulark.net', request.url));
    }
    if (pathname === '/academy') {
      console.log('🔄 Redirecting /academy to academy.nebulark.net');
      return NextResponse.redirect(new URL('https://academy.nebulark.net', request.url));
    }
  }
  
  console.log('➡️ No subdomain match - continuing to main site');
  return NextResponse.next();
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