import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Roles that have full admin access
const ADMIN_ROLES = ['ADMIN', 'MANAGER']

// Roles that can access admin area
const ADMIN_AREA_ROLES = ['ADMIN', 'MANAGER', 'STAFF', 'CONTENT_EDITOR']

/**
 * Check if user has admin-level access (ADMIN or MANAGER)
 */
export function isAdminOrManager(role: string | undefined): boolean {
    return ADMIN_ROLES.includes(role || '')
}

/**
 * Check if user can access admin area
 */
export function canAccessAdminArea(role: string | undefined): boolean {
    return ADMIN_AREA_ROLES.includes(role || '')
}

/**
 * Check if user is specifically an ADMIN (not MANAGER)
 */
export function isAdminOnly(role: string | undefined): boolean {
    return role === 'ADMIN'
}

/**
 * Get current session and check if user has admin-level access
 * Returns session if authorized, null if not
 */
export async function getAdminSession() {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const role = session.user.role as string
    if (!isAdminOrManager(role)) return null

    return session
}

/**
 * Get current session and check if user can access admin area
 * Returns session if authorized, null if not
 */
export async function getStaffSession() {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const role = session.user.role as string
    if (!canAccessAdminArea(role)) return null

    return session
}

/**
 * Get current session and check if user is ADMIN only
 * Returns session if authorized, null if not
 */
export async function getAdminOnlySession() {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const role = session.user.role as string
    if (!isAdminOnly(role)) return null

    return session
}
