'use client'

import { useState } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PostGalleryProps {
    images: string[]
}

export default function PostGallery({ images }: PostGalleryProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const [selectedIndex, setSelectedIndex] = useState(0)

    const scrollPrev = () => {
        emblaApi?.scrollPrev()
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const scrollNext = () => {
        emblaApi?.scrollNext()
        setSelectedIndex((prev) => (prev + 1) % images.length)
    }

    const scrollTo = (index: number) => {
        emblaApi?.scrollTo(index)
        setSelectedIndex(index)
    }

    if (images.length === 0) return null

    if (images.length === 1) {
        return (
            <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image
                    src={images[0]}
                    alt="Gallery image"
                    fill
                    className="object-cover"
                />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Main carousel */}
            <div className="relative rounded-xl overflow-hidden">
                <div className="embla overflow-hidden" ref={emblaRef}>
                    <div className="embla__container flex">
                        {images.map((src, index) => (
                            <div key={index} className="embla__slide flex-shrink-0 w-full">
                                <div className="relative aspect-video">
                                    <Image
                                        src={src}
                                        alt={`Gallery image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation buttons */}
                <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-black transition-colors"
                >
                    <ChevronLeftIcon className="size-5" />
                </button>
                <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-black transition-colors"
                >
                    <ChevronRightIcon className="size-5" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                    {selectedIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((src, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${selectedIndex === index
                                ? 'border-primary-500'
                                : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                            }`}
                    >
                        <Image
                            src={src}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}
