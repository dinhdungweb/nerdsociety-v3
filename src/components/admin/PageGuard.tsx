'use client'

import { usePermissions, StaffPermissions } from '@/contexts/PermissionsContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface PageGuardProps {
    children: ReactNode
    requiredPermission?: keyof StaffPermissions
    adminOnly?: boolean
    redirectTo?: string
}

/**
 * PageGuard component - protects admin pages based on user permissions
 * Redirects to /admin/posts if user doesn't have required permission
 */
export default function PageGuard({
    children,
    requiredPermission,
    adminOnly = false,
    redirectTo = '/admin/posts'
}: PageGuardProps) {
    const router = useRouter()
    const { hasPermission, isAdmin, loading, role } = usePermissions()

    useEffect(() => {
        if (loading) return

        // If admin only page and user is not admin
        if (adminOnly && !isAdmin) {
            router.replace(redirectTo)
            return
        }

        // If specific permission required and user doesn't have it
        if (requiredPermission && !hasPermission(requiredPermission)) {
            router.replace(redirectTo)
            return
        }
    }, [loading, isAdmin, adminOnly, requiredPermission, hasPermission, router, redirectTo])

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    // Check permissions
    if (adminOnly && !isAdmin) {
        return null
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return null
    }

    return <>{children}</>
}
