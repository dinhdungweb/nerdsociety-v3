import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Default permissions for each role - must match with admin/permissions/route.ts
const DEFAULT_ROLE_PERMISSIONS = {
    MANAGER: {
        // Dashboard
        canViewDashboard: true,
        canViewReports: true,
        // Bookings
        canViewBookings: true,
        canCreateBookings: true,
        canEditBookings: true,
        canDeleteBookings: true,
        canCheckIn: true,
        canCheckOut: true,
        // Chat
        canViewChat: true,
        // Rooms
        canViewRooms: true,
        canManageRooms: true,
        // Services
        canViewServices: true,
        canManageServices: true,
        // Locations
        canViewLocations: true,
        canManageLocations: true,
        // Posts (Tin tức)
        canViewPosts: true,
        canManagePosts: true,
        // Gallery/Media
        canViewGallery: true,
        canManageGallery: true,
        // Content Settings
        canViewContent: true,
        canManageContent: true,
        // Customers
        canViewCustomers: true,
        canManageCustomers: true,
        // Nerd Coin
        canViewNerdCoin: true,
        canManageNerdCoin: true,
        // System
        canViewSettings: false, // Manager không nên thay đổi settings hệ thống
        canViewStaff: true,     // Manager có thể quản lý Staff/Editor
        canManageStaff: true,
        canViewAuditLog: true,
        canViewEmailTemplates: true,
        canManageEmailTemplates: true,
    },
    STAFF: {
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
        // Services
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
        // Content Settings
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
    },
    CONTENT_EDITOR: {
        // Dashboard
        canViewDashboard: false,
        canViewReports: false,
        // Bookings
        canViewBookings: false,
        canCreateBookings: false,
        canEditBookings: false,
        canDeleteBookings: false,
        canCheckIn: false,
        canCheckOut: false,
        // Chat
        canViewChat: false,
        // Rooms
        canViewRooms: false,
        canManageRooms: false,
        // Services
        canViewServices: false,
        canManageServices: false,
        // Locations
        canViewLocations: false,
        canManageLocations: false,
        // Posts (Tin tức)
        canViewPosts: true,
        canManagePosts: true,
        // Gallery/Media
        canViewGallery: true,
        canManageGallery: true,
        // Content Settings
        canViewContent: true,
        canManageContent: true,
        // Customers
        canViewCustomers: false,
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
    },
}

const PERMISSION_KEY_PREFIX = 'role_permissions_'

// GET - Get staff permissions based on their role (accessible by MANAGER, STAFF, CONTENT_EDITOR)
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const role = session.user.role as string

        // Check if role exists in defaults
        if (!(role in DEFAULT_ROLE_PERMISSIONS)) {
            return NextResponse.json({ permissions: {} })
        }

        const setting = await prisma.setting.findUnique({
            where: { key: `${PERMISSION_KEY_PREFIX}${role}` },
        })

        const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS]
        const permissions = setting
            ? { ...defaultPerms, ...JSON.parse(setting.value) }
            : defaultPerms

        return NextResponse.json({ permissions, role })
    } catch (error) {
        console.error('Error fetching staff permissions:', error)
        return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
    }
}
