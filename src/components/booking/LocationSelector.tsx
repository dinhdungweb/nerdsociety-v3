'use client'

import { MapPinIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'

interface Location {
    id: string
    name: string
    address: string
    image?: string | null
}

interface LocationSelectorProps {
    locations: Location[]
    selectedLocationId: string
    onSelect: (locationId: string) => void
}

export default function LocationSelector({
    locations,
    selectedLocationId,
    onSelect,
}: LocationSelectorProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {locations.map((location) => {
                const isSelected = selectedLocationId === location.id
                return (
                    <div
                        key={location.id}
                        onClick={() => onSelect(location.id)}
                        className={clsx(
                            'group relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all',
                            isSelected
                                ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/10'
                                : 'border-transparent bg-white shadow-sm hover:border-primary-200 hover:shadow-md dark:bg-neutral-900 dark:hover:border-primary-800'
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className={clsx(
                                    'flex size-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                                    isSelected
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-neutral-100 text-neutral-500 group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-primary-900/30'
                                )}
                            >
                                <MapPinIcon className="size-6" />
                            </div>
                            <div>
                                <h3
                                    className={clsx(
                                        'font-medium transition-colors',
                                        isSelected
                                            ? 'text-primary-700 dark:text-primary-300'
                                            : 'text-neutral-900 dark:text-white'
                                    )}
                                >
                                    {location.name}
                                </h3>
                                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                    {location.address}
                                </p>
                            </div>
                        </div>

                        {isSelected && (
                            <div className="absolute right-4 top-4 text-primary-500">
                                <CheckCircleIcon className="size-6" />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
