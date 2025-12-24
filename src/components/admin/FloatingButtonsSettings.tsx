'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
    PlusIcon,
    TrashIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    LinkIcon,
    ArrowTopRightOnSquareIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    PencilIcon,
    XMarkIcon,
    CheckIcon,
} from '@heroicons/react/24/outline'

export interface FloatingButton {
    id: string
    label: string
    type: 'phone' | 'chat' | 'zalo' | 'messenger' | 'link' | 'email'
    value: string // phone number, URL, etc.
    icon: string
    bgColor: string
    textColor: string
    isActive: boolean
    order: number
}

const BUTTON_TYPES = [
    { value: 'phone', label: 'Gọi điện', icon: 'phone', placeholder: 'Số điện thoại (VD: 0368483689)' },
    { value: 'chat', label: 'Chat hỗ trợ', icon: 'chat', placeholder: 'Để trống để mở chat widget' },
    { value: 'zalo', label: 'Zalo', icon: 'zalo', placeholder: 'Số điện thoại Zalo hoặc URL Zalo OA' },
    { value: 'messenger', label: 'Messenger', icon: 'messenger', placeholder: 'Page ID hoặc URL Messenger' },
    { value: 'email', label: 'Email', icon: 'email', placeholder: 'Địa chỉ email' },
    { value: 'link', label: 'Link URL', icon: 'link', placeholder: 'URL đầy đủ (https://...)' },
]

const ICON_OPTIONS = [
    { value: 'phone', label: 'Điện thoại' },
    { value: 'chat', label: 'Chat' },
    { value: 'zalo', label: 'Zalo' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'email', label: 'Email' },
    { value: 'link', label: 'Link' },
]

const DEFAULT_BUTTONS: FloatingButton[] = [
    {
        id: 'default-phone',
        label: 'Gọi ngay',
        type: 'phone',
        value: '0368483689',
        icon: 'phone',
        bgColor: '#a5916e',
        textColor: '#ffffff',
        isActive: true,
        order: 1,
    },
    {
        id: 'default-chat',
        label: 'Chat hỗ trợ',
        type: 'chat',
        value: '',
        icon: 'chat',
        bgColor: '#a5916e',
        textColor: '#ffffff',
        isActive: true,
        order: 2,
    },
]

export default function FloatingButtonsSettings() {
    const [buttons, setButtons] = useState<FloatingButton[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newButton, setNewButton] = useState<Partial<FloatingButton>>({
        label: '',
        type: 'phone',
        value: '',
        icon: 'phone',
        bgColor: '#a5916e',
        textColor: '#ffffff',
        isActive: true,
    })

    useEffect(() => {
        fetchButtons()
    }, [])

    const fetchButtons = async () => {
        try {
            const res = await fetch('/api/admin/settings/floating-buttons')
            const data = await res.json()
            if (res.ok && data.buttons) {
                setButtons(data.buttons)
            } else {
                // Use defaults if no data
                setButtons(DEFAULT_BUTTONS)
            }
        } catch (error) {
            console.error('Failed to load floating buttons:', error)
            setButtons(DEFAULT_BUTTONS)
        } finally {
            setLoading(false)
        }
    }

    const saveButtons = async (newButtons: FloatingButton[]) => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings/floating-buttons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buttons: newButtons }),
            })
            if (!res.ok) throw new Error('Failed to save')
            toast.success('Đã lưu cấu hình nút liên hệ!')
        } catch (error) {
            toast.error('Lỗi khi lưu cấu hình!')
        } finally {
            setSaving(false)
        }
    }

    const addButton = () => {
        const button: FloatingButton = {
            id: `btn-${Date.now()}`,
            label: newButton.label || 'Nút mới',
            type: newButton.type as FloatingButton['type'] || 'phone',
            value: newButton.value || '',
            icon: newButton.icon || 'phone',
            bgColor: newButton.bgColor || '#fab320',
            textColor: newButton.textColor || '#000000',
            isActive: true,
            order: buttons.length + 1,
        }
        const updated = [...buttons, button]
        setButtons(updated)
        saveButtons(updated)
        setShowAddModal(false)
        setNewButton({
            label: '',
            type: 'phone',
            value: '',
            icon: 'phone',
            bgColor: '#c29024',
            textColor: '#ffffff',
            isActive: true,
        })
    }

    const updateButton = (id: string, updates: Partial<FloatingButton>) => {
        const updated = buttons.map(btn =>
            btn.id === id ? { ...btn, ...updates } : btn
        )
        setButtons(updated)
    }

    const saveButton = (id: string) => {
        saveButtons(buttons)
        setEditingId(null)
    }

    const deleteButton = (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa nút này?')) return
        const updated = buttons.filter(btn => btn.id !== id)
        setButtons(updated)
        saveButtons(updated)
    }

    const moveButton = (id: string, direction: 'up' | 'down') => {
        const index = buttons.findIndex(btn => btn.id === id)
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === buttons.length - 1) return

        const newButtons = [...buttons]
        const swapIndex = direction === 'up' ? index - 1 : index + 1
            ;[newButtons[index], newButtons[swapIndex]] = [newButtons[swapIndex], newButtons[index]]

        // Update order
        newButtons.forEach((btn, i) => btn.order = i + 1)
        setButtons(newButtons)
        saveButtons(newButtons)
    }

    const toggleActive = (id: string) => {
        const updated = buttons.map(btn =>
            btn.id === id ? { ...btn, isActive: !btn.isActive } : btn
        )
        setButtons(updated)
        saveButtons(updated)
    }

    const getTypeInfo = (type: string) => BUTTON_TYPES.find(t => t.value === type)

    const renderIcon = (icon: string, className: string = 'size-5') => {
        switch (icon) {
            case 'phone': return <PhoneIcon className={className} />
            case 'chat': return <ChatBubbleLeftRightIcon className={className} />
            case 'link': return <LinkIcon className={className} />
            case 'email': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            case 'zalo': return (
                <svg className={className} viewBox="0 0 614.501 613.667" fill="currentColor">
                    <path d="M464.721,301.399c-13.984-0.014-23.707,11.478-23.944,28.312c-0.251,17.771,9.168,29.208,24.037,29.202c14.287-0.007,23.799-11.095,24.01-27.995C489.028,313.536,479.127,301.399,464.721,301.399z" />
                    <path d="M291.83,301.392c-14.473-0.316-24.578,11.603-24.604,29.024c-0.02,16.959,9.294,28.259,23.496,28.502c15.072,0.251,24.592-10.87,24.539-28.707C315.214,313.318,305.769,301.696,291.83,301.392z" />
                    <path d="M310.518,3.158C143.102,3.158,7.375,138.884,7.375,306.3s135.727,303.142,303.143,303.142c167.415,0,303.143-135.727,303.143-303.142S477.933,3.158,310.518,3.158z M217.858,391.083c-33.364,0.818-66.828,1.353-100.133-0.343c-21.326-1.095-27.652-18.647-14.248-36.583c21.55-28.826,43.886-57.065,65.792-85.621c2.546-3.305,6.214-5.996,7.15-12.705c-16.609,0-32.784,0.04-48.958-0.013c-19.195-0.066-28.278-5.805-28.14-17.652c0.132-11.768,9.175-17.329,28.397-17.348c25.159-0.026,50.324-0.06,75.476,0.026c9.637,0.033,19.604,0.105,25.304,9.789c6.22,10.561,0.284,19.512-5.646,27.454c-21.26,28.497-43.015,56.624-64.559,84.902c-2.599,3.41-5.119,6.88-9.453,12.725c23.424,0,44.123-0.053,64.816,0.026c8.674,0.026,16.662,1.873,19.941,11.267C237.892,379.329,231.368,390.752,217.858,391.083z M350.854,330.211c0,13.417-0.093,26.841,0.039,40.265c0.073,7.599-2.599,13.647-9.512,17.084c-7.296,3.642-14.71,3.028-20.304-2.968c-3.997-4.281-6.214-3.213-10.488-0.422c-17.955,11.728-39.908,9.96-56.597-3.866c-29.928-24.789-30.026-74.803-0.211-99.776c16.194-13.562,39.592-15.462,56.709-4.143c3.951,2.619,6.201,4.815,10.396-0.053c5.39-6.267,13.055-6.761,20.271-3.357c7.454,3.509,9.935,10.165,9.776,18.265C350.67,304.222,350.86,317.217,350.854,330.211z M395.617,369.579c-0.118,12.837-6.398,19.783-17.196,19.908c-10.779,0.132-17.593-6.966-17.646-19.512c-0.179-43.352-0.185-86.696,0.007-130.041c0.059-12.256,7.302-19.921,17.896-19.222c11.425,0.752,16.992,7.448,16.992,18.833c0,22.104,0,44.216,0,66.327C395.677,327.105,395.828,348.345,395.617,369.579z M463.981,391.868c-34.399-0.336-59.037-26.444-58.786-62.289c0.251-35.66,25.304-60.713,60.383-60.396c34.631,0.304,59.374,26.306,58.998,61.986C524.207,366.492,498.534,392.205,463.981,391.868z" />
                </svg>
            )
            case 'messenger': return (
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.444 5.53 3.675 7.222V22l3.334-1.827c.89.247 1.833.38 2.791.38 5.523 0 10-4.144 10-9.253S17.523 2 12 2zm.994 12.472l-2.548-2.72-4.97 2.72 5.47-5.804 2.612 2.72 4.904-2.72-5.468 5.804z" />
                </svg>
            )
            default: return <ArrowTopRightOnSquareIcon className={className} />
        }
    }

    if (loading) {
        return <div className="animate-pulse p-4 text-neutral-500">Đang tải...</div>
    }

    return (
        <div className="space-y-4">
            {/* Button List */}
            <div className="space-y-3">
                {buttons.map((btn, index) => (
                    <div
                        key={btn.id}
                        className={`rounded-xl border p-4 transition-all ${btn.isActive
                            ? 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
                            : 'border-neutral-200 bg-neutral-50 opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50'
                            }`}
                    >
                        {editingId === btn.id ? (
                            // Edit Mode
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tên hiển thị</label>
                                        <input
                                            type="text"
                                            value={btn.label}
                                            onChange={e => updateButton(btn.id, { label: e.target.value })}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Loại nút</label>
                                        <select
                                            value={btn.type}
                                            onChange={e => updateButton(btn.id, { type: e.target.value as FloatingButton['type'], icon: e.target.value })}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                                        >
                                            {BUTTON_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        {getTypeInfo(btn.type)?.placeholder || 'Giá trị'}
                                    </label>
                                    <input
                                        type="text"
                                        value={btn.value}
                                        onChange={e => updateButton(btn.id, { value: e.target.value })}
                                        placeholder={getTypeInfo(btn.type)?.placeholder}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Màu nền</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={btn.bgColor}
                                                onChange={e => updateButton(btn.id, { bgColor: e.target.value })}
                                                className="h-10 w-14 cursor-pointer rounded border border-neutral-200"
                                            />
                                            <input
                                                type="text"
                                                value={btn.bgColor}
                                                onChange={e => updateButton(btn.id, { bgColor: e.target.value })}
                                                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Màu chữ/icon</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={btn.textColor}
                                                onChange={e => updateButton(btn.id, { textColor: e.target.value })}
                                                className="h-10 w-14 cursor-pointer rounded border border-neutral-200"
                                            />
                                            <input
                                                type="text"
                                                value={btn.textColor}
                                                onChange={e => updateButton(btn.id, { textColor: e.target.value })}
                                                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => saveButton(btn.id)}
                                        className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
                                    >
                                        <CheckIcon className="size-4" />
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Preview */}
                                    <div
                                        className="flex size-10 items-center justify-center rounded-full"
                                        style={{ backgroundColor: btn.bgColor, color: btn.textColor }}
                                    >
                                        {renderIcon(btn.icon, 'size-5')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">{btn.label}</p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {getTypeInfo(btn.type)?.label} {btn.value && `• ${btn.value}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Order Controls */}
                                    <div className="flex flex-col">
                                        <button
                                            onClick={() => moveButton(btn.id, 'up')}
                                            disabled={index === 0}
                                            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-700"
                                        >
                                            <ChevronUpIcon className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => moveButton(btn.id, 'down')}
                                            disabled={index === buttons.length - 1}
                                            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-700"
                                        >
                                            <ChevronDownIcon className="size-4" />
                                        </button>
                                    </div>
                                    {/* Toggle */}
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            checked={btn.isActive}
                                            onChange={() => toggleActive(btn.id)}
                                            className="peer sr-only"
                                        />
                                        <div className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full dark:bg-neutral-600"></div>
                                    </label>
                                    {/* Edit */}
                                    <button
                                        onClick={() => setEditingId(btn.id)}
                                        className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                    >
                                        <PencilIcon className="size-4" />
                                    </button>
                                    {/* Delete */}
                                    <button
                                        onClick={() => deleteButton(btn.id)}
                                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <TrashIcon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-4 text-neutral-500 transition-colors hover:border-primary-500 hover:text-primary-600 dark:border-neutral-600 dark:hover:border-primary-500"
            >
                <PlusIcon className="size-5" />
                Thêm nút liên hệ mới
            </button>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Thêm nút liên hệ</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600">
                                <XMarkIcon className="size-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Tên hiển thị</label>
                                <input
                                    type="text"
                                    value={newButton.label}
                                    onChange={e => setNewButton({ ...newButton, label: e.target.value })}
                                    placeholder="VD: Gọi ngay"
                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Loại nút</label>
                                <select
                                    value={newButton.type}
                                    onChange={e => setNewButton({ ...newButton, type: e.target.value as FloatingButton['type'], icon: e.target.value })}
                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                >
                                    {BUTTON_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    {BUTTON_TYPES.find(t => t.value === newButton.type)?.placeholder || 'Giá trị'}
                                </label>
                                <input
                                    type="text"
                                    value={newButton.value}
                                    onChange={e => setNewButton({ ...newButton, value: e.target.value })}
                                    placeholder={BUTTON_TYPES.find(t => t.value === newButton.type)?.placeholder}
                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Màu nền</label>
                                    <input
                                        type="color"
                                        value={newButton.bgColor}
                                        onChange={e => setNewButton({ ...newButton, bgColor: e.target.value })}
                                        className="h-10 w-full cursor-pointer rounded border border-neutral-200"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Màu chữ</label>
                                    <input
                                        type="color"
                                        value={newButton.textColor}
                                        onChange={e => setNewButton({ ...newButton, textColor: e.target.value })}
                                        className="h-10 w-full cursor-pointer rounded border border-neutral-200"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="rounded-lg px-4 py-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={addButton}
                                className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
