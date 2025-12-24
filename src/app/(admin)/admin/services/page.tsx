'use client'

import { useState, useEffect, useRef } from 'react'
import {
    PlusIcon,
    PencilSquareIcon,
    CurrencyDollarIcon,
    ClockIcon,
    SparklesIcon,
    TrashIcon,
    BuildingOffice2Icon,
    UserIcon,
    UserGroupIcon,
    CubeIcon,
    CloudArrowUpIcon,
    FolderOpenIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/shared/Button'
import NcModal from '@/shared/NcModal'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import { toast } from 'react-hot-toast'
import { usePermissions } from '@/contexts/PermissionsContext'

interface Service {
    id: string
    name: string
    slug: string
    type: 'MEETING' | 'POD_MONO' | 'POD_MULTI'
    description: string | null
    priceSmall: number | null
    priceLarge: number | null
    priceFirstHour: number | null
    pricePerHour: number | null
    nerdCoinReward: number
    minDuration: number
    timeStep: number
    features: string[]
    icon: string | null
    image: string | null
    isActive: boolean
}

const serviceTypeLabels: Record<string, string> = {
    MEETING: 'Meeting Room',
    POD_MONO: 'Mono Pod',
    POD_MULTI: 'Multi Pod',
}

const serviceTypeColors: Record<string, string> = {
    MEETING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    POD_MONO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    POD_MULTI: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

const ServiceTypeIcon = ({ type }: { type: string }) => {
    const iconClass = "w-7 h-7"
    switch (type) {
        case 'MEETING':
            return <BuildingOffice2Icon className={`${iconClass} text-blue-600`} />
        case 'POD_MONO':
            return <UserIcon className={`${iconClass} text-emerald-600`} />
        case 'POD_MULTI':
            return <UserGroupIcon className={`${iconClass} text-teal-600`} />
        default:
            return <CubeIcon className={`${iconClass} text-neutral-600`} />
    }
}

function formatPrice(price: number | null) {
    if (price === null) return '-'
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [showMediaPicker, setShowMediaPicker] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Permission check
    const { hasPermission } = usePermissions()
    const canManageServices = hasPermission('canManageServices')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        type: 'MEETING',
        description: '',
        priceSmall: '',
        priceLarge: '',
        priceFirstHour: '',
        pricePerHour: '',
        nerdCoinReward: '0',
        minDuration: '60',
        timeStep: '30',
        features: '',
        image: '',
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/admin/services')
            if (res.ok) {
                const data = await res.json()
                setServices(data)
            }
        } catch (error) {
            console.error('Error fetching services:', error)
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingService(null)
        setFormData({
            name: '',
            slug: '',
            type: 'MEETING',
            description: '',
            priceSmall: '',
            priceLarge: '',
            priceFirstHour: '',
            pricePerHour: '',
            nerdCoinReward: '0',
            minDuration: '60',
            timeStep: '30',
            features: '',
            image: '',
        })
        setIsModalOpen(true)
    }

    const openEditModal = (service: Service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            slug: service.slug,
            type: service.type,
            description: service.description || '',
            priceSmall: service.priceSmall?.toString() || '',
            priceLarge: service.priceLarge?.toString() || '',
            priceFirstHour: service.priceFirstHour?.toString() || '',
            pricePerHour: service.pricePerHour?.toString() || '',
            nerdCoinReward: service.nerdCoinReward.toString(),
            minDuration: service.minDuration.toString(),
            timeStep: service.timeStep.toString(),
            features: service.features.join(', '),
            image: service.image || '',
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                ...formData,
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
                image: formData.image || null,
            }

            const url = editingService
                ? `/api/admin/services/${editingService.id}`
                : '/api/admin/services'
            const method = editingService ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                fetchServices()
                setIsModalOpen(false)
            } else {
                const error = await res.json()
                alert(error.error || 'Failed to save service')
            }
        } catch (error) {
            console.error('Error saving service:', error)
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

    const deleteService = async (service: Service) => {
        if (!confirm(`Bạn có chắc muốn xóa dịch vụ "${service.name}"?`)) return

        try {
            const res = await fetch(`/api/admin/services/${service.id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                fetchServices()
            } else {
                const error = await res.json()
                alert(error.error || 'Không thể xóa dịch vụ')
            }
        } catch (error) {
            console.error('Error deleting service:', error)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
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
                        Quản lý Dịch vụ
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Bảng giá và cấu hình dịch vụ
                    </p>
                </div>
                {canManageServices && (
                    <Button onClick={openCreateModal}>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Thêm dịch vụ
                    </Button>
                )}
            </div>

            {/* Services List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div
                        key={service.id}
                        className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:shadow-lg transition-all"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                                    <ServiceTypeIcon type={service.type} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">
                                        {service.name}
                                    </h3>
                                    <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${service.type === 'MEETING' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                        service.type === 'POD_MONO' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                                            'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800'
                                        }`}>
                                        {serviceTypeLabels[service.type]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-4">
                            {service.description && (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                    {service.description}
                                </p>
                            )}

                            {/* Pricing Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {service.type === 'MEETING' ? (
                                    <>
                                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                                            <p className="text-xs text-neutral-500">Dưới 8 người</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white">{formatPrice(service.priceSmall)}/h</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                                            <p className="text-xs text-neutral-500">8-20 người</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white">{formatPrice(service.priceLarge)}/h</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                                            <p className="text-xs text-neutral-500">Giờ đầu</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white">{formatPrice(service.priceFirstHour)}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                                            <p className="text-xs text-neutral-500">Giờ sau</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white">{formatPrice(service.pricePerHour)}/h</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Extra Info */}
                            <div className="flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded">
                                    <ClockIcon className="w-3.5 h-3.5" />
                                    <span>Min {service.minDuration}p</span>
                                </div>
                                {service.nerdCoinReward > 0 && (
                                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 px-2 py-1 rounded">
                                        <SparklesIcon className="w-3.5 h-3.5" />
                                        <span>+{service.nerdCoinReward} Coin</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        {canManageServices && (
                            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <button
                                    onClick={() => openEditModal(service)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-500 transition-colors"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    <span>Chỉnh sửa</span>
                                </button>
                                <button
                                    onClick={() => deleteService(service)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-500 transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    <span>Xóa</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            <NcModal
                isOpenProp={isModalOpen}
                onCloseModal={() => setIsModalOpen(false)}
                modalTitle={editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
                renderTrigger={() => null}
                renderContent={() => (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Tên dịch vụ
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                    required
                                    disabled={!!editingService}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Loại dịch vụ
                            </label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                disabled={!!editingService}
                            >
                                <option value="MEETING">Meeting Room</option>
                                <option value="POD_MONO">Mono Pod</option>
                                <option value="POD_MULTI">Multi Pod</option>
                            </select>
                        </div>

                        {/* Pricing - Meeting */}
                        {formData.type === 'MEETING' && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Giá &lt;8 người (VND/h)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.priceSmall}
                                        onChange={e => setFormData({ ...formData, priceSmall: e.target.value })}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Giá 8-20 người (VND/h)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.priceLarge}
                                        onChange={e => setFormData({ ...formData, priceLarge: e.target.value })}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Pricing - Pod */}
                        {formData.type !== 'MEETING' && (
                            <div className="grid grid-cols-3 gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Giá giờ đầu (VND)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.priceFirstHour}
                                        onChange={e => setFormData({ ...formData, priceFirstHour: e.target.value })}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Giá từ giờ 2 (VND/h)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.pricePerHour}
                                        onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Nerd Coin tặng
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.nerdCoinReward}
                                        onChange={e => setFormData({ ...formData, nerdCoinReward: e.target.value })}
                                        min="0"
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Thời gian tối thiểu (phút)
                                </label>
                                <input
                                    type="number"
                                    value={formData.minDuration}
                                    onChange={e => setFormData({ ...formData, minDuration: e.target.value })}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Bước nhảy (phút)
                                </label>
                                <input
                                    type="number"
                                    value={formData.timeStep}
                                    onChange={e => setFormData({ ...formData, timeStep: e.target.value })}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                />
                            </div>
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

                        {/* Service Image */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Ảnh dịch vụ (tuỳ chọn, nếu không có sẽ hiển thị icon)
                            </label>

                            {formData.image ? (
                                /* Preview when image exists */
                                <div className="relative h-40 w-full overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.image}
                                        alt="Service preview"
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
                                {editingService ? 'Cập nhật' : 'Tạo dịch vụ'}
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
