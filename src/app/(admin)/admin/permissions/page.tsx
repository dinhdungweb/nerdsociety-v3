'use client'

import { useState, useEffect } from 'react'
import { ShieldCheckIcon, UserGroupIcon, BriefcaseIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Permissions {
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

    // Content Settings (Nội dung trang chủ)
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

type RoleKey = 'MANAGER' | 'STAFF' | 'CONTENT_EDITOR'

const roleConfig: Record<RoleKey, { name: string; icon: typeof UserGroupIcon; color: string; description: string }> = {
    MANAGER: {
        name: 'Manager',
        icon: BriefcaseIcon,
        color: 'amber',
        description: 'Quản lý cơ sở - có quyền cao, quản lý nhân sự và vận hành'
    },
    STAFF: {
        name: 'Staff',
        icon: UserGroupIcon,
        color: 'blue',
        description: 'Nhân viên - quyền cơ bản, tùy chỉnh theo nhu cầu'
    },
    CONTENT_EDITOR: {
        name: 'Content Editor',
        icon: PencilSquareIcon,
        color: 'green',
        description: 'Biên tập viên - chỉ quản lý nội dung (tin tức, media)'
    },
}

const permissionLabels: Record<keyof Permissions, { label: string; description: string; group: string }> = {
    // Dashboard
    canViewDashboard: { label: 'Xem Dashboard', description: 'Xem tổng quan và biểu đồ', group: 'Tổng quan' },
    canViewReports: { label: 'Xem Reports', description: 'Xem báo cáo doanh thu', group: 'Tổng quan' },

    // Bookings
    canViewBookings: { label: 'Xem Bookings', description: 'Xem danh sách đặt lịch', group: 'Đặt lịch' },
    canCreateBookings: { label: 'Tạo Booking', description: 'Tạo booking mới', group: 'Đặt lịch' },
    canEditBookings: { label: 'Sửa Booking', description: 'Chỉnh sửa thông tin booking', group: 'Đặt lịch' },
    canDeleteBookings: { label: 'Xóa Booking', description: 'Xóa booking (nguy hiểm)', group: 'Đặt lịch' },
    canCheckIn: { label: 'Check-in', description: 'Thực hiện check-in khách', group: 'Đặt lịch' },
    canCheckOut: { label: 'Check-out', description: 'Thực hiện check-out khách', group: 'Đặt lịch' },

    // Chat
    canViewChat: { label: 'Xem Chat', description: 'Xem và trả lời tin nhắn hỗ trợ', group: 'Hỗ trợ' },

    // Rooms
    canViewRooms: { label: 'Xem Phòng', description: 'Xem danh sách phòng', group: 'Phòng & Dịch vụ' },
    canManageRooms: { label: 'Quản lý Phòng', description: 'Thêm, sửa, xóa phòng', group: 'Phòng & Dịch vụ' },

    // Services
    canViewServices: { label: 'Xem Dịch vụ', description: 'Xem dịch vụ và combo', group: 'Phòng & Dịch vụ' },
    canManageServices: { label: 'Quản lý Dịch vụ', description: 'Thêm, sửa, xóa dịch vụ/combo', group: 'Phòng & Dịch vụ' },

    // Locations
    canViewLocations: { label: 'Xem Cơ sở', description: 'Xem danh sách cơ sở', group: 'Phòng & Dịch vụ' },
    canManageLocations: { label: 'Quản lý Cơ sở', description: 'Thêm, sửa, xóa cơ sở', group: 'Phòng & Dịch vụ' },

    // Posts (Tin tức)
    canViewPosts: { label: 'Xem Tin tức', description: 'Xem danh sách bài viết', group: 'Tin tức' },
    canManagePosts: { label: 'Quản lý Tin tức', description: 'Thêm, sửa, xóa bài viết', group: 'Tin tức' },

    // Gallery/Media
    canViewGallery: { label: 'Xem Gallery/Media', description: 'Xem thư viện ảnh và media', group: 'Gallery & Media' },
    canManageGallery: { label: 'Quản lý Gallery/Media', description: 'Upload, xóa ảnh/media', group: 'Gallery & Media' },

    // Content Settings
    canViewContent: { label: 'Xem Nội dung trang chủ', description: 'Xem cài đặt nội dung', group: 'Nội dung Website' },
    canManageContent: { label: 'Quản lý Nội dung', description: 'Sửa hero banner, giới thiệu, combos...', group: 'Nội dung Website' },

    // Customers
    canViewCustomers: { label: 'Xem Khách hàng', description: 'Xem danh sách khách hàng', group: 'Khách hàng' },
    canManageCustomers: { label: 'Quản lý Khách hàng', description: 'Sửa, xóa thông tin khách', group: 'Khách hàng' },

    // Nerd Coin
    canViewNerdCoin: { label: 'Xem Nerd Coin', description: 'Xem số dư Nerd Coin', group: 'Hệ thống' },
    canManageNerdCoin: { label: 'Quản lý Nerd Coin', description: 'Điều chỉnh Nerd Coin khách', group: 'Hệ thống' },

    // System
    canViewSettings: { label: 'Xem Settings', description: 'Xem cài đặt hệ thống', group: 'Hệ thống' },
    canViewStaff: { label: 'Xem Nhân viên', description: 'Xem danh sách nhân viên', group: 'Hệ thống' },
    canManageStaff: { label: 'Quản lý Nhân viên', description: 'Thêm, sửa, xóa Staff/Editor', group: 'Hệ thống' },
    canViewAuditLog: { label: 'Xem Lịch sử', description: 'Xem lịch sử thao tác', group: 'Hệ thống' },
    canViewEmailTemplates: { label: 'Xem Email Templates', description: 'Xem mẫu email', group: 'Hệ thống' },
    canManageEmailTemplates: { label: 'Quản lý Email Templates', description: 'Sửa mẫu email', group: 'Hệ thống' },
}

export default function PermissionsPage() {
    const [allPermissions, setAllPermissions] = useState<Record<RoleKey, Permissions> | null>(null)
    const [activeRole, setActiveRole] = useState<RoleKey>('STAFF')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchPermissions()
    }, [])

    const fetchPermissions = async () => {
        try {
            const res = await fetch('/api/admin/permissions')
            if (res.ok) {
                const data = await res.json()
                setAllPermissions(data.permissions)
            }
        } catch (error) {
            toast.error('Lỗi khi tải cài đặt phân quyền')
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = (key: keyof Permissions) => {
        if (!allPermissions) return
        setAllPermissions({
            ...allPermissions,
            [activeRole]: {
                ...allPermissions[activeRole],
                [key]: !allPermissions[activeRole][key]
            }
        })
    }

    const handleSave = async () => {
        if (!allPermissions) return
        setSaving(true)
        try {
            const res = await fetch('/api/admin/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: activeRole,
                    permissions: allPermissions[activeRole]
                }),
            })
            if (res.ok) {
                toast.success(`Đã lưu quyền cho ${roleConfig[activeRole].name}`)
            } else {
                toast.error('Lỗi khi lưu')
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra')
        } finally {
            setSaving(false)
        }
    }

    if (loading || !allPermissions) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                    ))}
                </div>
            </div>
        )
    }

    // Group permissions by category
    const groups = Object.entries(permissionLabels).reduce((acc, [key, { group }]) => {
        if (!acc[group]) acc[group] = []
        acc[group].push(key as keyof Permissions)
        return acc
    }, {} as Record<string, (keyof Permissions)[]>)

    const currentPermissions = allPermissions[activeRole]
    const RoleIcon = roleConfig[activeRole].icon

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Phân quyền theo vai trò</h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Cấu hình quyền truy cập cho từng vai trò trong hệ thống
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                >
                    <ShieldCheckIcon className="size-5" />
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-2 rounded-xl bg-neutral-100 p-1.5 dark:bg-neutral-800">
                {(Object.keys(roleConfig) as RoleKey[]).map(role => {
                    const config = roleConfig[role]
                    const Icon = config.icon
                    const isActive = activeRole === role
                    return (
                        <button
                            key={role}
                            onClick={() => setActiveRole(role)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                                }`}
                        >
                            <Icon className="size-5" />
                            <span className="hidden sm:inline">{config.name}</span>
                        </button>
                    )
                })}
            </div>

            {/* Role Info */}
            <div className={`flex items-center gap-4 rounded-xl bg-${roleConfig[activeRole].color}-50 p-4 dark:bg-${roleConfig[activeRole].color}-900/20`}>
                <div className={`flex size-12 items-center justify-center rounded-xl bg-${roleConfig[activeRole].color}-100 dark:bg-${roleConfig[activeRole].color}-900/30`}>
                    <RoleIcon className={`size-6 text-${roleConfig[activeRole].color}-600 dark:text-${roleConfig[activeRole].color}-400`} />
                </div>
                <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">{roleConfig[activeRole].name}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{roleConfig[activeRole].description}</p>
                </div>
            </div>

            {/* Permission Groups */}
            <div className="space-y-6">
                {Object.entries(groups).map(([groupName, keys]) => (
                    <div key={groupName} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{groupName}</h3>
                        </div>
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {keys.map(key => {
                                const { label, description } = permissionLabels[key]
                                const isEnabled = currentPermissions[key]
                                return (
                                    <div key={key} className="flex items-center justify-between px-6 py-4">
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-white">{label}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleToggle(key)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Info */}
            <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Lưu ý:</strong> Thay đổi sẽ áp dụng ngay khi người dùng refresh trang.
                    Admin luôn có full quyền và không bị ảnh hưởng bởi cài đặt này.
                </p>
            </div>
        </div>
    )
}
