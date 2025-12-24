'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import {
    XMarkIcon,
    MagnifyingGlassIcon,
    CloudArrowUpIcon,
    CheckIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { Fragment } from 'react'

interface MediaFile {
    name: string
    url: string
    size: number
    isImage: boolean
    createdAt: string
}

interface MediaPickerModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (urls: string[]) => void
    multiple?: boolean
    selectedUrls?: string[]
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function MediaPickerModal({
    isOpen,
    onClose,
    onSelect,
    multiple = false,
    selectedUrls = [],
}: MediaPickerModalProps) {
    const [files, setFiles] = useState<MediaFile[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selected, setSelected] = useState<string[]>([])
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const initializedRef = useRef(false)

    useEffect(() => {
        if (isOpen) {
            fetchMedia()
            // Only set selected on first open
            if (!initializedRef.current) {
                setSelected(selectedUrls)
                initializedRef.current = true
            }
        } else {
            // Reset when closed
            initializedRef.current = false
        }
    }, [isOpen])

    const fetchMedia = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/media')
            if (res.ok) {
                const data = await res.json()
                setFiles(data.files || [])
            }
        } catch (error) {
            console.error('Error fetching media:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (inputFiles: FileList | null) => {
        if (!inputFiles || inputFiles.length === 0) return

        setUploading(true)
        try {
            const formData = new FormData()
            for (let i = 0; i < inputFiles.length; i++) {
                formData.append('files', inputFiles[i])
            }

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                const data = await res.json()
                // Auto-select newly uploaded files
                if (multiple) {
                    setSelected(prev => [...prev, ...data.urls])
                } else {
                    setSelected(data.urls.slice(0, 1))
                }
                fetchMedia()
            }
        } catch (error) {
            console.error('Error uploading:', error)
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const toggleSelect = (url: string) => {
        if (multiple) {
            setSelected(prev =>
                prev.includes(url)
                    ? prev.filter(u => u !== url)
                    : [...prev, url]
            )
        } else {
            setSelected(prev => prev.includes(url) ? [] : [url])
        }
    }

    const handleConfirm = () => {
        onSelect(selected)
        onClose()
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        handleUpload(e.dataTransfer.files)
    }

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) && file.isImage
    )

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="fixed inset-0 z-[9999] overflow-y-auto" onClose={onClose}>
                <div className="min-h-screen px-4 flex items-center justify-center">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60" />
                    </TransitionChild>

                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                                <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Chọn hình ảnh
                                </DialogTitle>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <XMarkIcon className="size-5" />
                                </button>
                            </div>

                            {/* Toolbar */}
                            <div className="flex items-center gap-4 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                </div>

                                {/* Upload button */}
                                <label className="cursor-pointer">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={e => handleUpload(e.target.files)}
                                        className="hidden"
                                    />
                                    <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                                        <CloudArrowUpIcon className="size-5" />
                                        {uploading ? 'Đang tải...' : 'Tải lên'}
                                    </span>
                                </label>
                            </div>

                            {/* Content */}
                            <div
                                className={`p-6 max-h-[60vh] overflow-y-auto ${dragActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                {loading ? (
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : filteredFiles.length === 0 ? (
                                    <div className="text-center py-16">
                                        <PhotoIcon className="size-16 mx-auto text-neutral-300 dark:text-neutral-600" />
                                        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
                                            {searchQuery ? 'Không tìm thấy hình ảnh' : 'Chưa có hình ảnh nào'}
                                        </p>
                                        <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
                                            Kéo thả hoặc click nút Tải lên để thêm hình
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                                        {filteredFiles.map(file => {
                                            const isSelected = selected.includes(file.url)
                                            return (
                                                <div
                                                    key={file.name}
                                                    onClick={() => toggleSelect(file.url)}
                                                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected
                                                        ? 'border-primary-500 ring-4 ring-primary-500/20'
                                                        : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                                                        }`}
                                                >
                                                    <Image
                                                        src={file.url}
                                                        alt={file.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="150px"
                                                    />
                                                    {/* Selection indicator */}
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                                                            <div className="size-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
                                                                <CheckIcon className="size-5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Hover overlay */}
                                                    {!isSelected && (
                                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {selected.length > 0 ? `Đã chọn ${selected.length} hình ảnh` : 'Chọn hình ảnh từ thư viện'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={selected.length === 0}
                                        className="px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        </div>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
