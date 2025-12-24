import BookingWizardV2 from '@/components/booking/BookingWizardV2'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Đặt lịch - Nerd Society',
    description: 'Đặt lịch sử dụng không gian làm việc chung tại Nerd Society',
}

async function getLocations() {
    const locations = await prisma.location.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            address: true,
            image: true,
        },
        orderBy: { createdAt: 'asc' },
    })

    return locations
}

export default async function BookingPage() {
    const locations = await getLocations()

    return (
        <div className="bg-neutral-50 pt-16 pb-24 dark:bg-neutral-950">
            <div className="container">
                <div className="mx-auto max-w-2xl text-center mb-12">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
                        Đặt lịch ngay
                    </h1>
                    <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400">
                        Chỗ ngồi chung không cần đặt trước
                        <br />
                        Áp dụng cho cả hai cơ sở của Nerd Society
                        <br />
                        Muốn check xem hiện tại có đông không?
                        <br />
                        <a
                            href="https://m.me/nerdsociety.vn"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-100 px-6 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
                        >
                            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.553 3.105l-6 3C11.226 7.77 8.579 9.977 7.026 10.983c-.354.23-.717-.184-.41-.54 2.148-2.49 5.86-6.643 5.86-6.643.235-.297-.042-.644-.344-.435l-8.796 5.8C2.531 9.776 1.05 9.172 1.05 9.172s-1.026-.645-.064-1.28c4.27-2.623 11.248-6.195 16.596-7.904 2.871-.856 3.153 1.157 2.97 3.116zM11.908 19.33l-2.028-2.03.62-5.49c.045-.39-.187-.648-.54-.42l-5.7 3.655s.693 2.122 7.648 4.285z" /></svg>
                            Chat ngay
                        </a>
                    </p>
                </div>

                <BookingWizardV2 locations={locations} />
            </div>
        </div>
    )
}

