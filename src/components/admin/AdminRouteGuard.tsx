'use client'

import { usePermissions, StaffPermissions } from '@/contexts/PermissionsContext'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

// Map routes to required permissions
const ROUTE_PERMISSIONS: Record<string, keyof StaffPermissions> = {
    '/admin': 'canViewDashboard',
    '/admin/bookings': 'canViewBookings',
    '/admin/chat': 'canViewChat',
    '/admin/rooms': 'canViewRooms',
    '/admin/services': 'canViewServices',
    '/admin/combos': 'canViewServices',
    '/admin/locations': 'canViewLocations',
    '/admin/posts': 'canViewPosts',
    '/admin/gallery': 'canViewGallery',
    '/admin/media': 'canViewGallery',
    '/admin/content': 'canViewContent',
    '/admin/customers': 'canViewCustomers',
    '/admin/nerdcoin': 'canViewNerdCoin',
    '/admin/settings': 'canViewSettings',
    // New routes - permission-based, not admin-only
    '/admin/staff': 'canViewStaff',
    '/admin/audit-log': 'canViewAuditLog',
    '/admin/email-templates': 'canViewEmailTemplates',
}

// Routes that are ONLY for ADMIN (only permissions page now)
const ADMIN_ONLY_ROUTES = [
    '/admin/permissions',
]

interface AdminRouteGuardProps {
    children: ReactNode
}

/**
 * AdminRouteGuard - Central permission checking for all admin routes
 * Checks permissions from database and redirects if not allowed
 */
export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { hasPermission, isAdmin, loading, role } = usePermissions()

    useEffect(() => {
        if (loading) return

        // Check if route is admin-only
        const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(route =>
            pathname === route || pathname.startsWith(route + '/')
        )

        if (isAdminOnlyRoute && !isAdmin) {
            router.replace('/admin?error=access_denied')
            return
        }

        // Admin has full access to everything
        if (isAdmin) return

        // Find matching route permission
        const matchingRoute = Object.keys(ROUTE_PERMISSIONS)
            .sort((a, b) => b.length - a.length) // Sort by length desc for more specific matches first
            .find(route => pathname === route || pathname.startsWith(route + '/'))

        if (matchingRoute) {
            const requiredPermission = ROUTE_PERMISSIONS[matchingRoute]
            if (!hasPermission(requiredPermission)) {
                // Find a route they CAN access
                const allowedRoute = Object.entries(ROUTE_PERMISSIONS)
                    .find(([, perm]) => hasPermission(perm))

                const redirectTo = allowedRoute ? allowedRoute[0] : '/admin'
                router.replace(`${redirectTo}?error=access_denied`)
                return
            }
        }
    }, [loading, pathname, isAdmin, hasPermission, router, role])

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="text-sm text-neutral-500">Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        )
    }

    // Check admin-only routes
    const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )

    if (isAdminOnlyRoute && !isAdmin) {
        return null
    }

    // Admin has full access
    if (isAdmin) {
        return <>{children}</>
    }

    // Check permission-based routes
    const matchingRoute = Object.keys(ROUTE_PERMISSIONS)
        .sort((a, b) => b.length - a.length)
        .find(route => pathname === route || pathname.startsWith(route + '/'))

    if (matchingRoute) {
        const requiredPermission = ROUTE_PERMISSIONS[matchingRoute]
        if (!hasPermission(requiredPermission)) {
            return null
        }
    }

    return <>{children}</>
}
