import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for Next.js - TEMPORARILY DISABLED
 * Protects routes that require authentication
 */
export function middleware(request: NextRequest) {
  // Middleware temporarily disabled - authentication handled in pages/APIs
  return NextResponse.next()
}

/**
 * Configure which routes to run middleware on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
