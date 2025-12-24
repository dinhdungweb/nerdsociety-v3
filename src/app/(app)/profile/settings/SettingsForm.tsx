'use client'

import { useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import { CameraIcon, CheckIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import BirthdayDatePicker from '@/components/BirthdayDatePicker'


interface User {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    avatar: string | null
    gender: string | null
    dateOfBirth: Date | string | null
    address: string | null
    bio: string | null
}

interface SettingsFormProps {
    user: User
}

const genderOptions = [
    { value: 'Male', label: 'Nam' },
    { value: 'Female', label: 'Nữ' },
    { value: 'Other', label: 'Khác' },
]

export default function SettingsForm({ user }: SettingsFormProps) {
    const { update } = useSession()
    const [isPending, startTransition] = useTransition()
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar)
    const [showGenderDropdown, setShowGenderDropdown] = useState(false)
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
        user.dateOfBirth ? new Date(user.dateOfBirth) : null
    )
    const [formData, setFormData] = useState({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || 'Male',
        address: user.address || '',
        bio: user.bio || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleGenderSelect = (value: string) => {
        setFormData({ ...formData, gender: value })
        setShowGenderDropdown(false)
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload
        const uploadData = new FormData()
        uploadData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            })
            const data = await res.json()
            if (data.url) {
                setAvatarPreview(data.url)
                toast.success('Đã tải ảnh lên thành công!')
            }
        } catch (error) {
            toast.error('Lỗi khi tải ảnh lên')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            try {
                const res = await fetch('/api/auth/update-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        dateOfBirth: dateOfBirth?.toISOString().split('T')[0] || null,
                        avatar: avatarPreview,
                    }),
                })

                if (res.ok) {
                    await update({ name: formData.name })
                    toast.success('Cập nhật thông tin thành công!')
                } else {
                    toast.error('Có lỗi xảy ra khi cập nhật')
                }
            } catch (error) {
                toast.error('Có lỗi xảy ra khi cập nhật')
            }
        })
    }

    const selectedGender = genderOptions.find(g => g.value === formData.gender)

    return (
        <div className="mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Cài đặt tài khoản
                </h1>
                <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                    Cập nhật thông tin cá nhân của bạn
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="relative">
                        <div className="size-24 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="size-full object-cover" />
                            ) : (
                                <UserCircleIcon className="size-full text-neutral-300 dark:text-neutral-600" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-transform hover:scale-110">
                            <CameraIcon className="size-4" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">Ảnh đại diện</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            JPG, PNG hoặc GIF. Tối đa 2MB.
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    {/* Name & Phone */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                placeholder="Nhập họ và tên"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                    </div>

                    {/* Email (Disabled) */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email || ''}
                            disabled
                            className="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                        />
                        <p className="mt-1 text-xs text-neutral-400">Email không thể thay đổi</p>
                    </div>

                    {/* Gender & DOB */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Gender Dropdown */}
                        <div className="relative">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Giới tính
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                                className="flex w-full items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 py-3 text-left text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                            >
                                <span className="flex items-center gap-2">
                                    <span>{selectedGender?.label}</span>
                                </span>
                                <ChevronDownIcon className={`size-5 text-neutral-400 transition-transform ${showGenderDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showGenderDropdown && (
                                <div className="absolute z-10 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                                    {genderOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleGenderSelect(option.value)}
                                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 ${option.value === formData.gender
                                                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                                : 'text-neutral-700 dark:text-neutral-300'
                                                } first:rounded-t-xl last:rounded-b-xl`}
                                        >
                                            <span className="font-medium">{option.label}</span>
                                            {option.value === formData.gender && (
                                                <CheckIcon className="ml-auto size-5 text-primary-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date of Birth - DatePicker */}
                        <BirthdayDatePicker
                            value={dateOfBirth}
                            onChange={(date) => setDateOfBirth(date)}
                            label="Ngày sinh"
                            placeholder="Chọn ngày sinh"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                            placeholder="Nhập địa chỉ"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Giới thiệu bản thân
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                            placeholder="Viết vài dòng về bản thân..."
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-4 font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    {isPending ? (
                        <>
                            <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <CheckIcon className="size-5" />
                            Lưu thay đổi
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
