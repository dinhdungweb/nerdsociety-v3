'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import NcModal from '@/shared/NcModal'
import ComboForm from './forms/ComboForm'
import { usePermissions } from '@/contexts/PermissionsContext'

export default function AddComboWrapper() {
    const [isOpen, setIsOpen] = useState(false)

    // Permission check
    const { hasPermission } = usePermissions()
    const canManageServices = hasPermission('canManageServices')

    // Hide button if no permission
    if (!canManageServices) {
        return null
    }

    return (
        <NcModal
            isOpenProp={isOpen}
            onCloseModal={() => setIsOpen(false)}
            triggerText={
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
                >
                    <PlusIcon className="size-5" />
                    Thêm combo
                </button>
            }
            modalTitle="Thêm Combo mới"
            renderTrigger={(openModal) => (
                <button
                    onClick={() => {
                        openModal()
                        setIsOpen(true)
                    }}
                    className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
                >
                    <PlusIcon className="size-5" />
                    Thêm combo
                </button>
            )}
            renderContent={() => (
                <ComboForm
                    onSuccess={() => setIsOpen(false)}
                    onCancel={() => setIsOpen(false)}
                />
            )}
        />
    )
}
