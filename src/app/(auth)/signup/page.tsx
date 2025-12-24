
import SignupForm from './SignupForm'
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

export default async function SignupPage() {
  const settings = await getSettings()

  return (
    <SignupForm logoUrl={settings.siteLogo} logoLightUrl={settings.siteLogoLight} />
  )
}
