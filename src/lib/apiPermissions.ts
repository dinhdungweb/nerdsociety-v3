import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Permission key prefix in database
const PERMISSION_KEY_PREFIX = 'role_permissions_'

// Default permissions for each role (fallback if not in database)
const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
    MANAGER: {
        canViewDashboard: true,
        canViewReports: true,
        canViewBookings: true,
        canCreateBookings: true,
        canEditBookings: true,
        canDeleteBookings: true,
        canCheckIn: true,
        canCheckOut: true,
        canViewChat: true,
        canViewRooms: true,
        canManageRooms: true,
        canViewServices: true,
        canManageServices: true,
        canViewLocations: true,
        canManageLocations: true,
        canViewPosts: true,
        canManagePosts: true,
        canViewGallery: true,
        canManageGallery: true,
        canViewContent: true,
        canManageContent: true,
        canViewCustomers: true,
        canManageCustomers: true,
        canViewNerdCoin: true,
        canManageNerdCoin: true,
        canViewSettings: false,
        canViewStaff: true,
        canManageStaff: true,
        canViewAuditLog: true,
        canViewEmailTemplates: true,
        canManageEmailTemplates: true,
    },
    STAFF: {
        canViewDashboard: true,
        canViewReports: false,
        canViewBookings: true,
        canCreateBookings: true,
        canEditBookings: true,
        canDeleteBookings: false,
        canCheckIn: true,
        canCheckOut: true,
        canViewChat: true,
        canViewRooms: false,
        canManageRooms: false,
        canViewServices: false,
        canManageServices: false,
        canViewLocations: false,
        canManageLocations: false,
        canViewPosts: false,
        canManagePosts: false,
        canViewGallery: false,
        canManageGallery: false,
        canViewContent: false,
        canManageContent: false,
        canViewCustomers: true,
        canManageCustomers: false,
        canViewNerdCoin: false,
        canManageNerdCoin: false,
        canViewSettings: false,
        canViewStaff: false,
        canManageStaff: false,
        canViewAuditLog: false,
        canViewEmailTemplates: false,
        canManageEmailTemplates: false,
    },
    CONTENT_EDITOR: {
        canViewDashboard: false,
        canViewReports: false,
        canViewBookings: false,
        canCreateBookings: false,
        canEditBookings: false,
        canDeleteBookings: false,
        canCheckIn: false,
        canCheckOut: false,
        canViewChat: false,
        canViewRooms: false,
        canManageRooms: false,
        canViewServices: false,
        canManageServices: false,
        canViewLocations: false,
        canManageLocations: false,
        canViewPosts: true,
        canManagePosts: true,
        canViewGallery: true,
        canManageGallery: true,
        canViewContent: true,
        canManageContent: true,
        canViewCustomers: false,
        canManageCustomers: false,
        canViewNerdCoin: false,
        canManageNerdCoin: false,
        canViewSettings: false,
        canViewStaff: false,
        canManageStaff: false,
        canViewAuditLog: false,
        canViewEmailTemplates: false,
        canManageEmailTemplates: false,
    },
}

export type PermissionKey =
    | 'canViewDashboard' | 'canViewReports'
    | 'canViewBookings' | 'canCreateBookings' | 'canEditBookings' | 'canDeleteBookings' | 'canCheckIn' | 'canCheckOut'
    | 'canViewChat'
    | 'canViewRooms' | 'canManageRooms'
    | 'canViewServices' | 'canManageServices'
    | 'canViewLocations' | 'canManageLocations'
    | 'canViewPosts' | 'canManagePosts'
    | 'canViewGallery' | 'canManageGallery'
    | 'canViewContent' | 'canManageContent'
    | 'canViewCustomers' | 'canManageCustomers'
    | 'canViewNerdCoin' | 'canManageNerdCoin'
    | 'canViewSettings'
    | 'canViewStaff' | 'canManageStaff'
    | 'canViewAuditLog'
    | 'canViewEmailTemplates' | 'canManageEmailTemplates'

/**
 * Get permissions for a specific role from database
 * Falls back to defaults if not found
 */
export async function getRolePermissions(role: string): Promise<Record<string, boolean>> {
    // ADMIN always has all permissions
    if (role === 'ADMIN') {
        return Object.keys(DEFAULT_ROLE_PERMISSIONS.MANAGER || {}).reduce((acc, key) => {
            acc[key] = true
            return acc
        }, {} as Record<string, boolean>)
    }

    // Check if role has custom permissions in database
    if (!(role in DEFAULT_ROLE_PERMISSIONS)) {
        return {}
    }

    try {
        const setting = await prisma.setting.findUnique({
            where: { key: `${PERMISSION_KEY_PREFIX}${role}` },
        })

        const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role] || {}

        if (setting) {
            return { ...defaultPerms, ...JSON.parse(setting.value) }
        }

        return defaultPerms
    } catch (error) {
        console.error(`Error fetching permissions for role ${role}:`, error)
        return DEFAULT_ROLE_PERMISSIONS[role] || {}
    }
}

/**
 * Check if a user has a specific permission
 * Returns true if user has the permission, false otherwise
 */
export async function hasPermission(role: string, permission: PermissionKey): Promise<boolean> {
    // ADMIN always has all permissions
    if (role === 'ADMIN') return true

    const permissions = await getRolePermissions(role)
    return permissions[permission] === true
}

/**
 * Get session and check if user has required permission
 * Returns { session, hasAccess } object
 */
export async function checkApiPermission(requiredPermission: PermissionKey): Promise<{
    session: any | null
    hasAccess: boolean
    role: string | null
}> {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return { session: null, hasAccess: false, role: null }
    }

    const role = session.user.role as string

    // ADMIN always has access
    if (role === 'ADMIN') {
        return { session, hasAccess: true, role }
    }

    const hasAccess = await hasPermission(role, requiredPermission)
    return { session, hasAccess, role }
}

/**
 * Quick check for view permissions (commonly used pattern)
 */
export async function canView(resource: 'Dashboard' | 'Reports' | 'Bookings' | 'Chat' | 'Rooms' | 'Services' | 'Locations' | 'Posts' | 'Gallery' | 'Content' | 'Customers' | 'NerdCoin' | 'Settings' | 'Staff' | 'AuditLog' | 'EmailTemplates'): Promise<{
    session: any | null
    hasAccess: boolean
    role: string | null
}> {
    const permissionKey = `canView${resource}` as PermissionKey
    return checkApiPermission(permissionKey)
}

/**
 * Quick check for manage permissions (commonly used pattern)
 */
export async function canManage(resource: 'Rooms' | 'Services' | 'Locations' | 'Posts' | 'Gallery' | 'Content' | 'Customers' | 'NerdCoin' | 'Staff' | 'EmailTemplates'): Promise<{
    session: any | null
    hasAccess: boolean
    role: string | null
}> {
    const permissionKey = `canManage${resource}` as PermissionKey
    return checkApiPermission(permissionKey)
}

/**
 * Check booking-specific permissions
 */
export async function canBooking(action: 'View' | 'Create' | 'Edit' | 'Delete' | 'CheckIn' | 'CheckOut'): Promise<{
    session: any | null
    hasAccess: boolean
    role: string | null
}> {
    let permissionKey: PermissionKey
    switch (action) {
        case 'View': permissionKey = 'canViewBookings'; break
        case 'Create': permissionKey = 'canCreateBookings'; break
        case 'Edit': permissionKey = 'canEditBookings'; break
        case 'Delete': permissionKey = 'canDeleteBookings'; break
        case 'CheckIn': permissionKey = 'canCheckIn'; break
        case 'CheckOut': permissionKey = 'canCheckOut'; break
    }
    return checkApiPermission(permissionKey)
}
