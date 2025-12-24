'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface GalleryImage {
    id?: string
    src: string
    alt: string
    span: string
}

// Default gallery images from Unsplash - coworking/cafe study space theme
const defaultImages: GalleryImage[] = [
    {
        src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
        alt: 'Không gian học tập thoáng đãng',
        span: 'col-span-2 row-span-2',
    },
    {
        src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
        alt: 'Góc làm việc yên tĩnh',
        span: 'col-span-1 row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80',
        alt: 'Khu vực meeting',
        span: 'col-span-1 row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
        alt: 'Quầy đồ uống',
        span: 'col-span-1 row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
        alt: 'Không gian chung',
        span: 'col-span-1 row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80',
        alt: 'Phòng họp nhóm',
        span: 'col-span-2 row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=600&q=80',
        alt: 'Góc sáng tạo',
        span: 'col-span-2 row-span-1',
    },
]

export default function GallerySection() {
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(defaultImages)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Fetch gallery images from database
    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch('/api/admin/gallery')
                if (res.ok) {
                    const data = await res.json()
                    if (data.images && data.images.length > 0) {
                        setGalleryImages(data.images)
                    }
                }
            } catch (error) {
                console.error('Error fetching gallery:', error)
            }
        }
        fetchGallery()
    }, [])

    const openLightbox = (index: number) => {
        setCurrentIndex(index)
        setLightboxOpen(true)
    }

    const closeLightbox = () => setLightboxOpen(false)

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length)
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') goToPrev()
        if (e.key === 'ArrowRight') goToNext()
        if (e.key === 'Escape') closeLightbox()
    }

    return (
        <section id="gallery" className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-800/50">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
                        Không gian
                    </span>
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white lg:text-4xl">
                        Khám phá Nerd Society
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Không gian học tập hiện đại, thoải mái và đầy cảm hứng dành cho bạn
                    </p>
                </div>

                {/* Masonry Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px]">
                    {galleryImages.map((image, index) => (
                        <div
                            key={index}
                            className={`${image.span} group relative overflow-hidden rounded-2xl cursor-pointer`}
                            onClick={() => openLightbox(index)}
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

                            {/* Caption */}
                            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white text-sm font-medium drop-shadow-lg">
                                    {image.alt}
                                </p>
                            </div>

                            {/* Zoom icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="size-12 rounded-full bg-white/90 flex items-center justify-center">
                                    <svg className="size-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats or CTA */}
                <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">500+</div>
                        <div className="text-neutral-600 dark:text-neutral-400 mt-1">m² không gian</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">100+</div>
                        <div className="text-neutral-600 dark:text-neutral-400 mt-1">chỗ ngồi</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">5</div>
                        <div className="text-neutral-600 dark:text-neutral-400 mt-1">phòng họp</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">24/7</div>
                        <div className="text-neutral-600 dark:text-neutral-400 mt-1">WiFi tốc độ cao</div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            <Transition show={lightboxOpen}>
                <Dialog onClose={closeLightbox} className="relative z-50" onKeyDown={handleKeyDown}>
                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/90" />
                    </TransitionChild>

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="relative w-full max-w-5xl">
                                {/* Close button */}
                                <button
                                    onClick={closeLightbox}
                                    className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
                                >
                                    <XMarkIcon className="size-8" />
                                </button>

                                {/* Image */}
                                <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-neutral-800">
                                    <Image
                                        src={galleryImages[currentIndex].src}
                                        alt={galleryImages[currentIndex].alt}
                                        fill
                                        className="object-cover"
                                        sizes="100vw"
                                    />

                                    {/* Caption in lightbox */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                        <p className="text-white text-lg font-medium">
                                            {galleryImages[currentIndex].alt}
                                        </p>
                                        <p className="text-white/70 text-sm mt-1">
                                            {currentIndex + 1} / {galleryImages.length}
                                        </p>
                                    </div>
                                </div>

                                {/* Navigation buttons */}
                                <button
                                    onClick={goToPrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                >
                                    <ChevronLeftIcon className="size-6" />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                >
                                    <ChevronRightIcon className="size-6" />
                                </button>

                                {/* Thumbnails */}
                                <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-2">
                                    {galleryImages.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${currentIndex === index
                                                ? 'border-primary-500 opacity-100'
                                                : 'border-transparent opacity-50 hover:opacity-80'
                                                }`}
                                        >
                                            <Image
                                                src={image.src}
                                                alt={image.alt}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </section>
    )
}
