'use client'

import { Button } from '@/shared/Button'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import {
    CloudArrowUpIcon,
    Cog6ToothIcon,
    GlobeAltIcon,
    PhotoIcon,
    TrashIcon,
    FolderOpenIcon,
    EnvelopeIcon,
    CursorArrowRippleIcon,
} from '@heroicons/react/24/outline'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import Image from 'next/image'
import FloatingButtonsSettings from '@/components/admin/FloatingButtonsSettings'

interface GeneralSettings {
    siteName: string
    siteDescription: string
    siteLogo: string
    siteLogoLight: string
    siteFavicon: string
    // Email toggle settings
    emailBookingConfirmation: boolean
    emailBookingPending: boolean
    emailPasswordReset: boolean
    emailBookingCancelled: boolean
    emailCheckinReminder: boolean
    // SMTP configuration
    smtpHost: string
    smtpPort: string
    smtpUser: string
    smtpPass: string
    smtpFrom: string
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [uploadingLogoLight, setUploadingLogoLight] = useState(false)
    const [uploadingFavicon, setUploadingFavicon] = useState(false)

    // Media Picker states
    const [showLogoPicker, setShowLogoPicker] = useState(false)
    const [showLogoLightPicker, setShowLogoLightPicker] = useState(false)
    const [showFaviconPicker, setShowFaviconPicker] = useState(false)

    const logoInputRef = useRef<HTMLInputElement>(null)
    const logoLightInputRef = useRef<HTMLInputElement>(null)
    const faviconInputRef = useRef<HTMLInputElement>(null)

    const [settings, setSettings] = useState<GeneralSettings>({
        siteName: 'Nerd Society',
        siteDescription: 'Không gian học tập & làm việc dành riêng cho Gen Z',
        siteLogo: '',
        siteLogoLight: '',
        siteFavicon: '',
        // Email defaults - all enabled
        emailBookingConfirmation: true,
        emailBookingPending: true,
        emailPasswordReset: true,
        emailBookingCancelled: true,
        emailCheckinReminder: true,
        // SMTP defaults
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
        smtpFrom: '',
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            const data = await res.json()
            if (res.ok && Object.keys(data).length > 0) {
                // Convert string booleans to actual booleans
                const booleanKeys = ['emailBookingConfirmation', 'emailBookingPending', 'emailPasswordReset', 'emailBookingCancelled', 'emailCheckinReminder']
                const processedData = { ...data }
                booleanKeys.forEach(key => {
                    if (key in processedData) {
                        processedData[key] = processedData[key] === true || processedData[key] === 'true'
                    }
                })
                // Merge with defaults to ensure all keys exist
                setSettings(prev => ({ ...prev, ...processedData }))
            }
        } catch (error) {
            console.error('Failed to load settings', error)
            toast.error('Không thể tải cấu hình')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (key: keyof GeneralSettings, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: keyof GeneralSettings, setLoadingState: (v: boolean) => void) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setLoadingState(true)
        try {
            const formData = new FormData()
            formData.append('files', files[0])

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            if (res.ok && data.url) {
                handleChange(key, data.url)
                toast.success('Đã upload ảnh!')
            } else {
                toast.error(data.error || 'Lỗi khi upload ảnh')
            }
        } catch (error) {
            toast.error('Lỗi khi upload ảnh!')
        } finally {
            setLoadingState(false)
            // Reset input
            if (e.target) e.target.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })

            if (!res.ok) throw new Error('Failed to save')

            toast.success('Đã lưu cấu hình!')
        } catch (error) {
            toast.error('Lỗi khi lưu!')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="animate-pulse text-lg text-neutral-500 dark:text-neutral-400">Đang tải cấu hình...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Cấu hình chung</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Quản lý thông tin cơ bản, Logo và Favicon</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* GENERAL INFO CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                            <GlobeAltIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Thông tin Website</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Tên và mô tả hiển thị trên SEO</p>
                        </div>
                    </div>

                    <div className="grid gap-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tên Website (Site Name)
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={e => handleChange('siteName', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Nerd Society"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Mô tả ngắn (Meta Description)
                            </label>
                            <textarea
                                rows={3}
                                value={settings.siteDescription}
                                onChange={e => handleChange('siteDescription', e.target.value)}
                                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Nhập mô tả cho SEO..."
                            />
                        </div>
                    </div>
                </div>

                {/* BRANDING CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                            <PhotoIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Hình ảnh thương hiệu</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Logo và Favicon</p>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* LOGO UPLOAD */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Logo Website
                            </label>
                            <div className="flex flex-col gap-4">
                                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                                    {settings.siteLogo ? (
                                        <div className="relative size-full p-4">
                                            <Image
                                                src={settings.siteLogo}
                                                alt="Site Logo"
                                                fill
                                                className="object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleChange('siteLogo', '')}
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600 z-10"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-neutral-400">
                                            <PhotoIcon className="size-8" />
                                            <span className="mt-2 text-xs">Chưa có Logo</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'siteLogo', setUploadingLogo)}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        loading={uploadingLogo}
                                        disabled={uploadingLogo}
                                        className="flex-1 py-1 text-sm"
                                        outline
                                    >
                                        <CloudArrowUpIcon className="mr-2 size-4" />
                                        Tải lên
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowLogoPicker(true)}
                                        className="py-1 text-sm"
                                        outline
                                    >
                                        <FolderOpenIcon className="size-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-neutral-500">
                                    Dùng cho nền sáng (Header). PNG trong suốt, tối thiểu 150px
                                </p>
                            </div>
                        </div>

                        {/* LOGO LIGHT UPLOAD (for dark backgrounds) */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Logo sáng (cho nền tối)
                            </label>
                            <div className="flex flex-col gap-4">
                                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-800 dark:border-neutral-700">
                                    {settings.siteLogoLight ? (
                                        <div className="relative size-full p-4">
                                            <Image
                                                src={settings.siteLogoLight}
                                                alt="Site Logo Light"
                                                fill
                                                className="object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleChange('siteLogoLight', '')}
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600 z-10"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-neutral-400">
                                            <PhotoIcon className="size-8" />
                                            <span className="mt-2 text-xs">Chưa có Logo sáng</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        ref={logoLightInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'siteLogoLight', setUploadingLogoLight)}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => logoLightInputRef.current?.click()}
                                        loading={uploadingLogoLight}
                                        disabled={uploadingLogoLight}
                                        className="flex-1 py-1 text-sm"
                                        outline
                                    >
                                        <CloudArrowUpIcon className="mr-2 size-4" />
                                        Tải lên
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowLogoLightPicker(true)}
                                        className="py-1 text-sm"
                                        outline
                                    >
                                        <FolderOpenIcon className="size-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-neutral-500">
                                    Dùng cho nền tối (Footer). PNG trong suốt màu sáng
                                </p>
                            </div>
                        </div>

                        {/* FAVICON UPLOAD */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Favicon (Icon tab)
                            </label>
                            <div className="flex flex-col gap-4">
                                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                                    {settings.siteFavicon ? (
                                        <div className="relative size-full p-4 flex items-center justify-center">
                                            <div className="relative size-16">
                                                <Image
                                                    src={settings.siteFavicon}
                                                    alt="Favicon"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleChange('siteFavicon', '')}
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600 z-10"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-neutral-400">
                                            <PhotoIcon className="size-8" />
                                            <span className="mt-2 text-xs">Chưa có Favicon</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        ref={faviconInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'siteFavicon', setUploadingFavicon)}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => faviconInputRef.current?.click()}
                                        loading={uploadingFavicon}
                                        disabled={uploadingFavicon}
                                        className="flex-1 py-1 text-sm"
                                        outline
                                    >
                                        <CloudArrowUpIcon className="mr-2 size-4" />
                                        Tải lên
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowFaviconPicker(true)}
                                        className="py-1 text-sm"
                                        outline
                                    >
                                        <FolderOpenIcon className="size-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-neutral-500">
                                    Khuyên dùng: PNG/ICO vuông, 32x32 hoặc 64x64
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SMTP CONFIGURATION CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                            <Cog6ToothIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Cấu hình SMTP</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Thông tin máy chủ gửi email</p>
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                SMTP Host
                            </label>
                            <input
                                type="text"
                                value={settings.smtpHost}
                                onChange={e => handleChange('smtpHost', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="smtp.gmail.com"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Port
                            </label>
                            <input
                                type="text"
                                value={settings.smtpPort}
                                onChange={e => handleChange('smtpPort', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="587"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Email đăng nhập
                            </label>
                            <input
                                type="email"
                                value={settings.smtpUser}
                                onChange={e => handleChange('smtpUser', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="your-email@gmail.com"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Mật khẩu ứng dụng
                            </label>
                            <input
                                type="password"
                                value={settings.smtpPass}
                                onChange={e => handleChange('smtpPass', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="••••••••••••"
                            />
                            <p className="mt-1 text-xs text-neutral-500">
                                Gmail: Dùng App Password, không phải mật khẩu tài khoản
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Email người gửi (From)
                            </label>
                            <input
                                type="text"
                                value={settings.smtpFrom}
                                onChange={e => handleChange('smtpFrom', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder='"Nerd Society" <no-reply@nerdsociety.com.vn>'
                            />
                            <p className="mt-1 text-xs text-neutral-500">
                                Định dạng: "Tên hiển thị" &lt;email@domain.com&gt;
                            </p>
                        </div>
                    </div>
                </div>

                {/* EMAIL SETTINGS CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <EnvelopeIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Cài đặt Email</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Bật/tắt từng loại email gửi đi</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Booking Confirmation */}
                        <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Xác nhận đặt lịch (đã cọc)</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Gửi khi booking được xác nhận</p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.emailBookingConfirmation}
                                    onChange={(e) => handleChange('emailBookingConfirmation', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full dark:bg-neutral-600"></div>
                            </label>
                        </div>

                        {/* Booking Pending */}
                        <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Tiếp nhận đặt lịch (chờ cọc)</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Gửi khi tạo booking mới</p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.emailBookingPending}
                                    onChange={(e) => handleChange('emailBookingPending', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full dark:bg-neutral-600"></div>
                            </label>
                        </div>

                        {/* Password Reset */}
                        <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Đặt lại mật khẩu</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Gửi khi user yêu cầu reset password</p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.emailPasswordReset}
                                    onChange={(e) => handleChange('emailPasswordReset', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full dark:bg-neutral-600"></div>
                            </label>
                        </div>

                        {/* Booking Cancelled */}
                        <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Hủy đặt lịch</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Gửi khi booking bị hủy</p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.emailBookingCancelled}
                                    onChange={(e) => handleChange('emailBookingCancelled', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full dark:bg-neutral-600"></div>
                            </label>
                        </div>

                        {/* Check-in Reminder */}
                        <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Nhắc check-in</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Gửi 1 giờ trước giờ check-in</p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.emailCheckinReminder}
                                    onChange={(e) => handleChange('emailCheckinReminder', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full dark:bg-neutral-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* FLOATING BUTTONS CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                            <CursorArrowRippleIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Nút liên hệ nổi</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Quản lý các nút liên hệ hiển thị trên trang chủ</p>
                        </div>
                    </div>

                    <FloatingButtonsSettings />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        loading={saving}
                        disabled={saving}
                        className="px-6"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                    </Button>
                </div>
            </form>

            {/* Media Pickers */}
            <MediaPickerModal
                isOpen={showLogoPicker}
                onClose={() => setShowLogoPicker(false)}
                onSelect={(urls) => {
                    if (urls.length > 0) handleChange('siteLogo', urls[0])
                }}
            />
            <MediaPickerModal
                isOpen={showLogoLightPicker}
                onClose={() => setShowLogoLightPicker(false)}
                onSelect={(urls) => {
                    if (urls.length > 0) handleChange('siteLogoLight', urls[0])
                }}
            />
            <MediaPickerModal
                isOpen={showFaviconPicker}
                onClose={() => setShowFaviconPicker(false)}
                onSelect={(urls) => {
                    if (urls.length > 0) handleChange('siteFavicon', urls[0])
                }}
            />
        </div>
    )
}
