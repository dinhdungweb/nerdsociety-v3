'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // Use from next/navigation for app dir
import {
    ClockIcon,
    PencilSquareIcon,
    TrashIcon,
    FireIcon,
    BookOpenIcon,
    SunIcon,
    MoonIcon,
    PresentationChartBarIcon,
} from '@heroicons/react/24/outline'
import NcModal from '@/shared/NcModal'
import ComboForm from './forms/ComboForm'
import { usePermissions } from '@/contexts/PermissionsContext'

// Define interfaces locally or import
interface Combo {
    id: string
    name: string
    duration: number
    price: number
    description: string | null
    features: string[]
    icon: string | null
    image: string | null
    isPopular: boolean
    isActive: boolean
    sortOrder: number
}

interface ComboCardProps {
    combo: Combo
}

// Icon mapping for fallback
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    ClockIcon,
    FireIcon,
    BookOpenIcon,
    SunIcon,
    MoonIcon,
    PresentationChartBarIcon,
}

export default function ComboCard({ combo }: ComboCardProps) {
    const router = useRouter()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Permission check
    const { hasPermission } = usePermissions()
    const canManageServices = hasPermission('canManageServices')

    const handleDelete = async () => {
        if (!confirm(`Bạn có chắc chắn muốn xóa combo "${combo.name}"?`)) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/combos/${combo.id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'Lỗi xóa combo')
            }
        } catch (error) {
            console.error(error)
            alert('Có lỗi xảy ra')
        } finally {
            setIsDeleting(false)
        }
    }

    // Get icon component for fallback
    const IconComponent = combo.icon ? iconMap[combo.icon] || ClockIcon : ClockIcon

    return (
        <div className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 overflow-hidden">
                        {combo.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={combo.image}
                                alt={combo.name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <IconComponent className="size-6" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white">
                            {combo.name}
                        </h3>
                        <div className="mt-0.5 flex gap-2">
                            <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${combo.isActive
                                ? 'border-green-100 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'border-red-100 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                {combo.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {combo.isPopular && (
                                <span className="inline-block rounded border border-yellow-100 bg-yellow-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-yellow-700 uppercase dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                    Popular
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
                {combo.description && (
                    <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {combo.description}
                    </p>
                )}

                {/* Pricing Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                        <p className="text-xs text-neutral-500">Thời lượng</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                            {combo.duration >= 60 ? `${(combo.duration / 60).toFixed(1).replace('.0', '')}h` : `${combo.duration}p`}
                        </p>
                    </div>
                    <div className="space-y-1 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                        <p className="text-xs text-neutral-500">Giá combo</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                            {new Intl.NumberFormat('vi-VN').format(combo.price)}đ
                        </p>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="space-y-1">
                    {combo.features.slice(0, 2).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="size-1 rounded-full bg-primary-500" />
                            <span className="truncate">{feature}</span>
                        </div>
                    ))}
                    {combo.features.length > 2 && (
                        <p className="pl-3 text-xs text-neutral-400">
                            +{combo.features.length - 2} tính năng khác
                        </p>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            {canManageServices && (
                <div className="mt-5 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-500 transition-colors"
                    >
                        <PencilSquareIcon className="size-4" />
                        <span>Chỉnh sửa</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                        <TrashIcon className="size-4" />
                        <span>{isDeleting ? 'Đang xóa...' : 'Xóa'}</span>
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            <NcModal
                isOpenProp={isEditOpen}
                onCloseModal={() => setIsEditOpen(false)}
                modalTitle={`Chỉnh sửa: ${combo.name}`}
                renderContent={() => (
                    <ComboForm
                        combo={combo}
                        onSuccess={() => setIsEditOpen(false)}
                        onCancel={() => setIsEditOpen(false)}
                    />
                )}
            />
        </div>
    )
}
