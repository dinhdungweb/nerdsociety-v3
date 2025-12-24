'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

export interface StaffPermissions {
    // Dashboard
    canViewDashboard: boolean
    canViewReports: boolean

    // Bookings
    canViewBookings: boolean
    canCreateBookings: boolean
    canEditBookings: boolean
    canDeleteBookings: boolean
    canCheckIn: boolean
    canCheckOut: boolean

    // Chat
    canViewChat: boolean

    // Rooms
    canViewRooms: boolean
    canManageRooms: boolean

    // Services & Combos
    canViewServices: boolean
    canManageServices: boolean

    // Locations
    canViewLocations: boolean
    canManageLocations: boolean

    // Posts (Tin tức)
    canViewPosts: boolean
    canManagePosts: boolean

    // Gallery/Media
    canViewGallery: boolean
    canManageGallery: boolean

    // Content Settings
    canViewContent: boolean
    canManageContent: boolean

    // Customers
    canViewCustomers: boolean
    canManageCustomers: boolean

    // Nerd Coin
    canViewNerdCoin: boolean
    canManageNerdCoin: boolean

    // System
    canViewSettings: boolean
    canViewStaff: boolean
    canManageStaff: boolean
    canViewAuditLog: boolean
    canViewEmailTemplates: boolean
    canManageEmailTemplates: boolean
}

const DEFAULT_PERMISSIONS: StaffPermissions = {
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
}

// Full permissions for ADMIN
const ADMIN_PERMISSIONS: StaffPermissions = {
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
    canViewSettings: true,
    canViewStaff: true,
    canManageStaff: true,
    canViewAuditLog: true,
    canViewEmailTemplates: true,
    canManageEmailTemplates: true,
}

// Limited permissions for CONTENT_EDITOR - only content management
const CONTENT_EDITOR_PERMISSIONS: StaffPermissions = {
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
    canViewPosts: true,  // Content access
    canManagePosts: true,
    canViewGallery: true,  // Gallery access
    canManageGallery: true,
    canViewContent: true,  // Content settings access
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
}

interface PermissionsContextType {
    permissions: StaffPermissions
    loading: boolean
    isAdmin: boolean
    role: string | null
    hasPermission: (key: keyof StaffPermissions) => boolean
}

const PermissionsContext = createContext<PermissionsContextType>({
    permissions: DEFAULT_PERMISSIONS,
    loading: true,
    isAdmin: false,
    role: null,
    hasPermission: () => false,
})

export function PermissionsProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession()
    const [permissions, setPermissions] = useState<StaffPermissions>(DEFAULT_PERMISSIONS)
    const [loading, setLoading] = useState(true)

    const role = (session?.user?.role as string) || null
    const isAdmin = role === 'ADMIN'

    useEffect(() => {
        if (status === 'loading') return

        // Admin has all permissions
        if (isAdmin) {
            setPermissions(ADMIN_PERMISSIONS)
            setLoading(false)
            return
        }

        // For MANAGER, STAFF, and CONTENT_EDITOR - fetch from API (database permissions)
        if (role && ['MANAGER', 'STAFF', 'CONTENT_EDITOR'].includes(role)) {
            const fetchPermissions = async () => {
                try {
                    const res = await fetch('/api/staff/permissions')
                    if (res.ok) {
                        const data = await res.json()
                        // Use the permissions from API directly (already merged with defaults on server)
                        setPermissions(data.permissions)
                    } else {
                        // If API fails, use role-specific defaults
                        if (role === 'CONTENT_EDITOR') {
                            setPermissions(CONTENT_EDITOR_PERMISSIONS)
                        } else {
                            setPermissions(DEFAULT_PERMISSIONS)
                        }
                    }
                } catch (error) {
                    console.error('Error fetching permissions:', error)
                    // Fallback to role-specific defaults
                    if (role === 'CONTENT_EDITOR') {
                        setPermissions(CONTENT_EDITOR_PERMISSIONS)
                    } else {
                        setPermissions(DEFAULT_PERMISSIONS)
                    }
                }
                setLoading(false)
            }
            fetchPermissions()
            return
        }

        setLoading(false)
    }, [isAdmin, role, status])

    const hasPermission = (key: keyof StaffPermissions): boolean => {
        if (isAdmin) return true
        return permissions[key] ?? false
    }

    return (
        <PermissionsContext.Provider value={{ permissions, loading, isAdmin, role, hasPermission }}>
            {children}
        </PermissionsContext.Provider>
    )
}

export const usePermissions = () => useContext(PermissionsContext)
