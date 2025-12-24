'use client'

import { Button } from '@/shared/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewComboPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [features, setFeatures] = useState<string[]>([''])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            duration: formData.get('duration'),
            price: formData.get('price'),
            description: formData.get('description'),
            features: features.filter(f => f.trim() !== ''),
            isPopular: formData.get('isPopular') === 'on',
            isActive: formData.get('isActive') === 'on',
        }

        try {
            const res = await fetch('/api/admin/combos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                router.push('/admin/combos')
                router.refresh()
            } else {
                alert('Lỗi tạo combo')
            }
        } catch (error) {
            console.error(error)
            alert('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    const addFeature = () => setFeatures([...features, ''])
    const updateFeature = (idx: number, val: string) => {
        const newFeatures = [...features]
        newFeatures[idx] = val
        setFeatures(newFeatures)
    }

    return (
        <div className="max-w-2xl bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-900">
            <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Thêm Combo mới</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tên Combo</label>
                    <input name="name" required className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Thời lượng (phút)</label>
                        <input type="number" name="duration" required className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Giá (VND)</label>
                        <input type="number" name="price" required className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mô tả ngắn</label>
                    <textarea name="description" required rows={3} className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tính năng nổi bật</label>
                    {features.map((feature, idx) => (
                        <div key={idx} className="mb-2 flex gap-2">
                            <input
                                value={feature}
                                onChange={(e) => updateFeature(idx, e.target.value)}
                                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                                placeholder={`Tính năng ${idx + 1}`}
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addFeature} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Thêm dòng</button>
                </div>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="isPopular" className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Phổ biến (Hot)</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="isActive" defaultChecked className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Hoạt động</span>
                    </label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Button type="submit" disabled={loading}>{loading ? 'Đang lưu...' : 'Tạo Combo'}</Button>
                    <Button type="button" outline onClick={() => router.back()}>Hủy</Button>
                </div>
            </form>
        </div>
    )
}
