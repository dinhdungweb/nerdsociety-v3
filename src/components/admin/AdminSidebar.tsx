'use client'

import {
    CalendarDaysIcon,
    Cog6ToothIcon,
    CubeIcon,
    Squares2X2Icon,
    FolderIcon,
    HomeIcon,
    NewspaperIcon,
    PencilSquareIcon,
    PhotoIcon,
    UsersIcon,
    UserGroupIcon,
    XMarkIcon,
    BuildingStorefrontIcon,
    SparklesIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    ClipboardDocumentListIcon,
    ChatBubbleLeftRightIcon,
    RectangleStackIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { usePermissions, StaffPermissions } from '@/contexts/PermissionsContext'

// Navigation items with permission keys
interface NavItem {
    name: string
    href: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    permissionKey?: keyof StaffPermissions
    adminOnly?: boolean
}

interface NavGroup {
    name: string
    items: NavItem[]
    adminOnly?: boolean
}

const navigationGroups: NavGroup[] = [
    {
        name: 'Tổng quan',
        items: [
            { name: 'Dashboard', href: '/admin', icon: HomeIcon, permissionKey: 'canViewDashboard' },
        ]
    },
    {
        name: 'Quản lý đặt lịch',
        items: [
            { name: 'Bookings', href: '/admin/bookings', icon: CalendarDaysIcon, permissionKey: 'canViewBookings' },
            { name: 'Chat hỗ trợ', href: '/admin/chat', icon: ChatBubbleLeftRightIcon, permissionKey: 'canViewChat' },
            { name: 'Phòng', href: '/admin/rooms', icon: CubeIcon, permissionKey: 'canViewRooms' },
            { name: 'Dịch vụ', href: '/admin/services', icon: Squares2X2Icon, permissionKey: 'canViewServices' },
            { name: 'Combos', href: '/admin/combos', icon: RectangleStackIcon, permissionKey: 'canViewServices' },
            { name: 'Cơ sở', href: '/admin/locations', icon: BuildingStorefrontIcon, permissionKey: 'canViewLocations' },
        ]
    },
    {
        name: 'Nội dung',
        items: [
            { name: 'Tin tức', href: '/admin/posts', icon: NewspaperIcon, permissionKey: 'canViewPosts' },
            { name: 'Gallery', href: '/admin/gallery', icon: PhotoIcon, permissionKey: 'canViewGallery' },
            { name: 'Media', href: '/admin/media', icon: FolderIcon, permissionKey: 'canViewGallery' },
            { name: 'Content', href: '/admin/content', icon: PencilSquareIcon, permissionKey: 'canViewContent' },
        ]
    },
    {
        name: 'Hệ thống',
        items: [
            { name: 'Khách hàng', href: '/admin/customers', icon: UsersIcon, permissionKey: 'canViewCustomers' },
            { name: 'Nerd Coin', href: '/admin/nerdcoin', icon: SparklesIcon, permissionKey: 'canViewNerdCoin' },
            { name: 'Email Templates', href: '/admin/email-templates', icon: EnvelopeIcon, permissionKey: 'canViewEmailTemplates' },
            { name: 'Lịch sử', href: '/admin/audit-log', icon: ClipboardDocumentListIcon, permissionKey: 'canViewAuditLog' },
            { name: 'Nhân viên', href: '/admin/staff', icon: UserGroupIcon, permissionKey: 'canViewStaff' },
            { name: 'Phân quyền', href: '/admin/permissions', icon: ShieldCheckIcon, adminOnly: true },
            { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon, permissionKey: 'canViewSettings' },
        ]
    },
]

// Coffee cup icon for logo
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h15a3 3 0 013 3v1a3 3 0 01-3 3h-1.5M3 8v8a4 4 0 004 4h5a4 4 0 004-4v-3M3 8l1-4h13l1 4M7.5 8v1.5m4-1.5v1.5" />
    </svg>
)

interface AdminSidebarProps {
    isOpen: boolean
    onClose: () => void
    isCollapsed: boolean
    onCollapse: (value: boolean) => void
}

export default function AdminSidebar({ isOpen, onClose, isCollapsed, onCollapse }: AdminSidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { hasPermission, isAdmin, loading } = usePermissions()

    const sidebarWidth = isCollapsed ? 'w-64 lg:w-[72px]' : 'w-64'

    // Filter navigation based on permissions
    const filteredNavGroups = navigationGroups
        .map(group => ({
            ...group,
            items: group.items.filter(item => {
                // Admin-only items
                if (item.adminOnly) return isAdmin
                // Permission-based items
                if (item.permissionKey) return hasPermission(item.permissionKey)
                return true
            })
        }))
        .filter(group => group.items.length > 0)

    return (
        <>
            {/* Mobile sidebar overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex ${sidebarWidth} flex-col bg-white border-r border-neutral-200 transition-all duration-300 lg:translate-x-0 dark:bg-neutral-900 dark:border-neutral-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25">
                            <CoffeeIcon className="size-5" />
                        </div>
                        <div className={`flex flex-col ${isCollapsed ? 'lg:hidden' : ''}`}>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">Nerd Society</span>
                            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                {isAdmin ? 'Admin Panel' : 'Staff Panel'}
                            </span>
                        </div>
                    </Link>
                    <button
                        type="button"
                        className="rounded-lg p-1.5 hover:bg-neutral-100 lg:hidden dark:text-neutral-300 dark:hover:bg-neutral-800"
                        onClick={onClose}
                    >
                        <XMarkIcon className="size-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-10 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredNavGroups.map((group) => (
                                <div key={group.name}>
                                    {/* Section header */}
                                    <h3 className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 ${isCollapsed ? 'lg:hidden' : ''}`}>
                                        {group.name}
                                    </h3>
                                    <ul className="space-y-1">
                                        {group.items.map((item) => {
                                            const isActive = pathname === item.href ||
                                                (item.href !== '/admin' && pathname.startsWith(item.href))
                                            return (
                                                <li key={item.name}>
                                                    <Link
                                                        href={item.href}
                                                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                                            ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900/30 dark:text-primary-400'
                                                            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                                            } ${isCollapsed ? 'justify-center' : ''}`}
                                                        onClick={onClose}
                                                        title={isCollapsed ? item.name : undefined}
                                                    >
                                                        <item.icon className={`size-5 flex-shrink-0 ${isActive ? '' : 'text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'}`} />
                                                        <span className={isCollapsed ? 'lg:hidden' : ''}>{item.name}</span>
                                                        {isActive && (
                                                            <div className={`ml-auto size-1.5 rounded-full bg-primary-500 ${isCollapsed ? 'lg:hidden' : ''}`} />
                                                        )}
                                                    </Link>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </nav>
            </aside>
        </>
    )
}
