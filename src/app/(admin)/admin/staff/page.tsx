'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon, MapPinIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import NcModal from '@/shared/NcModal'

type RoleType = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CONTENT_EDITOR'

interface Staff {
    id: string
    name: string
    email: string
    phone: string | null
    role: RoleType
    assignedLocationId: string | null
    assignedLocation: { id: string; name: string } | null
    createdAt: string
}

interface Location {
    id: string
    name: string
}

// Roles that Manager can manage
const MANAGER_ALLOWED_ROLES: RoleType[] = ['STAFF', 'CONTENT_EDITOR']

export default function StaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [currentUserRole, setCurrentUserRole] = useState<string>('ADMIN')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'STAFF' as RoleType,
        assignedLocationId: '',
    })

    const isAdmin = currentUserRole === 'ADMIN'

    // Check if current user can manage a specific staff member
    const canManageStaff = (staff: Staff): boolean => {
        if (isAdmin) return true
        return MANAGER_ALLOWED_ROLES.includes(staff.role)
    }

    // Get available roles for the dropdown based on current user role
    const getAvailableRoles = (): { value: RoleType; label: string }[] => {
        if (isAdmin) {
            return [
                { value: 'STAFF', label: 'Staff - Nhân viên' },
                { value: 'MANAGER', label: 'Manager - Quản lý' },
                { value: 'CONTENT_EDITOR', label: 'Content Editor - Biên tập viên' },
                { value: 'ADMIN', label: 'Admin - Quản trị' },
            ]
        }
        // Manager can only create STAFF and CONTENT_EDITOR
        return [
            { value: 'STAFF', label: 'Staff - Nhân viên' },
            { value: 'CONTENT_EDITOR', label: 'Content Editor - Biên tập viên' },
        ]
    }

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/admin/staff')
            if (res.ok) {
                const data = await res.json()
                setStaffList(data.staff)
                setLocations(data.locations)
                setCurrentUserRole(data.currentUserRole || 'ADMIN')
            }
        } catch (error) {
            toast.error('Lỗi khi tải danh sách nhân viên')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingStaff(null)
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'STAFF',
            assignedLocationId: '',
        })
        setShowModal(true)
    }

    const openEditModal = (staff: Staff) => {
        if (!canManageStaff(staff)) {
            toast.error('Bạn không có quyền chỉnh sửa tài khoản này')
            return
        }
        setEditingStaff(staff)
        setFormData({
            name: staff.name,
            email: staff.email,
            phone: staff.phone || '',
            password: '',
            role: staff.role,
            assignedLocationId: staff.assignedLocationId || '',
        })
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingStaff) {
                // Update
                const res = await fetch('/api/admin/staff', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingStaff.id,
                        name: formData.name,
                        phone: formData.phone,
                        role: formData.role,
                        assignedLocationId: formData.assignedLocationId || null,
                        password: formData.password || undefined,
                    }),
                })

                if (res.ok) {
                    toast.success('Cập nhật thành công')
                    fetchStaff()
                    setShowModal(false)
                } else {
                    const data = await res.json()
                    toast.error(data.error || 'Lỗi khi cập nhật')
                }
            } else {
                // Create
                const res = await fetch('/api/admin/staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                })

                if (res.ok) {
                    toast.success('Tạo nhân viên thành công')
                    fetchStaff()
                    setShowModal(false)
                } else {
                    const data = await res.json()
                    toast.error(data.error || 'Lỗi khi tạo nhân viên')
                }
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra')
        }
    }

    const handleDelete = async (staff: Staff) => {
        if (!canManageStaff(staff)) {
            toast.error('Bạn không có quyền xóa tài khoản này')
            return
        }
        if (!confirm(`Xóa nhân viên ${staff.name}?`)) return

        try {
            const res = await fetch(`/api/admin/staff?id=${staff.id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                toast.success('Đã xóa nhân viên')
                fetchStaff()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Lỗi khi xóa')
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra')
        }
    }

    const renderModalContent = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Họ tên *</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email *</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingStaff}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm disabled:opacity-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Số điện thoại</label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {editingStaff ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required={!editingStaff}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Vai trò</label>
                <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as RoleType })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                    {getAvailableRoles().map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phân công cơ sở</label>
                <select
                    value={formData.assignedLocationId}
                    onChange={e => setFormData({ ...formData, assignedLocationId: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                    <option value="">Tất cả cơ sở</option>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-neutral-500">
                    Staff chỉ xem được booking tại cơ sở được phân công
                </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                    {editingStaff ? 'Cập nhật' : 'Tạo nhân viên'}
                </button>
            </div>
        </form>
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý nhân viên</h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        {staffList.length} nhân viên
                        {!isAdmin && <span className="ml-2 text-amber-600 dark:text-amber-400">• Bạn đang đăng nhập với quyền Manager</span>}
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                >
                    <PlusIcon className="size-5" />
                    Thêm nhân viên
                </button>
            </div>

            {/* Staff List - Desktop */}
            <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:block">
                {/* Table Header */}
                <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400 md:grid md:grid-cols-12">
                    <div className="col-span-3">Nhân viên</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Vai trò</div>
                    <div className="col-span-2">Cơ sở</div>
                    <div className="col-span-2 text-right">Thao tác</div>
                </div>

                {/* Staff Items */}
                {staffList.length > 0 ? (
                    staffList.map(staff => {
                        const canManage = canManageStaff(staff)
                        return (
                            <div
                                key={staff.id}
                                className="grid items-center gap-4 border-b border-neutral-100 px-6 py-4 last:border-b-0 dark:border-neutral-800 md:grid-cols-12"
                            >
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                                        {staff.name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">{staff.name}</p>
                                        <p className="text-sm text-neutral-500">{staff.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="col-span-3 text-neutral-600 dark:text-neutral-400">
                                    {staff.email}
                                </div>
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${staff.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                        staff.role === 'MANAGER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            staff.role === 'CONTENT_EDITOR' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {staff.role === 'ADMIN' ? '👑 Admin' :
                                            staff.role === 'MANAGER' ? '🏢 Manager' :
                                                staff.role === 'CONTENT_EDITOR' ? '✍️ Editor' : '👤 Staff'}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    {staff.assignedLocation ? (
                                        <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                                            <MapPinIcon className="size-4" />
                                            {staff.assignedLocation.name}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-neutral-400">Tất cả cơ sở</span>
                                    )}
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                    {canManage ? (
                                        <>
                                            <button
                                                onClick={() => openEditModal(staff)}
                                                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(staff)}
                                                className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-neutral-400" title="Bạn không có quyền chỉnh sửa">
                                            <LockClosedIcon className="size-4" />
                                            Chỉ xem
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="px-6 py-12 text-center">
                        <UserCircleIcon className="mx-auto size-12 text-neutral-300" />
                        <p className="mt-2 text-neutral-500">Chưa có nhân viên nào</p>
                    </div>
                )}
            </div>

            {/* Staff List - Mobile Cards */}
            <div className="space-y-3 md:hidden">
                {staffList.length > 0 ? (
                    staffList.map(staff => {
                        const canManage = canManageStaff(staff)
                        return (
                            <div
                                key={staff.id}
                                className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                                            {staff.name[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-white">{staff.name}</p>
                                            <p className="text-xs text-neutral-500">{staff.email}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${staff.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                        staff.role === 'MANAGER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            staff.role === 'CONTENT_EDITOR' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {staff.role === 'ADMIN' ? '👑 Admin' :
                                            staff.role === 'MANAGER' ? '🏢 Manager' :
                                                staff.role === 'CONTENT_EDITOR' ? '✍️ Editor' : '👤 Staff'}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                                    <div className="flex items-center gap-4 text-sm">
                                        {staff.assignedLocation ? (
                                            <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                                                <MapPinIcon className="size-4" />
                                                {staff.assignedLocation.name}
                                            </span>
                                        ) : (
                                            <span className="text-neutral-400">Tất cả cơ sở</span>
                                        )}
                                        {staff.phone && (
                                            <span className="text-neutral-500">{staff.phone}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {canManage ? (
                                            <>
                                                <button
                                                    onClick={() => openEditModal(staff)}
                                                    className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                >
                                                    <PencilIcon className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(staff)}
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-neutral-400">
                                                <LockClosedIcon className="size-4" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                        <UserCircleIcon className="mx-auto size-12 text-neutral-300" />
                        <p className="mt-2 text-neutral-500">Chưa có nhân viên nào</p>
                    </div>
                )}
            </div>

            {/* Modal using NcModal */}
            <NcModal
                isOpenProp={showModal}
                onCloseModal={() => setShowModal(false)}
                modalTitle={editingStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                contentExtraClass="max-w-md"
                renderContent={renderModalContent}
            />
        </div>
    )
}
