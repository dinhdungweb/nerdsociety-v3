'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/Button'
import { toast } from 'react-hot-toast'
import {
    TrashIcon,
    PlusIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CloudArrowUpIcon,
    LinkIcon,
    EyeIcon,
    PhotoIcon,
    FolderOpenIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import { usePermissions } from '@/contexts/PermissionsContext'

interface GalleryImage {
    id: string
    src: string
    alt: string
    span: string
    order: number
}

const SPAN_OPTIONS = [
    { value: 'col-span-1 row-span-1', label: 'Nhỏ (1×1)', preview: 'size-8' },
    { value: 'col-span-2 row-span-1', label: 'Rộng (2×1)', preview: 'w-16 h-8' },
    { value: 'col-span-1 row-span-2', label: 'Cao (1×2)', preview: 'w-8 h-16' },
    { value: 'col-span-2 row-span-2', label: 'Lớn (2×2)', preview: 'size-12' },
]

export default function AdminGalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [showMediaPicker, setShowMediaPicker] = useState(false)

    // Permission check
    const { hasPermission } = usePermissions()
    const canManageGallery = hasPermission('canManageGallery')

    useEffect(() => {
        fetchGallery()
    }, [])

    const fetchGallery = async () => {
        try {
            const res = await fetch('/api/admin/gallery')
            if (res.ok) {
                const data = await res.json()
                setImages(data.images || [])
            }
        } catch (error) {
            console.error('Error fetching gallery:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        let uploaded = 0
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData()
                formData.append('files', file)

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (res.ok) {
                    const data = await res.json()
                    const newImage: GalleryImage = {
                        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        src: data.url,
                        alt: file.name.replace(/\.[^/.]+$/, ''),
                        span: 'col-span-1 row-span-1',
                        order: images.length + uploaded,
                    }
                    setImages(prev => [...prev, newImage])
                    uploaded++
                }
            }
            if (uploaded > 0) {
                toast.success(`Đã tải ${uploaded} ảnh lên!`)
            }
        } catch (error) {
            toast.error('Lỗi khi tải ảnh!')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const handleAddFromUrl = () => {
        const url = prompt('Nhập URL ảnh:')
        if (url) {
            const alt = prompt('Nhập mô tả ảnh:') || 'Gallery image'
            const newImage: GalleryImage = {
                id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                src: url,
                alt,
                span: 'col-span-1 row-span-1',
                order: images.length,
            }
            setImages(prev => [...prev, newImage])
            toast.success('Đã thêm ảnh!')
        }
    }

    const handleRemove = (id: string) => {
        if (confirm('Xóa ảnh này khỏi gallery?')) {
            setImages(prev => prev.filter(img => img.id !== id))
            toast.success('Đã xóa ảnh!')
        }
    }

    const handleChange = (id: string, field: keyof GalleryImage, value: string) => {
        setImages(prev => prev.map(img =>
            img.id === id ? { ...img, [field]: value } : img
        ))
    }

    const moveImage = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= images.length) return

        const newImages = [...images]
        const temp = newImages[index]
        newImages[index] = newImages[newIndex]
        newImages[newIndex] = temp
        setImages(newImages)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images }),
            })

            if (!res.ok) throw new Error('Failed to save')
            toast.success('Đã lưu gallery!')
        } catch (error) {
            toast.error('Lỗi khi lưu!')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-64 bg-neutral-200 rounded-xl animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý Gallery</h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Thêm, sửa, xóa ảnh trong section Gallery trên trang chủ • {images.length} ảnh
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {canManageGallery && (
                        <>
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleUpload}
                                    className="hidden"
                                />
                                <Button as="span" color="white" disabled={uploading}>
                                    <CloudArrowUpIcon className="size-4 mr-2" />
                                    {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
                                </Button>
                            </label>
                            <Button color="white" onClick={handleAddFromUrl}>
                                <LinkIcon className="size-4 mr-2" />
                                Thêm từ URL
                            </Button>
                            <Button color="white" onClick={() => setShowMediaPicker(true)}>
                                <FolderOpenIcon className="size-4 mr-2" />
                                Chọn từ thư viện
                            </Button>
                        </>
                    )}
                    <Button color="white" onClick={() => setShowPreview(!showPreview)}>
                        <EyeIcon className="size-4 mr-2" />
                        {showPreview ? 'Ẩn preview' : 'Xem preview'}
                    </Button>
                    {canManageGallery && (
                        <Button color="primary" onClick={handleSave} loading={saving}>
                            Lưu thay đổi
                        </Button>
                    )}
                </div>
            </div>

            {/* Preview Section */}
            {showPreview && images.length > 0 && (
                <div className="rounded-2xl bg-white border border-neutral-200 p-6 dark:bg-neutral-900 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Xem trước Gallery</h2>
                    <div className="grid grid-cols-4 gap-3 auto-rows-[80px] bg-neutral-100 p-4 rounded-xl dark:bg-neutral-800">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className={`${image.span} relative rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700`}
                            >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Images List */}
            {images.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-neutral-300 dark:bg-neutral-900 dark:border-neutral-700">
                    <PhotoIcon className="mx-auto size-12 text-neutral-400" />
                    <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">Chưa có ảnh nào trong gallery</p>
                    <p className="mt-2 text-neutral-500 dark:text-neutral-400">Tải ảnh lên hoặc thêm từ URL để bắt đầu</p>
                    <div className="mt-6 flex justify-center gap-3">
                        <label className="cursor-pointer">
                            <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
                            <Button as="span" color="primary">
                                <CloudArrowUpIcon className="size-4 mr-2" />
                                Tải ảnh lên
                            </Button>
                        </label>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 transition-all hover:shadow-md"
                        >
                            {/* Order controls */}
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => moveImage(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                                >
                                    <ArrowUpIcon className="size-4" />
                                </button>
                                <span className="text-xs text-center font-medium text-neutral-500">{index + 1}</span>
                                <button
                                    onClick={() => moveImage(index, 'down')}
                                    disabled={index === images.length - 1}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                                >
                                    <ArrowDownIcon className="size-4" />
                                </button>
                            </div>

                            {/* Image preview */}
                            <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 dark:bg-neutral-800">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </div>

                            {/* Image details */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">URL ảnh</label>
                                    <input
                                        type="text"
                                        value={image.src}
                                        onChange={e => handleChange(image.id, 'src', e.target.value)}
                                        className="w-full text-sm rounded-lg border border-neutral-300 p-2.5 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                        placeholder="URL ảnh"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Mô tả ảnh</label>
                                    <input
                                        type="text"
                                        value={image.alt}
                                        onChange={e => handleChange(image.id, 'alt', e.target.value)}
                                        className="w-full text-sm rounded-lg border border-neutral-300 p-2.5 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                        placeholder="Mô tả"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Kích thước</label>
                                    <select
                                        value={image.span}
                                        onChange={e => handleChange(image.id, 'span', e.target.value)}
                                        className="w-full text-sm rounded-lg border border-neutral-300 p-2.5 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    >
                                        {SPAN_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Delete button */}
                            {canManageGallery && (
                                <button
                                    onClick={() => handleRemove(image.id)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                                >
                                    <TrashIcon className="size-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Media Picker Modal */}
            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                multiple
                onSelect={(urls) => {
                    const newImages = urls.map((url, idx) => ({
                        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        src: url,
                        alt: 'Gallery image',
                        span: 'col-span-1 row-span-1',
                        order: images.length + idx,
                    }))
                    setImages(prev => [...prev, ...newImages])
                    toast.success(`Đã thêm ${urls.length} ảnh!`)
                }}
            />
        </div>
    )
}
