'use client'

import { PencilIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import NcModal from '@/shared/NcModal'
import ComboForm from './forms/ComboForm'

interface Combo {
    id: string
    name: string
    duration: number
    price: number
    description: string | null
    features: string[]
    icon: string | null
    image: string | null
    isPopular: boolean
    isActive: boolean
    sortOrder: number
}

interface EditComboWrapperProps {
    combo: Combo
}

export default function EditComboWrapper({ combo }: EditComboWrapperProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
                <PencilIcon className="size-4" />
            </button>

            <NcModal
                isOpenProp={isOpen}
                onCloseModal={() => setIsOpen(false)}
                modalTitle={`Chỉnh sửa: ${combo.name}`}
                renderContent={() => (
                    <ComboForm
                        combo={combo}
                        onSuccess={() => setIsOpen(false)}
                        onCancel={() => setIsOpen(false)}
                    />
                )}
            />
        </>
    )
}
