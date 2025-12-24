'use client'

import { ArrowUpIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling down 400px
            setIsVisible(window.scrollY > 400)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={scrollToTop}
                    className="fixed bottom-24 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-white text-primary-600 shadow-lg transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:bg-neutral-800 dark:text-primary-400 dark:hover:bg-neutral-700"
                    aria-label="Back to Top"
                >
                    <ArrowUpIcon className="size-6" />
                </motion.button>
            )}
        </AnimatePresence>
    )
}
