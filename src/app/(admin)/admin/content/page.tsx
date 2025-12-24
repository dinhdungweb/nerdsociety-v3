'use client'

import { Button } from '@/shared/Button'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import {
    PhotoIcon,
    TrashIcon,
    CloudArrowUpIcon,
    DocumentTextIcon,
    NewspaperIcon,
    SparklesIcon,
    FolderOpenIcon,
    PlusIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    PhoneIcon,
} from '@heroicons/react/24/outline'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import { usePermissions } from '@/contexts/PermissionsContext'

// Feature interface
interface AboutFeature {
    icon: string
    title: string
    description: string
}

// Available icons for selection
const availableIcons = [
    { value: 'BookOpenIcon', label: 'Sách' },
    { value: 'CoffeeIcon', label: 'Cafe' },
    { value: 'WifiIcon', label: 'Wifi' },
    { value: 'BoltIcon', label: 'Điện' },
    { value: 'SparklesIcon', label: 'Máy lạnh' },
    { value: 'PresentationChartBarIcon', label: 'Phòng họp' },
]

interface Settings {
    heroTitle: string
    heroSubtitle: string
    heroCta: string
    heroCtaSecondary: string
    heroBadge: string
    heroBackgroundImage: string
    // Hero Stats (JSON)
    heroStats: string
    // Hero Feature Pills (JSON)
    heroFeatures: string
    aboutTitle: string
    aboutContent: string
    aboutFeatures: string // JSON string
    // Carousel News Settings
    newsTitle: string
    newsSubtitle: string
    newsLimit: string
    newsAutoplay: string
    newsAutoplayDelay: string
    newsShowNavigation: string
    // Contact Section
    contactTitle: string
    contactSubtitle: string
    contactEmail: string
    contactPhone: string
    contactWebsite: string
    contactCtaTitle: string
    contactCtaSubtitle: string
    contactCtaButton: string
    contactCtaLink: string
    // Booking Banner
    bookingBannerEnabled: string
    bookingBannerImage: string
    bookingBannerTitle: string
    bookingBannerSubtitle: string
    bookingBannerCtaText: string
    bookingBannerCtaLink: string
}

// Default features
const defaultFeatures: AboutFeature[] = [
    { icon: 'BookOpenIcon', title: 'Không gian yên tĩnh', description: 'Môi trường lý tưởng để tập trung học tập và làm việc' },
    { icon: 'CoffeeIcon', title: 'Đồ uống miễn phí', description: 'Cafe đen, trà túi lọc không giới hạn suốt thời gian sử dụng' },
    { icon: 'WifiIcon', title: 'Wifi tốc độ cao', description: 'Kết nối internet ổn định, tốc độ cao cho mọi nhu cầu' },
    { icon: 'BoltIcon', title: 'Ổ cắm điện', description: 'Ổ cắm điện tiện lợi tại mọi vị trí ngồi' },
    { icon: 'SparklesIcon', title: 'Máy lạnh', description: 'Không gian mát mẻ, thoải mái quanh năm' },
    { icon: 'PresentationChartBarIcon', title: 'Phòng họp riêng', description: 'Phòng họp có máy chiếu, bảng trắng cho nhóm 2-12 người' },
]

// Hero Stats interface
interface HeroStat {
    value: string
    label: string
}

// Hero Feature Pill interface  
interface HeroFeaturePill {
    icon: string
    text: string
}

// Available icons for hero features
const heroFeatureIcons = [
    { value: 'WifiIcon', label: 'Wifi' },
    { value: 'CoffeeIcon', label: 'Cafe' },
    { value: 'ClockIcon', label: 'Đồng hồ' },
    { value: 'BoltIcon', label: 'Điện' },
    { value: 'SparklesIcon', label: 'Tiện ích' },
]

// Default hero stats
const defaultHeroStats: HeroStat[] = [
    { value: '2', label: 'Cơ sở' },
    { value: '24/7', label: 'Hoạt động' },
    { value: '∞', label: 'Cafe miễn phí' },
]

// Default hero feature pills
const defaultHeroFeaturePills: HeroFeaturePill[] = [
    { icon: 'WifiIcon', text: 'Wifi siêu tốc' },
    { icon: 'CoffeeIcon', text: 'Cafe miễn phí' },
    { icon: 'ClockIcon', text: '24/7' },
]

// Hero Floating Card interface
interface HeroFloatingCard {
    icon: string
    title: string
    subtitle: string
}

// Available icons for floating cards
const floatingCardIcons = [
    { value: 'CoffeeIcon', label: 'Cafe' },
    { value: 'WifiIcon', label: 'Wifi' },
    { value: 'BookOpenIcon', label: 'Sách' },
    { value: 'ClockIcon', label: 'Đồng hồ' },
    { value: 'BoltIcon', label: 'Điện' },
    { value: 'SparklesIcon', label: 'Tiện ích' },
]

// Default floating cards
const defaultFloatingCards: HeroFloatingCard[] = [
    { icon: 'CoffeeIcon', title: 'Cafe miễn phí', subtitle: 'Không giới hạn' },
    { icon: 'WifiIcon', title: 'Wifi siêu tốc', subtitle: '100Mbps+' },
    { icon: 'BookOpenIcon', title: 'Học tập hiệu quả', subtitle: 'Không gian yên tĩnh' },
]

export default function AdminContentPage() {
    const { permissions } = usePermissions()
    const canManage = permissions.canManageContent
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [showMediaPicker, setShowMediaPicker] = useState(false)
    const [showBannerMediaPicker, setShowBannerMediaPicker] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [features, setFeatures] = useState<AboutFeature[]>(defaultFeatures)
    const [heroStats, setHeroStats] = useState<HeroStat[]>(defaultHeroStats)
    const [heroFeaturePills, setHeroFeaturePills] = useState<HeroFeaturePill[]>(defaultHeroFeaturePills)
    const [heroFloatingCards, setHeroFloatingCards] = useState<HeroFloatingCard[]>(defaultFloatingCards)
    const [settings, setSettings] = useState<Settings>({
        heroTitle: 'Nerd Society',
        heroSubtitle: 'Cộng đồng học tập năng động tại Hà Nội. Không gian làm việc chung, học nhóm lý tưởng với đầy đủ tiện nghi và đồ uống miễn phí!',
        heroCta: 'Đặt lịch ngay',
        heroCtaSecondary: 'Xem các combo',
        heroBadge: 'Không gian học tập dành cho Gen Z',
        heroBackgroundImage: '',
        heroStats: JSON.stringify([
            { value: '2', label: 'Cơ sở' },
            { value: '24/7', label: 'Hoạt động' },
            { value: '∞', label: 'Cafe miễn phí' },
        ]),
        heroFeatures: JSON.stringify([
            { icon: 'WifiIcon', text: 'Wifi siêu tốc' },
            { icon: 'CoffeeIcon', text: 'Cafe miễn phí' },
            { icon: 'ClockIcon', text: '24/7' },
        ]),
        aboutTitle: 'Câu chuyện của Nerd',
        aboutContent: 'Chúng mình tin rằng một không gian tốt sẽ khơi nguồn cảm hứng vô tận. Tại Nerd Society, mỗi góc nhỏ đều được chăm chút để bạn có thể tập trung tối đa.',
        aboutFeatures: JSON.stringify(defaultFeatures),
        // Carousel defaults
        newsTitle: 'Tin tức & Sự kiện',
        newsSubtitle: 'Cập nhật những hoạt động mới nhất từ Nerd Society',
        newsLimit: '6',
        newsAutoplay: 'true',
        newsAutoplayDelay: '5000',
        newsShowNavigation: 'true',
        // Contact Section defaults
        contactTitle: 'Sẵn sàng trải nghiệm?',
        contactSubtitle: 'Nerd xin chúc bạn có 1 ngày học tập, làm việc vui vẻ và hiệu quả! Đặt lịch ngay để có chỗ ngồi ưng ý nhất.',
        contactEmail: 'nerd.society98@gmail.com',
        contactPhone: '036 848 3689',
        contactWebsite: 'nerdsociety.com.vn',
        contactCtaTitle: 'Đặt lịch ngay hôm nay!',
        contactCtaSubtitle: 'Chỉ mất 30 giây để đặt chỗ',
        contactCtaButton: 'Đặt lịch ngay',
        contactCtaLink: '/booking',
        // Booking Banner defaults
        bookingBannerEnabled: 'true',
        bookingBannerImage: '',
        bookingBannerTitle: 'Ưu đãi đặc biệt',
        bookingBannerSubtitle: 'Đặt pod từ 2 tiếng - Nhận ngay 50 Nerd Coin!',
        bookingBannerCtaText: 'Đặt ngay',
        bookingBannerCtaLink: '#booking-form',
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            const data = await res.json()
            if (res.ok && Object.keys(data).length > 0) {
                setSettings(prev => ({ ...prev, ...data }))
                // Parse aboutFeatures if exists
                if (data.aboutFeatures) {
                    try {
                        const parsedFeatures = JSON.parse(data.aboutFeatures)
                        if (Array.isArray(parsedFeatures)) {
                            setFeatures(parsedFeatures)
                        }
                    } catch (e) {
                        console.error('Error parsing aboutFeatures:', e)
                    }
                }
                // Parse heroStats if exists
                if (data.heroStats) {
                    try {
                        const parsedStats = JSON.parse(data.heroStats)
                        if (Array.isArray(parsedStats)) {
                            setHeroStats(parsedStats)
                        }
                    } catch (e) {
                        console.error('Error parsing heroStats:', e)
                    }
                }
                // Parse heroFeatures if exists
                if (data.heroFeatures) {
                    try {
                        const parsedHeroFeatures = JSON.parse(data.heroFeatures)
                        if (Array.isArray(parsedHeroFeatures)) {
                            setHeroFeaturePills(parsedHeroFeatures)
                        }
                    } catch (e) {
                        console.error('Error parsing heroFeatures:', e)
                    }
                }
                // Parse heroFloatingCards if exists
                if (data.heroFloatingCards) {
                    try {
                        const parsedFloatingCards = JSON.parse(data.heroFloatingCards)
                        if (Array.isArray(parsedFloatingCards)) {
                            setHeroFloatingCards(parsedFloatingCards)
                        }
                    } catch (e) {
                        console.error('Error parsing heroFloatingCards:', e)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load settings', error)
            toast.error('Không thể tải cấu hình')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (key: keyof Settings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    // Features CRUD handlers
    const addFeature = () => {
        setFeatures(prev => [...prev, { icon: 'BookOpenIcon', title: '', description: '' }])
    }

    const updateFeature = (index: number, field: keyof AboutFeature, value: string) => {
        setFeatures(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f))
    }

    const removeFeature = (index: number) => {
        setFeatures(prev => prev.filter((_, i) => i !== index))
    }

    const moveFeature = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= features.length) return
        const newFeatures = [...features]
            ;[newFeatures[index], newFeatures[newIndex]] = [newFeatures[newIndex], newFeatures[index]]
        setFeatures(newFeatures)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploadingImage(true)
        try {
            const formData = new FormData()
            formData.append('files', files[0])

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            if (res.ok && data.url) {
                handleChange('heroBackgroundImage', data.url)
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
        handleChange('heroBackgroundImage', '')
    }

    // Hero Stats CRUD handlers
    const addHeroStat = () => {
        setHeroStats(prev => [...prev, { value: '', label: '' }])
    }

    const updateHeroStat = (index: number, field: keyof HeroStat, value: string) => {
        setHeroStats(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
    }

    const removeHeroStat = (index: number) => {
        setHeroStats(prev => prev.filter((_, i) => i !== index))
    }

    // Hero Feature Pills CRUD handlers
    const addHeroFeaturePill = () => {
        setHeroFeaturePills(prev => [...prev, { icon: 'WifiIcon', text: '' }])
    }

    const updateHeroFeaturePill = (index: number, field: keyof HeroFeaturePill, value: string) => {
        setHeroFeaturePills(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f))
    }

    const removeHeroFeaturePill = (index: number) => {
        setHeroFeaturePills(prev => prev.filter((_, i) => i !== index))
    }

    // Hero Floating Cards CRUD handlers
    const addHeroFloatingCard = () => {
        if (heroFloatingCards.length >= 3) {
            toast.error('Tối đa 3 floating cards')
            return
        }
        setHeroFloatingCards(prev => [...prev, { icon: 'CoffeeIcon', title: '', subtitle: '' }])
    }

    const updateHeroFloatingCard = (index: number, field: keyof HeroFloatingCard, value: string) => {
        setHeroFloatingCards(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
    }

    const removeHeroFloatingCard = (index: number) => {
        setHeroFloatingCards(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Include all dynamic data in settings
            const dataToSave = {
                ...settings,
                aboutFeatures: JSON.stringify(features),
                heroStats: JSON.stringify(heroStats),
                heroFeatures: JSON.stringify(heroFeaturePills),
                heroFloatingCards: JSON.stringify(heroFloatingCards),
            }
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave),
            })

            if (!res.ok) throw new Error('Failed to save')

            toast.success('Đã lưu thay đổi!')
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
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý nội dung</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Chỉnh sửa nội dung hiển thị trên trang chủ</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* HERO SECTION CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                            <SparklesIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Hero Section</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Phần đầu trang chủ</p>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {/* Title */}
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tiêu đề chính
                            </label>
                            <input
                                type="text"
                                value={settings.heroTitle}
                                onChange={e => handleChange('heroTitle', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Nhập tiêu đề..."
                            />
                        </div>

                        {/* Subtitle */}
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Mô tả phụ
                            </label>
                            <textarea
                                rows={3}
                                value={settings.heroSubtitle}
                                onChange={e => handleChange('heroSubtitle', e.target.value)}
                                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Nhập mô tả..."
                            />
                        </div>

                        {/* CTA Button */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Nút hành động (CTA)
                            </label>
                            <input
                                type="text"
                                value={settings.heroCta}
                                onChange={e => handleChange('heroCta', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Đặt lịch ngay"
                            />
                        </div>

                        {/* Secondary CTA Button */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Nút phụ
                            </label>
                            <input
                                type="text"
                                value={settings.heroCtaSecondary}
                                onChange={e => handleChange('heroCtaSecondary', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Xem các combo"
                            />
                        </div>

                        {/* Badge Text */}
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Badge text (nhãn nhỏ)
                            </label>
                            <input
                                type="text"
                                value={settings.heroBadge}
                                onChange={e => handleChange('heroBadge', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Không gian học tập dành cho Gen Z"
                            />
                        </div>

                        {/* Hero Feature Pills */}
                        <div className="lg:col-span-2">
                            <div className="mb-3 flex items-center justify-between">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Feature Pills ({heroFeaturePills.length})
                                </label>
                                <button
                                    type="button"
                                    onClick={addHeroFeaturePill}
                                    className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400"
                                >
                                    <PlusIcon className="size-4" />
                                    Thêm
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {heroFeaturePills.map((pill, index) => (
                                    <div key={index} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-800">
                                        <select
                                            value={pill.icon}
                                            onChange={e => updateHeroFeaturePill(index, 'icon', e.target.value)}
                                            className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                        >
                                            {heroFeatureIcons.map(icon => (
                                                <option key={icon.value} value={icon.value}>{icon.label}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={pill.text}
                                            onChange={e => updateHeroFeaturePill(index, 'text', e.target.value)}
                                            placeholder="Text..."
                                            className="w-24 rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeHeroFeaturePill(index)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <TrashIcon className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero Stats */}
                        <div className="lg:col-span-2">
                            <div className="mb-3 flex items-center justify-between">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Stats ({heroStats.length})
                                </label>
                                <button
                                    type="button"
                                    onClick={addHeroStat}
                                    className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400"
                                >
                                    <PlusIcon className="size-4" />
                                    Thêm
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {heroStats.map((stat, index) => (
                                    <div key={index} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-800">
                                        <input
                                            type="text"
                                            value={stat.value}
                                            onChange={e => updateHeroStat(index, 'value', e.target.value)}
                                            placeholder="Giá trị"
                                            className="w-16 rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={stat.label}
                                            onChange={e => updateHeroStat(index, 'label', e.target.value)}
                                            placeholder="Nhãn"
                                            className="w-24 rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeHeroStat(index)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <TrashIcon className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero Floating Cards */}
                        <div className="lg:col-span-2">
                            <div className="mb-3 flex items-center justify-between">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Floating Cards ({heroFloatingCards.length}/3)
                                </label>
                                <button
                                    type="button"
                                    onClick={addHeroFloatingCard}
                                    disabled={heroFloatingCards.length >= 3}
                                    className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 disabled:opacity-50 dark:bg-primary-900/20 dark:text-primary-400"
                                >
                                    <PlusIcon className="size-4" />
                                    Thêm
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {heroFloatingCards.map((card, index) => (
                                    <div key={index} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-800">
                                        <select
                                            value={card.icon}
                                            onChange={e => updateHeroFloatingCard(index, 'icon', e.target.value)}
                                            className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                        >
                                            {floatingCardIcons.map(icon => (
                                                <option key={icon.value} value={icon.value}>{icon.label}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={card.title}
                                            onChange={e => updateHeroFloatingCard(index, 'title', e.target.value)}
                                            placeholder="Tiêu đề"
                                            className="w-28 rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={card.subtitle}
                                            onChange={e => updateHeroFloatingCard(index, 'subtitle', e.target.value)}
                                            placeholder="Mô tả"
                                            className="w-24 rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeHeroFloatingCard(index)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <TrashIcon className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Background Image Upload */}
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Ảnh nền Hero
                            </label>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                {/* Preview */}
                                <div className="relative h-52 w-full overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 sm:w-64">
                                    {settings.heroBackgroundImage ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={settings.heroBackgroundImage}
                                                alt="Hero background preview"
                                                className="absolute inset-0 size-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex size-full flex-col items-center justify-center text-neutral-400">
                                            <PhotoIcon className="size-10" />
                                            <span className="mt-2 text-xs">Chưa có ảnh nền</span>
                                            <span className="text-xs text-neutral-400">(Dùng ảnh mặc định)</span>
                                        </div>
                                    )}
                                </div>

                                {/* Upload Button */}
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingImage}
                                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                    >
                                        <CloudArrowUpIcon className="size-5" />
                                        {uploadingImage ? 'Đang upload...' : 'Tải lên mới'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaPicker(true)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                    >
                                        <FolderOpenIcon className="size-5" />
                                        Chọn từ thư viện
                                    </button>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Khuyến nghị: 1920x1080px<br />
                                        Định dạng: JPG, PNG, WebP
                                    </p>
                                    <MediaPickerModal
                                        isOpen={showMediaPicker}
                                        onClose={() => setShowMediaPicker(false)}
                                        onSelect={(urls) => {
                                            if (urls.length > 0) {
                                                handleChange('heroBackgroundImage', urls[0])
                                            }
                                        }}
                                        selectedUrls={settings.heroBackgroundImage ? [settings.heroBackgroundImage] : []}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ABOUT SECTION CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <DocumentTextIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">About Section</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Phần giới thiệu</p>
                        </div>
                    </div>

                    <div className="grid gap-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tiêu đề
                            </label>
                            <input
                                type="text"
                                value={settings.aboutTitle}
                                onChange={e => handleChange('aboutTitle', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Câu chuyện của Nerd"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Nội dung
                            </label>
                            <textarea
                                rows={5}
                                value={settings.aboutContent}
                                onChange={e => handleChange('aboutContent', e.target.value)}
                                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Nhập nội dung giới thiệu..."
                            />
                        </div>

                        {/* Features Management */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Các tính năng nổi bật ({features.length})
                                </label>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                                >
                                    <PlusIcon className="size-4" />
                                    Thêm mới
                                </button>
                            </div>
                            <div className="space-y-3">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-xs font-medium text-neutral-500">Card #{index + 1}</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveFeature(index, 'up')}
                                                    disabled={index === 0}
                                                    className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 disabled:opacity-30 dark:hover:bg-neutral-700"
                                                >
                                                    <ChevronUpIcon className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveFeature(index, 'down')}
                                                    disabled={index === features.length - 1}
                                                    className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 disabled:opacity-30 dark:hover:bg-neutral-700"
                                                >
                                                    <ChevronDownIcon className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div>
                                                <label className="mb-1 block text-xs text-neutral-500">Icon</label>
                                                <select
                                                    value={feature.icon}
                                                    onChange={e => updateFeature(index, 'icon', e.target.value)}
                                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                                >
                                                    {availableIcons.map(icon => (
                                                        <option key={icon.value} value={icon.value}>{icon.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="mb-1 block text-xs text-neutral-500">Tiêu đề</label>
                                                <input
                                                    type="text"
                                                    value={feature.title}
                                                    onChange={e => updateFeature(index, 'title', e.target.value)}
                                                    placeholder="VD: Wifi tốc độ cao"
                                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <label className="mb-1 block text-xs text-neutral-500">Mô tả</label>
                                            <input
                                                type="text"
                                                value={feature.description}
                                                onChange={e => updateFeature(index, 'description', e.target.value)}
                                                placeholder="Mô tả ngắn về tính năng..."
                                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* NEWS CAROUSEL SECTION CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <NewspaperIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Tin tức & Sự kiện</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Cấu hình carousel tin tức</p>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {/* Title */}
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tiêu đề section
                            </label>
                            <input
                                type="text"
                                value={settings.newsTitle}
                                onChange={e => handleChange('newsTitle', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Tin tức & Sự kiện"
                            />
                        </div>

                        {/* Subtitle */}
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Mô tả
                            </label>
                            <input
                                type="text"
                                value={settings.newsSubtitle}
                                onChange={e => handleChange('newsSubtitle', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Cập nhật những hoạt động mới nhất..."
                            />
                        </div>

                        {/* News Limit */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Số bài viết hiển thị
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={settings.newsLimit}
                                onChange={e => handleChange('newsLimit', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                            />
                        </div>

                        {/* Autoplay Delay */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Thời gian chuyển slide (ms)
                            </label>
                            <input
                                type="number"
                                min="1000"
                                max="10000"
                                step="500"
                                value={settings.newsAutoplayDelay}
                                onChange={e => handleChange('newsAutoplayDelay', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                            />
                        </div>

                        {/* Autoplay Toggle */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tự động chuyển slide
                            </label>
                            <select
                                value={settings.newsAutoplay}
                                onChange={e => handleChange('newsAutoplay', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                            >
                                <option value="true">Bật</option>
                                <option value="false">Tắt</option>
                            </select>
                        </div>

                        {/* Show Navigation */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Hiển thị nút điều hướng
                            </label>
                            <select
                                value={settings.newsShowNavigation}
                                onChange={e => handleChange('newsShowNavigation', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                            >
                                <option value="true">Bật</option>
                                <option value="false">Tắt</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* CONTACT SECTION CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                            <PhoneIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Contact Section</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Phần liên hệ cuối trang</p>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {/* Title */}
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tiêu đề
                            </label>
                            <input
                                type="text"
                                value={settings.contactTitle}
                                onChange={e => handleChange('contactTitle', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Sẵn sàng trải nghiệm?"
                            />
                        </div>

                        {/* Subtitle */}
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Mô tả
                            </label>
                            <textarea
                                rows={2}
                                value={settings.contactSubtitle}
                                onChange={e => handleChange('contactSubtitle', e.target.value)}
                                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Mô tả ngắn..."
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Email
                            </label>
                            <input
                                type="email"
                                value={settings.contactEmail}
                                onChange={e => handleChange('contactEmail', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="email@example.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Hotline
                            </label>
                            <input
                                type="text"
                                value={settings.contactPhone}
                                onChange={e => handleChange('contactPhone', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="0xx xxx xxxx"
                            />
                        </div>

                        {/* Website */}
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Website
                            </label>
                            <input
                                type="text"
                                value={settings.contactWebsite}
                                onChange={e => handleChange('contactWebsite', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="example.com"
                            />
                        </div>

                        {/* CTA Title */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tiêu đề CTA
                            </label>
                            <input
                                type="text"
                                value={settings.contactCtaTitle}
                                onChange={e => handleChange('contactCtaTitle', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Đặt lịch ngay hôm nay!"
                            />
                        </div>

                        {/* CTA Subtitle */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Mô tả CTA
                            </label>
                            <input
                                type="text"
                                value={settings.contactCtaSubtitle}
                                onChange={e => handleChange('contactCtaSubtitle', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Chỉ mất 30 giây..."
                            />
                        </div>

                        {/* CTA Button */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Text nút CTA
                            </label>
                            <input
                                type="text"
                                value={settings.contactCtaButton}
                                onChange={e => handleChange('contactCtaButton', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="Đặt lịch ngay"
                            />
                        </div>

                        {/* CTA Link */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Link nút CTA
                            </label>
                            <input
                                type="text"
                                value={settings.contactCtaLink}
                                onChange={e => handleChange('contactCtaLink', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                placeholder="/booking"
                            />
                        </div>
                    </div>
                </div>

                {/* BOOKING BANNER CARD */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                                <PhotoIcon className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Booking Banner</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Banner quảng cáo trên trang đặt lịch</p>
                            </div>
                        </div>
                        {/* Toggle */}
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={settings.bookingBannerEnabled === 'true'}
                                onChange={e => handleChange('bookingBannerEnabled', e.target.checked ? 'true' : 'false')}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-neutral-600 dark:bg-neutral-700"></div>
                        </label>
                    </div>

                    {settings.bookingBannerEnabled === 'true' && (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {/* Banner Image */}
                            <div className="lg:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Ảnh banner
                                </label>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                    {/* Preview */}
                                    <div className="relative h-32 w-full overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 sm:w-80">
                                        {settings.bookingBannerImage ? (
                                            <>
                                                <img
                                                    src={settings.bookingBannerImage}
                                                    alt="Banner preview"
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleChange('bookingBannerImage', '')}
                                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
                                                <PhotoIcon className="size-8" />
                                                <span className="text-xs">Chưa có ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Actions */}
                                    <div className="flex flex-1 flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={settings.bookingBannerImage}
                                                onChange={e => handleChange('bookingBannerImage', e.target.value)}
                                                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                                placeholder="Nhập URL ảnh..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowBannerMediaPicker(true)}
                                                className="flex shrink-0 items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                                            >
                                                <FolderOpenIcon className="size-4" />
                                                Chọn ảnh
                                            </button>
                                        </div>
                                        <p className="text-xs text-neutral-500">Kích thước đề nghị: 1200x300px</p>
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    value={settings.bookingBannerTitle}
                                    onChange={e => handleChange('bookingBannerTitle', e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                    placeholder="Ưu đãi đặc biệt"
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Mô tả
                                </label>
                                <input
                                    type="text"
                                    value={settings.bookingBannerSubtitle}
                                    onChange={e => handleChange('bookingBannerSubtitle', e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                    placeholder="Đặt pod từ 2 tiếng..."
                                />
                            </div>

                            {/* CTA Text */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Text nút CTA
                                </label>
                                <input
                                    type="text"
                                    value={settings.bookingBannerCtaText}
                                    onChange={e => handleChange('bookingBannerCtaText', e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                    placeholder="Đặt ngay"
                                />
                            </div>

                            {/* CTA Link */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Link nút CTA
                                </label>
                                <input
                                    type="text"
                                    value={settings.bookingBannerCtaLink}
                                    onChange={e => handleChange('bookingBannerCtaLink', e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                                    placeholder="#booking-form"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button - Only show if has canManageContent */}
                {canManage && (
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            loading={saving}
                            disabled={saving}
                            className="px-6"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                )}
            </form>

            {/* Media Picker Modal for Booking Banner */}
            <MediaPickerModal
                isOpen={showBannerMediaPicker}
                onClose={() => setShowBannerMediaPicker(false)}
                onSelect={(urls: string[]) => {
                    if (urls.length > 0) {
                        handleChange('bookingBannerImage', urls[0])
                    }
                    setShowBannerMediaPicker(false)
                }}
            />
        </div>
    )
}
