'use client'

import { SessionProvider } from 'next-auth/react'
import ThemeProvider from './theme-provider'

import { Toaster } from 'react-hot-toast'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider>
                {children}
                <Toaster position="top-right" />
                <ScrollToTop />
            </ThemeProvider>
        </SessionProvider>
    )
}
