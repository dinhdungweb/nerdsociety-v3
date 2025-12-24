import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nerd Society | Không gian học tập dành cho Gen Z',
  description:
    'Nerd Society: Cộng đồng học tập Gen Z năng động tại Hà Nội. Không gian làm việc chung, học nhóm lý tưởng.',
  keywords: ['Nerd Society', 'cafe học tập', 'co-working space', 'Hà Nội', 'Gen Z'],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
