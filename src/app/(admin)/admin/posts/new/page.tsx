'use client'

import { Button } from '@/shared/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TiptapEditor from '@/components/admin/TiptapEditor'
import ImageUploader from '@/components/admin/ImageUploader'

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

export default function NewPostPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [type, setType] = useState<'NEWS' | 'EVENT'>('NEWS')
    const [excerpt, setExcerpt] = useState('')
    const [content, setContent] = useState('')
    const [thumbnail, setThumbnail] = useState<string[]>([])
    const [images, setImages] = useState<string[]>([])
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
    const [featured, setFeatured] = useState(false)
    const [eventDate, setEventDate] = useState('')
    const [eventTime, setEventTime] = useState('')
    const [eventLocation, setEventLocation] = useState('')

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        setSlug(generateSlug(newTitle))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/admin/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    slug,
                    type,
                    excerpt,
                    content,
                    thumbnail: thumbnail[0] || null,
                    images,
                    status,
                    featured,
                    eventDate: type === 'EVENT' && eventDate ? eventDate : null,
                    eventTime: type === 'EVENT' ? eventTime : null,
                    eventLocation: type === 'EVENT' ? eventLocation : null,
                }),
            })

            if (res.ok) {
                router.push('/admin/posts')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error(error)
            alert('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Thêm bài viết mới</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-900 space-y-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Thông tin cơ bản</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Loại bài viết</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'NEWS' | 'EVENT')}
                                className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                            >
                                <option value="NEWS">Tin tức</option>
                                <option value="EVENT">Sự kiện</option>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Trạng thái</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                                className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                            >
                                <option value="DRAFT">Bản nháp</option>
                                <option value="PUBLISHED">Xuất bản ngay</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tiêu đề</label>
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            required
                            className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                            placeholder="Nhập tiêu đề bài viết"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Slug (URL)</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                            placeholder="tieu-de-bai-viet"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tóm tắt</label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={2}
                            className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                            placeholder="Mô tả ngắn về bài viết (hiển thị trên trang danh sách)"
                        />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Bài viết nổi bật</span>
                    </label>
                </div>

                {/* Event Details (only for EVENT type) */}
                {type === 'EVENT' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-900 space-y-6">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Thông tin sự kiện</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Ngày diễn ra</label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Giờ bắt đầu</label>
                                <input
                                    type="time"
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Địa điểm</label>
                            <input
                                type="text"
                                value={eventLocation}
                                onChange={(e) => setEventLocation(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                                placeholder="VD: Nerd Society - 123 Đường ABC"
                            />
                        </div>
                    </div>
                )}

                {/* Media */}
                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-900 space-y-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Hình ảnh</h2>

                    <ImageUploader
                        images={thumbnail}
                        onChange={setThumbnail}
                        multiple={false}
                        label="Ảnh đại diện (Thumbnail)"
                    />

                    <ImageUploader
                        images={images}
                        onChange={setImages}
                        multiple={true}
                        label="Gallery ảnh (Carousel)"
                    />
                </div>

                {/* Content */}
                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-900 space-y-4">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Nội dung</h2>
                    <TiptapEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Nhập nội dung bài viết..."
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <Button type="submit" color="primary" loading={loading}>
                        {loading ? 'Đang lưu...' : 'Tạo bài viết'}
                    </Button>
                    <Button type="button" outline onClick={() => router.back()}>
                        Hủy
                    </Button>
                </div>
            </form>
        </div>
    )
}
