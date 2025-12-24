import { prisma } from '@/lib/prisma'

// Default Staff permissions
export const DEFAULT_STAFF_PERMISSIONS = {
    // Dashboard
    canViewDashboard: true,
    canViewReports: false,

    // Bookings
    canViewBookings: true,
    canCreateBookings: true,
    canEditBookings: true,
    canDeleteBookings: false,
    canCheckIn: true,
    canCheckOut: true,

    // Chat
    canViewChat: true,

    // Rooms
    canViewRooms: false,
    canManageRooms: false,

    // Services & Combos
    canViewServices: false,
    canManageServices: false,

    // Locations
    canViewLocations: false,
    canManageLocations: false,

    // Posts (Tin tức)
    canViewPosts: false,
    canManagePosts: false,

    // Gallery/Media
    canViewGallery: false,
    canManageGallery: false,

    // Content Settings (Nội dung website)
    canViewContent: false,
    canManageContent: false,

    // Customers
    canViewCustomers: true,
    canManageCustomers: false,

    // Nerd Coin
    canViewNerdCoin: false,
    canManageNerdCoin: false,

    // System
    canViewSettings: false,
    canViewStaff: false,
    canManageStaff: false,
    canViewAuditLog: false,
    canViewEmailTemplates: false,
    canManageEmailTemplates: false,
}

export type StaffPermissions = typeof DEFAULT_STAFF_PERMISSIONS

const PERMISSION_KEY = 'staff_permissions'

// Get staff permissions from database (server-side)
export async function getStaffPermissions(): Promise<StaffPermissions> {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key: PERMISSION_KEY },
        })

        if (setting) {
            return { ...DEFAULT_STAFF_PERMISSIONS, ...JSON.parse(setting.value) }
        }
        return DEFAULT_STAFF_PERMISSIONS
    } catch (error) {
        console.error('Error fetching staff permissions:', error)
        return DEFAULT_STAFF_PERMISSIONS
    }
}

// Map permissions to routes
export const PERMISSION_ROUTE_MAP: Record<string, keyof StaffPermissions> = {
    '/admin': 'canViewDashboard',
    '/admin/bookings': 'canViewBookings',
    '/admin/chat': 'canViewChat',
    '/admin/customers': 'canViewCustomers',
    '/admin/rooms': 'canViewRooms',
    '/admin/services': 'canViewServices',
    '/admin/combos': 'canViewServices',
    '/admin/locations': 'canViewLocations',
    '/admin/posts': 'canViewPosts',
    '/admin/gallery': 'canViewGallery',
    '/admin/media': 'canViewGallery',
    '/admin/content': 'canViewContent',
    '/admin/nerdcoin': 'canViewNerdCoin',
    '/admin/reports': 'canViewReports',
    '/admin/settings': 'canViewSettings',
    '/admin/staff': 'canViewStaff',
    '/admin/audit-log': 'canViewAuditLog',
    '/admin/email-templates': 'canViewEmailTemplates',
}

// Check if a route is allowed for staff based on permissions
export function isRouteAllowedForStaff(pathname: string, permissions: StaffPermissions): boolean {
    // Find matching route
    const matchingRoute = Object.keys(PERMISSION_ROUTE_MAP).find(route =>
        pathname === route || pathname.startsWith(route + '/')
    )

    if (!matchingRoute) {
        return false // Unknown routes are blocked for staff
    }

    const permissionKey = PERMISSION_ROUTE_MAP[matchingRoute]
    return permissions[permissionKey] ?? false
}

// Get allowed routes for staff based on permissions (for sidebar)
export function getAllowedRoutesForStaff(permissions: StaffPermissions): string[] {
    return Object.entries(PERMISSION_ROUTE_MAP)
        .filter(([_, permKey]) => permissions[permKey])
        .map(([route]) => route)
}
