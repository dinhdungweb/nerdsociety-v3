'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/Button'
import { toast } from 'react-hot-toast'
import {
    TrashIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    ClipboardDocumentIcon,
    MagnifyingGlassIcon,
    Squares2X2Icon,
    ListBulletIcon,
    XMarkIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'

interface MediaFile {
    name: string
    url: string
    size: number
    isImage: boolean
    createdAt: string
    modifiedAt: string
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function AdminMediaPage() {
    const [files, setFiles] = useState<MediaFile[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
    const [dragActive, setDragActive] = useState(false)

    useEffect(() => {
        fetchMedia()
    }, [])

    const fetchMedia = async () => {
        try {
            const res = await fetch('/api/admin/media')
            if (res.ok) {
                const data = await res.json()
                setFiles(data.files || [])
            }
        } catch (error) {
            console.error('Error fetching media:', error)
            toast.error('Không thể tải danh sách media')
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (inputFiles: FileList | null) => {
        if (!inputFiles || inputFiles.length === 0) return

        setUploading(true)
        let successCount = 0

        try {
            for (const file of Array.from(inputFiles)) {
                const formData = new FormData()
                formData.append('files', file)

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (res.ok) {
                    successCount++
                }
            }

            if (successCount > 0) {
                toast.success(`Đã tải lên ${successCount} file!`)
                fetchMedia()
            }
        } catch (error) {
            toast.error('Lỗi khi tải file!')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (filename: string) => {
        if (!confirm(`Xóa file "${filename}"?`)) return

        try {
            const res = await fetch(`/api/admin/media?filename=${encodeURIComponent(filename)}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                toast.success('Đã xóa file!')
                setFiles(prev => prev.filter(f => f.name !== filename))
                if (selectedFile?.name === filename) {
                    setSelectedFile(null)
                }
            } else {
                toast.error('Không thể xóa file')
            }
        } catch (error) {
            toast.error('Lỗi khi xóa file!')
        }
    }

    const copyToClipboard = (url: string) => {
        const fullUrl = window.location.origin + url
        navigator.clipboard.writeText(fullUrl)
        toast.success('Đã copy URL!')
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
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="grid grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="aspect-square bg-neutral-200 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Media Library</h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Quản lý tất cả hình ảnh và tệp tin • {files.length} files
                    </p>
                </div>
                <label className="cursor-pointer">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => handleUpload(e.target.files)}
                        className="hidden"
                    />
                    <Button as="span" color="primary" disabled={uploading}>
                        <CloudArrowUpIcon className="size-5 mr-2" />
                        {uploading ? 'Đang tải...' : 'Tải lên'}
                    </Button>
                </label>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-xl p-4 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm file..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{filteredFiles.length} files</span>
                    <div className="flex rounded-xl border border-neutral-300 overflow-hidden dark:border-neutral-700">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}`}
                        >
                            <Squares2X2Icon className="size-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}`}
                        >
                            <ListBulletIcon className="size-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex gap-6">
                {/* Files Grid/List */}
                <div className="flex-1">
                    {filteredFiles.length === 0 ? (
                        <div
                            className={`text-center py-16 bg-white rounded-2xl border-2 border-dashed transition-colors dark:bg-neutral-900 ${dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-300 dark:border-neutral-700'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <CloudArrowUpIcon className="size-12 mx-auto text-neutral-400 mb-4" />
                            <p className="text-lg font-medium text-neutral-900 dark:text-white">
                                {searchQuery ? 'Không tìm thấy file nào' : 'Kéo thả file vào đây'}
                            </p>
                            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'hoặc click nút Tải lên ở trên'}
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div
                            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 rounded-2xl border-2 border-dashed transition-colors ${dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {filteredFiles.map(file => (
                                <div
                                    key={file.name}
                                    onClick={() => setSelectedFile(file)}
                                    className={`group relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all dark:bg-neutral-900 ${selectedFile?.name === file.name
                                        ? 'border-primary-500 ring-4 ring-primary-500/20'
                                        : 'border-neutral-200 hover:border-neutral-300 hover:shadow-lg dark:border-neutral-800 dark:hover:border-neutral-700'
                                        }`}
                                >
                                    <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-800">
                                        {file.isImage ? (
                                            <Image
                                                src={file.url}
                                                alt={file.name}
                                                fill
                                                className="object-cover"
                                                sizes="200px"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <DocumentIcon className="size-12 text-neutral-400" />
                                            </div>
                                        )}
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyToClipboard(file.url) }}
                                                className="p-2 bg-white rounded-lg text-neutral-700 hover:bg-neutral-100"
                                            >
                                                <ClipboardDocumentIcon className="size-5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(file.name) }}
                                                className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                                            >
                                                <TrashIcon className="size-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-neutral-700 truncate dark:text-neutral-300" title={file.name}>
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden dark:bg-neutral-900 dark:border-neutral-800">
                            <table className="w-full">
                                <thead className="bg-neutral-50 dark:bg-neutral-800">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">File</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Kích thước</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Ngày tải lên</th>
                                        <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {filteredFiles.map(file => (
                                        <tr
                                            key={file.name}
                                            className={`transition-colors cursor-pointer ${selectedFile?.name === file.name ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                                            onClick={() => setSelectedFile(file)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 dark:bg-neutral-800">
                                                        {file.isImage ? (
                                                            <Image
                                                                src={file.url}
                                                                alt={file.name}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <DocumentIcon className="size-5 text-neutral-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-neutral-900 truncate max-w-[200px] dark:text-white">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                                {formatFileSize(file.size)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                                {formatDate(file.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(file.url) }}
                                                        className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg dark:hover:bg-primary-900/20"
                                                        title="Copy URL"
                                                    >
                                                        <ClipboardDocumentIcon className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(file.name) }}
                                                        className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"
                                                        title="Xóa"
                                                    >
                                                        <TrashIcon className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Sidebar - File Details */}
                {selectedFile && (
                    <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-neutral-200 p-5 space-y-5 h-fit sticky top-8 dark:bg-neutral-900 dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-neutral-900 dark:text-white">Chi tiết file</h3>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                            >
                                <XMarkIcon className="size-5" />
                            </button>
                        </div>

                        <div className="aspect-video relative bg-neutral-100 rounded-xl overflow-hidden dark:bg-neutral-800">
                            {selectedFile.isImage ? (
                                <Image
                                    src={selectedFile.url}
                                    alt={selectedFile.name}
                                    fill
                                    className="object-contain"
                                    sizes="320px"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <DocumentIcon className="size-16 text-neutral-400" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="font-medium text-neutral-900 break-all dark:text-white">{selectedFile.name}</h4>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                                <span className="text-neutral-500 dark:text-neutral-400">Kích thước</span>
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatFileSize(selectedFile.size)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                                <span className="text-neutral-500 dark:text-neutral-400">Ngày tạo</span>
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatDate(selectedFile.createdAt)}</span>
                            </div>
                        </div>

                        <div className="pt-2 space-y-2">
                            <Button
                                color="white"
                                className="w-full justify-center"
                                onClick={() => copyToClipboard(selectedFile.url)}
                            >
                                <ClipboardDocumentIcon className="size-4 mr-2" />
                                Copy URL
                            </Button>
                            <Button
                                color="white"
                                className="w-full justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleDelete(selectedFile.name)}
                            >
                                <TrashIcon className="size-4 mr-2" />
                                Xóa file
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
