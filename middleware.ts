import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for Next.js
 * Protects routes that require authentication
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicPaths = [
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/health',
  ]
  
  // Check if current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Get token from cookie or authorization header
  const token = 
    request.cookies.get('access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')
  
  // No token found
  if (!token) {
    // If it's an API route, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Redirect to login for page routes
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Token exists - proceed to route
  // (Actual token verification happens in API routes)
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
