import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { audit } from '@/lib/audit'

// Default permissions for each role
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

// GET - Get permissions for all roles or specific role
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const role = searchParams.get('role')

        // If specific role requested
        if (role && role in DEFAULT_ROLE_PERMISSIONS) {
            const setting = await prisma.setting.findUnique({
                where: { key: `${PERMISSION_KEY_PREFIX}${role}` },
            })

            const permissions = setting
                ? { ...DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS], ...JSON.parse(setting.value) }
                : DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS]

            return NextResponse.json({
                role,
                permissions,
                defaults: DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS]
            })
        }

        // Get all role permissions
        const allPermissions: Record<string, any> = {}

        for (const roleKey of Object.keys(DEFAULT_ROLE_PERMISSIONS)) {
            const setting = await prisma.setting.findUnique({
                where: { key: `${PERMISSION_KEY_PREFIX}${roleKey}` },
            })

            allPermissions[roleKey] = setting
                ? { ...DEFAULT_ROLE_PERMISSIONS[roleKey as keyof typeof DEFAULT_ROLE_PERMISSIONS], ...JSON.parse(setting.value) }
                : DEFAULT_ROLE_PERMISSIONS[roleKey as keyof typeof DEFAULT_ROLE_PERMISSIONS]
        }

        return NextResponse.json({
            permissions: allPermissions,
            defaults: DEFAULT_ROLE_PERMISSIONS
        })
    } catch (error) {
        console.error('Error fetching permissions:', error)
        return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
    }
}

// POST - Update permissions for a role
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { role, permissions } = await req.json()

        if (!role || !(role in DEFAULT_ROLE_PERMISSIONS)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        await prisma.setting.upsert({
            where: { key: `${PERMISSION_KEY_PREFIX}${role}` },
            update: { value: JSON.stringify(permissions) },
            create: { key: `${PERMISSION_KEY_PREFIX}${role}`, value: JSON.stringify(permissions) },
        })

        // Audit log for permission changes
        await audit.update(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Admin',
            'permissions',
            role,
            { role, permissions }
        )

        return NextResponse.json({ success: true, role, permissions })
    } catch (error) {
        console.error('Error updating permissions:', error)
        return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 })
    }
}
