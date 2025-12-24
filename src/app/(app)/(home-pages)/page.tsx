import {
  AboutNerd,
  ComboSection,
  ContactNerd,
  FooterNerd,
  GallerySection,
  HeaderNerd,
  HeroNerd,
  LocationsNerd,
  NewsSection,
} from '@/components/landing'
import { AboutFeature } from '@/components/landing/AboutNerd'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Nerd Society | Không gian học tập dành cho Gen Z',
  description:
    'Nerd Society: Cộng đồng học tập Gen Z năng động tại Hà Nội. Không gian làm việc chung, học nhóm lý tưởng, tổ chức sự kiện, workshop chuyên sâu. Kết nối, phát triển bản thân và chinh phục kiến thức cùng Nerd Society!',
  keywords: ['Nerd Society', 'cafe học tập', 'co-working space', 'Hà Nội', 'Gen Z', 'không gian làm việc'],
}

import { prisma } from '@/lib/prisma'

async function getSettings() {
  try {
    const settings = await prisma.setting.findMany()
    return settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, string>)
  } catch (error) {
    return {}
  }
}

async function getCombos() {
  try {
    return await prisma.combo.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  } catch (error) {
    return []
  }
}

function getAboutFeatures(settings: Record<string, string>): AboutFeature[] | undefined {
  try {
    if (settings.aboutFeatures) {
      return JSON.parse(settings.aboutFeatures)
    }
  } catch (error) {
    console.error('Error parsing aboutFeatures:', error)
  }
  return undefined
}

function getHeroFeatures(settings: Record<string, string>) {
  try {
    if (settings.heroFeatures) {
      return JSON.parse(settings.heroFeatures)
    }
  } catch (error) {
    console.error('Error parsing heroFeatures:', error)
  }
  return undefined
}

function getHeroStats(settings: Record<string, string>) {
  try {
    if (settings.heroStats) {
      return JSON.parse(settings.heroStats)
    }
  } catch (error) {
    console.error('Error parsing heroStats:', error)
  }
  return undefined
}

function getHeroFloatingCards(settings: Record<string, string>) {
  try {
    if (settings.heroFloatingCards) {
      return JSON.parse(settings.heroFloatingCards)
    }
  } catch (error) {
    console.error('Error parsing heroFloatingCards:', error)
  }
  return undefined
}

export default async function Page() {
  const settings = await getSettings()
  const combos = await getCombos()
  const aboutFeatures = getAboutFeatures(settings)
  const heroFeatures = getHeroFeatures(settings)
  const heroStats = getHeroStats(settings)
  const heroFloatingCards = getHeroFloatingCards(settings)

  return (
    <>
      <HeaderNerd logoUrl={settings.siteLogo} logoLightUrl={settings.siteLogoLight} />
      <main className="pt-20">
        <HeroNerd
          heroTitle={settings.heroTitle}
          heroSubtitle={settings.heroSubtitle}
          heroCta={settings.heroCta}
          heroCtaSecondary={settings.heroCtaSecondary}
          heroBadge={settings.heroBadge}
          heroBackgroundImage={settings.heroBackgroundImage}
          heroFeatures={heroFeatures}
          heroStats={heroStats}
          heroFloatingCards={heroFloatingCards}
        />
        <AboutNerd
          aboutTitle={settings.aboutTitle}
          aboutContent={settings.aboutContent}
          aboutFeatures={aboutFeatures}
        />
        <GallerySection />
        <ComboSection combos={combos} />
        <LocationsNerd />
        <NewsSection />
        <ContactNerd
          contactTitle={settings.contactTitle}
          contactSubtitle={settings.contactSubtitle}
          contactEmail={settings.contactEmail}
          contactPhone={settings.contactPhone}
          contactWebsite={settings.contactWebsite}
          contactCtaTitle={settings.contactCtaTitle}
          contactCtaSubtitle={settings.contactCtaSubtitle}
          contactCtaButton={settings.contactCtaButton}
          contactCtaLink={settings.contactCtaLink}
        />
      </main>
      <FooterNerd logoUrl={settings.siteLogoLight || settings.siteLogo} />
    </>
  )
}

