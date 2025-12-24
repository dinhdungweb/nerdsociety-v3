'use client'

import { useState, useEffect, useRef } from 'react'
import {
    PlusIcon,
    BuildingOffice2Icon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    UserIcon,
    CubeIcon,
    Squares2X2Icon,
    CloudArrowUpIcon,
    FolderOpenIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/shared/Button'
import NcModal from '@/shared/NcModal'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import { toast } from 'react-hot-toast'
import { usePermissions } from '@/contexts/PermissionsContext'

interface Room {
    id: string
    name: string
    type: 'MEETING_LONG' | 'MEETING_ROUND' | 'POD_MONO' | 'POD_MULTI'
    description: string | null
    capacity: number
    amenities: string[]
    image: string | null
    isActive: boolean
    location: { id: string; name: string }
    _count: { bookings: number }
}

interface Location {
    id: string
    name: string
}

const roomTypeLabels: Record<string, string> = {
    MEETING_LONG: 'Meeting - Bàn dài',
    MEETING_ROUND: 'Meeting - Bàn tròn',
    POD_MONO: 'Mono Pod',
    POD_MULTI: 'Multi Pod',
}

const roomTypeColors: Record<string, string> = {
    MEETING_LONG: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    MEETING_ROUND: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    POD_MONO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    POD_MULTI: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

const RoomTypeIcon = ({ type }: { type: string }) => {
    const iconClass = "w-6 h-6"
    switch (type) {
        case 'MEETING_LONG':
            return <BuildingOffice2Icon className={`${iconClass} text-blue-600`} />
        case 'MEETING_ROUND':
            return <Squares2X2Icon className={`${iconClass} text-indigo-600`} />
        case 'POD_MONO':
            return <UserIcon className={`${iconClass} text-emerald-600`} />
        case 'POD_MULTI':
            return <UserGroupIcon className={`${iconClass} text-teal-600`} />
        default:
            return <CubeIcon className={`${iconClass} text-neutral-600`} />
    }
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [showMediaPicker, setShowMediaPicker] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Permission check
    const { hasPermission } = usePermissions()
    const canManageRooms = hasPermission('canManageRooms')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'MEETING_LONG',
        description: '',
        capacity: 1,
        amenities: '',
        locationId: '',
        image: '',
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchRooms()
        fetchLocations()
    }, [])

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/admin/rooms')
            if (res.ok) {
                const data = await res.json()
                setRooms(data)
            }
        } catch (error) {
            console.error('Error fetching rooms:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchLocations = async () => {
        try {
            const res = await fetch('/api/admin/locations')
            if (res.ok) {
                const data = await res.json()
                setLocations(data)
            }
        } catch (error) {
            console.error('Error fetching locations:', error)
        }
    }

    const openCreateModal = () => {
        setEditingRoom(null)
        setFormData({
            name: '',
            type: 'MEETING_LONG',
            description: '',
            capacity: 1,
            amenities: '',
            locationId: locations[0]?.id || '',
            image: '',
        })
        setIsModalOpen(true)
    }

    const openEditModal = (room: Room) => {
        setEditingRoom(room)
        setFormData({
            name: room.name,
            type: room.type,
            description: room.description || '',
            capacity: room.capacity,
            amenities: room.amenities.join(', '),
            locationId: room.location.id,
            image: room.image || '',
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                ...formData,
                amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
                image: formData.image || null,
            }

            const url = editingRoom
                ? `/api/admin/rooms/${editingRoom.id}`
                : '/api/admin/rooms'
            const method = editingRoom ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                fetchRooms()
                setIsModalOpen(false)
            } else {
                const error = await res.json()
                alert(error.error || 'Failed to save room')
            }
        } catch (error) {
            console.error('Error saving room:', error)
        } finally {
            setSaving(false)
        }
    }

    // Image upload handlers
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploadingImage(true)
        try {
            const formDataUpload = new FormData()
            formDataUpload.append('files', files[0])

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            })

            const data = await res.json()
            if (res.ok && data.url) {
                setFormData(prev => ({ ...prev, image: data.url }))
                toast.success('Đã upload ảnh!')
            } else {
                toast.error(data.error || 'Lỗi khi upload ảnh')
            }
        } catch (error) {
            toast.error('Lỗi khi upload ảnh!')
        } finally {
            setUploadingImage(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, image: '' }))
    }

    const toggleRoomStatus = async (room: Room) => {
        try {
            await fetch(`/api/admin/rooms/${room.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !room.isActive }),
            })
            fetchRooms()
        } catch (error) {
            console.error('Error toggling room status:', error)
        }
    }

    const deleteRoom = async (room: Room) => {
        if (!confirm(`Bạn có chắc muốn xóa phòng "${room.name}"?`)) return

        try {
            const res = await fetch(`/api/admin/rooms/${room.id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                fetchRooms()
            } else {
                const error = await res.json()
                alert(error.error || 'Không thể xóa phòng')
            }
        } catch (error) {
            console.error('Error deleting room:', error)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Quản lý Phòng
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        {rooms.length} phòng
                    </p>
                </div>
                {canManageRooms && (
                    <Button onClick={openCreateModal}>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Thêm phòng
                    </Button>
                )}
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <div
                        key={room.id}
                        className={`bg-white dark:bg-neutral-800 rounded-xl border ${room.isActive
                            ? 'border-neutral-200 dark:border-neutral-700'
                            : 'border-red-200 dark:border-red-800 opacity-60'
                            } p-5 hover:shadow-lg transition-shadow`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                                    <RoomTypeIcon type={room.type} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                                        {room.name}
                                    </h3>
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${roomTypeColors[room.type]}`}>
                                        {roomTypeLabels[room.type]}
                                    </span>
                                </div>
                            </div>
                            {canManageRooms && (
                                <button
                                    onClick={() => toggleRoomStatus(room)}
                                    className={`p-1.5 rounded-full transition-colors ${room.isActive
                                        ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                        : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        }`}
                                    title={room.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                                >
                                    {room.isActive ? (
                                        <CheckCircleIcon className="w-5 h-5" />
                                    ) : (
                                        <XCircleIcon className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Info */}
                        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-2">
                                <UserGroupIcon className="w-4 h-4" />
                                <span>Sức chứa: {room.capacity} người</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BuildingOffice2Icon className="w-4 h-4" />
                                <span>{room.location.name}</span>
                            </div>
                            {room.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {room.amenities.slice(0, 3).map((amenity, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 rounded"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                    {room.amenities.length > 3 && (
                                        <span className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 rounded">
                                            +{room.amenities.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                            <span className="text-xs text-neutral-500">
                                {room._count.bookings} lượt đặt
                            </span>
                            {canManageRooms && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(room)}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => deleteRoom(room)}
                                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <NcModal
                isOpenProp={isModalOpen}
                onCloseModal={() => setIsModalOpen(false)}
                modalTitle={editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}
                renderTrigger={() => null}
                renderContent={() => (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Tên phòng
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Loại phòng
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                >
                                    <option value="MEETING_LONG">Meeting - Bàn dài</option>
                                    <option value="MEETING_ROUND">Meeting - Bàn tròn</option>
                                    <option value="POD_MONO">Mono Pod</option>
                                    <option value="POD_MULTI">Multi Pod</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Sức chứa
                                </label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                                    min="1"
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Cơ sở
                            </label>
                            <select
                                value={formData.locationId}
                                onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                required
                            >
                                <option value="">Chọn cơ sở</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Tiện ích (cách nhau bằng dấu phẩy)
                            </label>
                            <input
                                type="text"
                                value={formData.amenities}
                                onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                                placeholder="Máy chiếu, Điều hòa, Bảng trắng"
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                            />
                        </div>

                        {/* Room Image */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Ảnh phòng (tuỳ chọn, nếu không có sẽ hiển thị icon)
                            </label>

                            {formData.image ? (
                                /* Preview when image exists */
                                <div className="relative h-40 w-full overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.image}
                                        alt="Room preview"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                /* Upload zone when no image */
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 transition hover:border-primary-400 hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-primary-500 dark:hover:bg-neutral-700"
                                >
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                                        <CloudArrowUpIcon className="h-7 w-7 text-neutral-500 dark:text-neutral-400" />
                                    </div>
                                    <p className="text-center font-medium text-neutral-900 dark:text-white">
                                        Kéo thả ảnh vào đây
                                    </p>
                                    <p className="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
                                        PNG, JPG, WebP hoặc{' '}
                                        <span className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                                            chọn file
                                        </span>
                                    </p>
                                    {uploadingImage && (
                                        <p className="mt-2 text-sm text-primary-600">Đang upload...</p>
                                    )}
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            {/* Buttons for upload and library */}
                            <div className="flex gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowMediaPicker(true)}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    <FolderOpenIcon className="size-4" />
                                    Chọn từ thư viện
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                                >
                                    <CloudArrowUpIcon className="size-4" />
                                    {uploadingImage ? 'Đang upload...' : 'Tải lên mới'}
                                </button>
                            </div>

                            <MediaPickerModal
                                isOpen={showMediaPicker}
                                onClose={() => setShowMediaPicker(false)}
                                onSelect={(urls: string[]) => {
                                    if (urls.length > 0) {
                                        setFormData(prev => ({ ...prev, image: urls[0] }))
                                    }
                                }}
                                selectedUrls={formData.image ? [formData.image] : []}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" loading={saving}>
                                {editingRoom ? 'Cập nhật' : 'Tạo phòng'}
                            </Button>
                            <Button type="button" outline onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </Button>
                        </div>
                    </form>
                )}
            />
        </div>
    )
}
