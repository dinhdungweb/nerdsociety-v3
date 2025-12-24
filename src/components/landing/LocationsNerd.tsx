'use client'

import { Button } from '@/shared/Button'
import {
    MapIcon,
    MapPinIcon,
    PhoneIcon,
    BuildingOffice2Icon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Location {
    id: string
    name: string
    address: string
    phone: string
    mapUrl: string | null
    image: string | null
    isActive: boolean
}

const DEFAULT_LOCATION_IMAGE = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=400&fit=crop'

export default function LocationsNerd() {
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchLocations() {
            try {
                const res = await fetch('/api/admin/locations')
                if (res.ok) {
                    const data = await res.json()
                    // Filter only active locations
                    setLocations(data.filter((loc: Location) => loc.isActive))
                }
            } catch (error) {
                console.error('Failed to fetch locations:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchLocations()
    }, [])

    if (loading) {
        return (
            <section id="locations" className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="container">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto animate-pulse" />
                        <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-700 rounded-lg mx-auto mt-4 animate-pulse" />
                    </div>
                    <div className="mt-16 grid gap-8 lg:grid-cols-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="locations" className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-800/50">
            <div className="container">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                    >
                        Địa điểm
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white"
                    >
                        {locations.length} Cơ sở tại Hà Nội
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-lg text-neutral-600 dark:text-neutral-300"
                    >
                        Chọn cơ sở gần bạn nhất để đến và trải nghiệm
                    </motion.p>
                </div>

                {/* Locations Grid */}
                <div className="mt-16 grid gap-8 lg:grid-cols-2">
                    {locations.map((location, index) => (
                        <motion.div
                            key={location.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            {/* Location Image */}
                            <div className="relative h-80 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={location.image || DEFAULT_LOCATION_IMAGE}
                                    alt={location.name}
                                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {location.name}
                                </h3>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="size-5 shrink-0 text-primary-500" />
                                        <p className="text-neutral-600 dark:text-neutral-400">{location.address}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <PhoneIcon className="size-5 shrink-0 text-primary-500" />
                                        <a
                                            href={`tel:${location.phone.replace(/\s/g, '')}`}
                                            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                                        >
                                            {location.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    {location.mapUrl && (
                                        <Button outline href={location.mapUrl} className="flex-1 justify-center">
                                            <MapIcon className="size-5" />
                                            Xem bản đồ
                                        </Button>
                                    )}
                                    <Button color="primary" href="/booking" className="flex-1 justify-center">
                                        Đặt lịch
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
