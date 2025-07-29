import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple middleware that just continues
  console.log('Middleware called for:', request.url)
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
} 