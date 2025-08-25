import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || request.nextUrl.hostname;
  
  console.log('Middleware - Host:', hostname, 'Path:', pathname);
  
  // Handle subdomain routing
  if (hostname.includes('academy.')) {
    console.log('Academy subdomain detected');
    // Rewrite academy subdomain to academy page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/academy', request.url));
    }
    // Handle other academy routes
    if (!pathname.startsWith('/academy')) {
      return NextResponse.rewrite(new URL(`/academy${pathname}`, request.url));
    }
  }
  
  if (hostname.includes('studio.')) {
    console.log('Studio subdomain detected');
    // Rewrite studio subdomain to studio page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/studio', request.url));
    }
    // Handle other studio routes
    if (!pathname.startsWith('/studio')) {
      return NextResponse.rewrite(new URL(`/studio${pathname}`, request.url));
    }
  }
  
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