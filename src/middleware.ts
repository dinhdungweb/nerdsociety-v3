import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// All staff-like roles (not CUSTOMER, not ADMIN)
const STAFF_ROLES = ['STAFF', 'MANAGER', 'CONTENT_EDITOR']

// Routes that are ONLY for ADMIN (never for other roles regardless of permissions)
// Note: /admin/staff is now permission-based (canViewStaff), not admin-only
const ADMIN_ONLY_ROUTES = [
    '/admin/permissions',  // Chỉ Admin mới được phân quyền cho các role
]

// Routes for CONTENT_EDITOR - they can only access content-related pages
const CONTENT_EDITOR_ROUTES = [
    '/admin/posts',
    '/admin/gallery',
    '/admin/media',
    '/admin/content',
]

export default withAuth(
    function middleware(req) {
        const pathname = req.nextUrl.pathname
        const role = req.nextauth.token?.role as string

        if (pathname.startsWith('/admin')) {
            // Block customers from all admin routes
            if (role === 'CUSTOMER' || !role) {
                return NextResponse.redirect(new URL('/', req.url))
            }

            // Admin has full access
            if (role === 'ADMIN') {
                return
            }

            // Manager has almost full access except staff/permissions management
            if (role === 'MANAGER') {
                const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(route =>
                    pathname === route || pathname.startsWith(route + '/')
                )
                if (isAdminOnlyRoute) {
                    return NextResponse.redirect(new URL('/admin?error=access_denied', req.url))
                }
                return // Manager can access everything else
            }

            // Content Editor can only access content-related routes
            if (role === 'CONTENT_EDITOR') {
                // Exact match for /admin (dashboard) - redirect to posts
                if (pathname === '/admin') {
                    return NextResponse.redirect(new URL('/admin/posts', req.url))
                }

                const isAllowedRoute = CONTENT_EDITOR_ROUTES.some(route =>
                    pathname === route || pathname.startsWith(route + '/')
                )
                if (!isAllowedRoute) {
                    return NextResponse.redirect(new URL('/admin/posts?error=access_denied', req.url))
                }
                return
            }

            // Staff - check admin-only routes, other permissions handled by context
            if (role === 'STAFF') {
                const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(route =>
                    pathname === route || pathname.startsWith(route + '/')
                )
                if (isAdminOnlyRoute) {
                    return NextResponse.redirect(new URL('/admin?error=access_denied', req.url))
                }
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ['/admin/:path*', '/profile/:path*'],
}
