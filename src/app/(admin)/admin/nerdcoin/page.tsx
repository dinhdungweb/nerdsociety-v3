'use client'

import { useState, useEffect } from 'react'
import {
    SparklesIcon,
    UserGroupIcon,
    TrophyIcon,
    PlusIcon,
    MinusIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import NcModal from '@/shared/NcModal'
import { Button } from '@/shared/Button'
import toast from 'react-hot-toast'
import { usePermissions } from '@/contexts/PermissionsContext'

interface Customer {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
    nerdCoinBalance: number
    nerdCoinTier: string
    _count: { bookings: number }
    createdAt: string
}

interface Transaction {
    id: string
    amount: number
    type: string
    description: string | null
    createdAt: string
}

interface Stats {
    totalCoins: number
    avgCoins: number
    tierCounts: Record<string, number>
}

const tierColors: Record<string, { bg: string; text: string; icon: string }> = {
    BRONZE: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: '🥉' },
    SILVER: { bg: 'bg-neutral-100 dark:bg-neutral-700', text: 'text-neutral-600 dark:text-neutral-300', icon: '🥈' },
    GOLD: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: '🥇' },
}

const txnTypeLabels: Record<string, { label: string; color: string }> = {
    EARN: { label: 'Nhận từ booking', color: 'text-emerald-600' },
    REDEEM: { label: 'Đổi ưu đãi', color: 'text-red-600' },
    BONUS: { label: 'Thưởng đặc biệt', color: 'text-purple-600' },
    EXPIRED: { label: 'Hết hạn', color: 'text-neutral-500' },
    ADJUSTMENT: { label: 'Admin điều chỉnh', color: 'text-blue-600' },
}

export default function NerdCoinPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Modal states
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
    const [adjustAmount, setAdjustAmount] = useState(0)
    const [adjustType, setAdjustType] = useState<'BONUS' | 'ADJUSTMENT'>('BONUS')
    const [adjustDescription, setAdjustDescription] = useState('')
    const [saving, setSaving] = useState(false)

    // Permission check
    const { hasPermission } = usePermissions()
    const canManageNerdCoin = hasPermission('canManageNerdCoin')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/nerdcoin')
            if (res.ok) {
                const data = await res.json()
                setCustomers(data.customers)
                setStats(data.stats)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const openHistoryModal = async (customer: Customer) => {
        setSelectedCustomer(customer)
        setIsModalOpen(true)
        try {
            const res = await fetch(`/api/admin/nerdcoin/${customer.id}`)
            if (res.ok) {
                const data = await res.json()
                setTransactions(data.transactions)
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
        }
    }

    const openAdjustModal = (customer: Customer) => {
        setSelectedCustomer(customer)
        setAdjustAmount(0)
        setAdjustType('BONUS')
        setAdjustDescription('')
        setIsAdjustModalOpen(true)
    }

    const handleAdjust = async () => {
        if (!selectedCustomer || adjustAmount === 0) return
        setSaving(true)
        try {
            const res = await fetch('/api/admin/nerdcoin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedCustomer.id,
                    amount: adjustAmount,
                    type: adjustType,
                    description: adjustDescription || (adjustAmount > 0 ? 'Thưởng Nerd Coin' : 'Trừ Nerd Coin'),
                }),
            })
            if (res.ok) {
                toast.success(`Đã ${adjustAmount > 0 ? 'thêm' : 'trừ'} ${Math.abs(adjustAmount)} coin`)
                setIsAdjustModalOpen(false)
                fetchData()
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra')
        } finally {
            setSaving(false)
        }
    }

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="grid gap-4 sm:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                    ))}
                </div>
                <div className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Nerd Coin</h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Quản lý điểm thưởng khách hàng
                    </p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                                <SparklesIcon className="size-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalCoins.toLocaleString()}</p>
                                <p className="text-sm text-neutral-500">Tổng coin đang lưu hành</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                                <span className="text-lg">🥉</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.tierCounts.BRONZE || 0}</p>
                                <p className="text-sm text-neutral-500">Bronze</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700">
                                <span className="text-lg">🥈</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.tierCounts.SILVER || 0}</p>
                                <p className="text-sm text-neutral-500">Silver</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                                <span className="text-lg">🥇</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.tierCounts.GOLD || 0}</p>
                                <p className="text-sm text-neutral-500">Gold</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Tìm khách hàng..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                </div>
            </div>

            {/* Customers Table - Desktop */}
            <div className="hidden overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:block">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
                            <th className="px-6 py-4">Khách hàng</th>
                            <th className="px-6 py-4">Tier</th>
                            <th className="px-6 py-4 text-right">Nerd Coin</th>
                            <th className="px-6 py-4">Bookings</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {filteredCustomers.map(customer => {
                            const tier = tierColors[customer.nerdCoinTier] || tierColors.BRONZE
                            return (
                                <tr key={customer.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                                                {customer.avatar ? (
                                                    <img src={customer.avatar} alt="" className="size-10 rounded-full object-cover" />
                                                ) : (
                                                    customer.name[0]?.toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white">{customer.name}</p>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tier.bg} ${tier.text}`}>
                                            {tier.icon} {customer.nerdCoinTier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                            {customer.nerdCoinBalance}
                                        </span>
                                        <span className="ml-1 text-sm text-neutral-500">coin</span>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                        {customer._count.bookings} lần
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {canManageNerdCoin && (
                                                <button
                                                    onClick={() => openAdjustModal(customer)}
                                                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                                                    title="Điều chỉnh coin"
                                                >
                                                    <PlusIcon className="size-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openHistoryModal(customer)}
                                                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                                                title="Xem lịch sử"
                                            >
                                                <ChevronRightIcon className="size-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Customers Cards - Mobile */}
            <div className="space-y-3 md:hidden">
                {filteredCustomers.map(customer => {
                    const tier = tierColors[customer.nerdCoinTier] || tierColors.BRONZE
                    return (
                        <div key={customer.id} className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                                        {customer.avatar ? (
                                            <img src={customer.avatar} alt="" className="size-10 rounded-full object-cover" />
                                        ) : (
                                            customer.name[0]?.toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">{customer.name}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{customer.email}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tier.bg} ${tier.text}`}>
                                    {tier.icon} {customer.nerdCoinTier}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-xs text-neutral-500">Nerd Coin</p>
                                        <p className="font-bold text-primary-600 dark:text-primary-400">{customer.nerdCoinBalance}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500">Bookings</p>
                                        <p className="font-medium text-neutral-700 dark:text-neutral-300">{customer._count.bookings}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {canManageNerdCoin && (
                                        <button
                                            onClick={() => openAdjustModal(customer)}
                                            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                                        >
                                            <PlusIcon className="size-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openHistoryModal(customer)}
                                        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronRightIcon className="size-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Transaction History Modal */}
            <NcModal
                isOpenProp={isModalOpen}
                onCloseModal={() => setIsModalOpen(false)}
                modalTitle={`Lịch sử giao dịch - ${selectedCustomer?.name}`}
                renderTrigger={() => null}
                renderContent={() => (
                    <div className="space-y-4">
                        {selectedCustomer && (
                            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
                                <div>
                                    <p className="text-sm text-neutral-500">Số dư hiện tại</p>
                                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                        {selectedCustomer.nerdCoinBalance} coin
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${tierColors[selectedCustomer.nerdCoinTier]?.bg} ${tierColors[selectedCustomer.nerdCoinTier]?.text}`}>
                                    {tierColors[selectedCustomer.nerdCoinTier]?.icon} {selectedCustomer.nerdCoinTier}
                                </span>
                            </div>
                        )}
                        <div className="max-h-80 space-y-2 overflow-y-auto scrollbar-thin">
                            {transactions.length > 0 ? transactions.map(txn => (
                                <div key={txn.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                                    <div>
                                        <p className={`text-sm font-medium ${txnTypeLabels[txn.type]?.color}`}>
                                            {txnTypeLabels[txn.type]?.label}
                                        </p>
                                        <p className="text-xs text-neutral-500">{txn.description}</p>
                                        <p className="text-xs text-neutral-400">
                                            {new Date(txn.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <span className={`text-lg font-bold ${txn.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {txn.amount > 0 ? '+' : ''}{txn.amount}
                                    </span>
                                </div>
                            )) : (
                                <p className="py-8 text-center text-neutral-500">Chưa có giao dịch nào</p>
                            )}
                        </div>
                    </div>
                )}
            />

            {/* Adjust Coin Modal */}
            <NcModal
                isOpenProp={isAdjustModalOpen}
                onCloseModal={() => setIsAdjustModalOpen(false)}
                modalTitle={`Điều chỉnh coin - ${selectedCustomer?.name}`}
                renderTrigger={() => null}
                renderContent={() => (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Loại giao dịch
                            </label>
                            <select
                                value={adjustType}
                                onChange={e => setAdjustType(e.target.value as any)}
                                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 dark:border-neutral-600 dark:bg-neutral-800"
                            >
                                <option value="BONUS">Thưởng đặc biệt</option>
                                <option value="ADJUSTMENT">Điều chỉnh</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Số coin (dương = thêm, âm = trừ)
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAdjustAmount(p => p - 1)}
                                    className="flex size-10 items-center justify-center rounded-lg border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
                                >
                                    <MinusIcon className="size-5" />
                                </button>
                                <input
                                    type="number"
                                    value={adjustAmount}
                                    onChange={e => setAdjustAmount(parseInt(e.target.value) || 0)}
                                    className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-center text-lg font-bold dark:border-neutral-600 dark:bg-neutral-800"
                                />
                                <button
                                    onClick={() => setAdjustAmount(p => p + 1)}
                                    className="flex size-10 items-center justify-center rounded-lg border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
                                >
                                    <PlusIcon className="size-5" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Mô tả (tùy chọn)
                            </label>
                            <input
                                type="text"
                                value={adjustDescription}
                                onChange={e => setAdjustDescription(e.target.value)}
                                placeholder="VD: Thưởng sinh nhật"
                                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 dark:border-neutral-600 dark:bg-neutral-800"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button onClick={handleAdjust} loading={saving} disabled={adjustAmount === 0}>
                                {adjustAmount >= 0 ? 'Thêm coin' : 'Trừ coin'}
                            </Button>
                            <Button outline onClick={() => setIsAdjustModalOpen(false)}>
                                Hủy
                            </Button>
                        </div>
                    </div>
                )}
            />
        </div>
    )
}
