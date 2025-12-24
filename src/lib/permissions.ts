import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER'

interface Permission {
    canView: boolean
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    locationFilter?: string // If set, only show data for this location
}

interface UserPermissions {
    role: Role
    assignedLocationId: string | null
    booking: Permission
    room: Permission
    location: Permission
    customer: Permission
    nerdCoin: Permission
    staff: Permission
    settings: Permission
}

/**
 * Get permissions for current user
 */
export async function getUserPermissions(): Promise<UserPermissions | null> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return null

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            role: true,
            assignedLocationId: true,
        },
    })

    if (!user) return null

    const role = user.role as Role
    const assignedLocationId = user.assignedLocationId

    // Admin has full access
    if (role === 'ADMIN') {
        return {
            role,
            assignedLocationId: null,
            booking: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            room: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            location: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            customer: { canView: true, canCreate: false, canEdit: true, canDelete: false },
            nerdCoin: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            staff: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            settings: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        }
    }

    // Staff has limited access
    if (role === 'STAFF') {
        return {
            role,
            assignedLocationId,
            booking: {
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: false, // Staff cannot delete bookings
                locationFilter: assignedLocationId || undefined,
            },
            room: {
                canView: true,
                canCreate: false,
                canEdit: false,
                canDelete: false,
                locationFilter: assignedLocationId || undefined,
            },
            location: {
                canView: true,
                canCreate: false,
                canEdit: false,
                canDelete: false,
            },
            customer: {
                canView: true,
                canCreate: false,
                canEdit: false,
                canDelete: false,
            },
            nerdCoin: {
                canView: true,
                canCreate: false, // Staff cannot adjust coins
                canEdit: false,
                canDelete: false,
            },
            staff: {
                canView: false, // Staff cannot see other staff
                canCreate: false,
                canEdit: false,
                canDelete: false,
            },
            settings: {
                canView: false,
                canCreate: false,
                canEdit: false,
                canDelete: false,
            },
        }
    }

    // Customer has no admin access
    return null
}

/**
 * Check if user can perform action
 */
export function checkPermission(permissions: UserPermissions | null, resource: keyof Omit<UserPermissions, 'role' | 'assignedLocationId'>, action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'): boolean {
    if (!permissions) return false
    return permissions[resource]?.[action] ?? false
}

/**
 * Get location filter for staff
 */
export function getLocationFilter(permissions: UserPermissions | null, resource: keyof Omit<UserPermissions, 'role' | 'assignedLocationId'>): string | undefined {
    if (!permissions) return undefined
    return (permissions[resource] as Permission)?.locationFilter
}
