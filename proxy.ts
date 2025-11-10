import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for route protection
 * 
 * Performs optimistic authentication checks and redirects.
 * Note: This is not the sole security - server components should also verify auth.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see https://nextjs.org/docs/app/building-your-application/authentication
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = [
        '/signin',
        '/signup',
        '/confirm-email',
        '/reset-password',
        '/auth/callback',
    ]

    // Protected routes that require authentication
    const protectedRoutes = [
        '/dashboard',
        // Add more protected routes here
    ]

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Check authentication by verifying user data exists
    // Using auth_user instead of auth_access_token because:
    // - auth_user contains actual user data (more reliable check)
    // - auth_access_token is just a token string (can't validate it in middleware)
    const userCookie = request.cookies.get('auth_user')?.value
    const isAuthenticated = !!userCookie

    // Redirect unauthenticated users trying to access protected routes
    if (isProtectedRoute && !isAuthenticated) {
        const signinUrl = new URL('/signin', request.url)
        signinUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(signinUrl)
    }

    // Redirect authenticated users away from auth pages
    if (isPublicRoute && isAuthenticated && (pathname === '/signin' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

/**
 * Middleware configuration
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}