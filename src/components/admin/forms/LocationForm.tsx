'use client'

import { Button } from '@/shared/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LocationFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export default function LocationForm({ onSuccess, onCancel }: LocationFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            mapUrl: formData.get('mapUrl'),
            isActive: formData.get('isActive') === 'on',
        }

        try {
            const res = await fetch('/api/admin/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                router.refresh()
                onSuccess?.()
            } else {
                alert('Lỗi tạo cơ sở')
            }
        } catch (error) {
            console.error(error)
            alert('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tên Cơ sở</label>
                <input name="name" required className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700" />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Địa chỉ</label>
                <input name="address" required className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Hotline</label>
                    <input name="phone" required className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Google Maps URL (Optional)</label>
                    <input name="mapUrl" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700" />
                </div>
            </div>

            <div>
                <label className="flex items-center gap-2">
                    <input type="checkbox" name="isActive" defaultChecked className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Hoạt động</span>
                </label>
            </div>

            <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>{loading ? 'Đang lưu...' : 'Tạo Cơ sở'}</Button>
                <Button type="button" outline onClick={onCancel}>Hủy</Button>
            </div>
        </form>
    )
}
