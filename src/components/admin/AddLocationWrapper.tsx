'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import NcModal from '@/shared/NcModal'
import LocationForm from './forms/LocationForm'

export default function AddLocationWrapper() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <NcModal
            isOpenProp={isOpen}
            onCloseModal={() => setIsOpen(false)}
            modalTitle="Thêm Cơ sở mới"
            renderTrigger={(openModal) => (
                <button
                    onClick={() => {
                        openModal()
                        setIsOpen(true)
                    }}
                    className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
                >
                    <PlusIcon className="size-5" />
                    Thêm cơ sở
                </button>
            )}
            renderContent={() => (
                <LocationForm
                    onSuccess={() => setIsOpen(false)}
                    onCancel={() => setIsOpen(false)}
                />
            )}
        />
    )
}
