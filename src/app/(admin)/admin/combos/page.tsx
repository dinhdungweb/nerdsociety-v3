import { prisma } from '@/lib/prisma'
import AddComboWrapper from '@/components/admin/AddComboWrapper'
import ComboCard from '@/components/admin/ComboCard'

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic'

async function getCombos() {
    return prisma.combo.findMany({
        orderBy: { sortOrder: 'asc' },
    })
}

export default async function CombosPage() {
    const combos = await getCombos()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý Combo</h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Quản lý các gói dịch vụ hiển thị trên trang chủ
                    </p>
                </div>
                <AddComboWrapper />
            </div>

            {/* Combos Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {combos.map((combo) => (
                    <ComboCard key={combo.id} combo={combo} />
                ))}
            </div>
        </div>
    )
}
