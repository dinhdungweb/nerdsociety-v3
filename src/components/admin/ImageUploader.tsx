'use client'

import { useState, useRef } from 'react'
import { PhotoIcon, XMarkIcon, FolderOpenIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import MediaPickerModal from './MediaPickerModal'

interface ImageUploaderProps {
    images: string[]
    onChange: (images: string[]) => void
    multiple?: boolean
    label?: string
}

export default function ImageUploader({
    images,
    onChange,
    multiple = false,
    label = 'Upload hình ảnh'
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [showMediaPicker, setShowMediaPicker] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        try {
            const formData = new FormData()
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i])
            }

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                const data = await res.json()
                if (multiple) {
                    onChange([...images, ...data.urls])
                } else {
                    onChange(data.urls)
                }
            } else {
                alert('Có lỗi khi upload ảnh')
            }
        } catch (error) {
            console.error(error)
            alert('Có lỗi xảy ra')
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        onChange(newImages)
    }

    const handleMediaSelect = (urls: string[]) => {
        if (multiple) {
            // Add new URLs, avoid duplicates
            const newUrls = urls.filter(url => !images.includes(url))
            onChange([...images, ...newUrls])
        } else {
            onChange(urls)
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {label}
            </label>

            {/* Image previews */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                    {images.map((url, index) => (
                        <div key={index} className="relative group">
                            <div className="relative size-24 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                <Image
                                    src={url}
                                    alt=""
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <XMarkIcon className="size-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
                {/* Choose from library button */}
                <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-4 text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                    <FolderOpenIcon className="size-6" />
                    <span className="text-sm font-medium">Chọn từ thư viện</span>
                </button>

                {/* Upload button */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <PhotoIcon className="size-6 text-neutral-400" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {uploading ? 'Đang upload...' : 'Tải lên mới'}
                    </span>
                </div>
            </div>

            <p className="mt-2 text-xs text-neutral-400 text-center">
                PNG, JPG, GIF, WebP (Tối đa 5MB)
            </p>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleUpload}
                className="hidden"
            />

            {/* Media Picker Modal */}
            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleMediaSelect}
                multiple={multiple}
                selectedUrls={images}
            />
        </div>
    )
}
