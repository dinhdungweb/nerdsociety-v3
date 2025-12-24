'use client'

import { RoomType } from '@prisma/client'
import clsx from 'clsx'
import Image from 'next/image'

interface Room {
    id: string
    name: string
    type: RoomType
    description?: string | null
    capacity: number
    amenities: string[]
    image?: string | null
}

interface RoomSelectorProps {
    rooms: Room[]
    selectedRoomId: string | null
    onSelect: (room: Room) => void
    loading?: boolean
}

const roomTypeLabels: Record<RoomType, string> = {
    MEETING_LONG: 'Phòng họp bàn dài',
    MEETING_ROUND: 'Phòng họp bàn tròn',
    POD_MONO: 'Pod đơn',
    POD_MULTI: 'Pod đôi',
}

export default function RoomSelector({
    rooms,
    selectedRoomId,
    onSelect,
    loading = false,
}: RoomSelectorProps) {
    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                    <div key={i} className="overflow-hidden rounded-xl border-2 border-transparent bg-white shadow-sm dark:bg-neutral-900">
                        {/* Image skeleton with shimmer */}
                        <div className="relative h-48 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                        {/* Content skeleton */}
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
                                <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                            <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-neutral-200 dark:bg-neutral-700" />
                                <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                            <div className="flex gap-2">
                                <div className="h-6 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                                <div className="h-6 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                                <div className="h-6 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (rooms.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-neutral-500 dark:text-neutral-400">
                    Không tìm thấy phòng phù hợp tại cơ sở này.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id
                return (
                    <div
                        key={room.id}
                        onClick={() => onSelect(room)}
                        className={clsx(
                            'group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all',
                            isSelected
                                ? 'border-primary-500 ring-2 ring-primary-500/20'
                                : 'border-transparent bg-white shadow-sm hover:shadow-md dark:bg-neutral-900'
                        )}
                    >
                        {/* Image */}
                        <div className="relative h-48 bg-neutral-200 dark:bg-neutral-800">
                            {room.image ? (
                                <Image
                                    src={room.image}
                                    alt={room.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="size-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            )}

                            {/* Selected overlay */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center">
                                    <div className="rounded-full bg-primary-500 p-2">
                                        <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <h3 className={clsx(
                                    'font-semibold transition-colors',
                                    isSelected
                                        ? 'text-primary-700 dark:text-primary-300'
                                        : 'text-neutral-900 dark:text-white'
                                )}>
                                    {room.name}
                                </h3>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {roomTypeLabels[room.type]}
                                </span>
                            </div>

                            {room.description && (
                                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                    {room.description}
                                </p>
                            )}

                            <div className="mt-3 flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Tối đa {room.capacity} người
                                </span>
                            </div>

                            {/* Amenities */}
                            {room.amenities.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {room.amenities.slice(0, 4).map((amenity, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                    {room.amenities.length > 4 && (
                                        <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                            +{room.amenities.length - 4}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
