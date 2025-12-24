import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/tailwind.css'
import { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import 'rc-slider/assets/index.css'
import ThemeProvider from './theme-provider'
import { Providers } from './providers'
import { ChatWidget } from '@/components/chat/ChatWidget'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

import { prisma } from '@/lib/prisma'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.setting.findMany()
  const config = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, string>)

  return {
    title: {
      template: '%s - Nerd Society',
      default: config.siteName || 'Nerd Society | Không gian học tập dành cho Gen Z',
    },
    description: config.siteDescription || 'Nerd Society: Cộng đồng học tập Gen Z năng động tại Hà Nội.',
    keywords: ['Nerd Society', 'cafe học tập', 'co-working space', 'Hà Nội', 'Gen Z'],
    icons: config.siteFavicon ? { icon: config.siteFavicon } : undefined,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.setting.findMany()
  const config = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, string>)

  return (
    <html lang="vi" className={beVietnamPro.className}>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <Providers>
          {children}
          <ChatWidget logoUrl={config.siteFavicon} />
        </Providers>
      </body>
    </html>
  )
}

