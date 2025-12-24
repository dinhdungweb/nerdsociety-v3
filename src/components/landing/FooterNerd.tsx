'use client'

import { EnvelopeIcon, GlobeAltIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

// Coffee cup icon for logo
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h15a3 3 0 013 3v1a3 3 0 01-3 3h-1.5M3 8v8a4 4 0 004 4h5a4 4 0 004-4v-3M3 8l1-4h13l1 4M7.5 8v1.5m4-1.5v1.5" />
    </svg>
)

const navigation = {
    main: [
        { name: 'Giới thiệu', href: '/#about' },
        { name: 'Bảng giá', href: '/#combos' },
        { name: 'Địa điểm', href: '/#locations' },
        { name: 'Liên hệ', href: '/#contact' },
    ],
    locations: [
        {
            name: 'Cơ sở Hồ Tùng Mậu',
            address: 'Tập thể trường múa, Khu Văn hóa & Nghệ Thuật',
            href: 'https://maps.app.goo.gl/1hdXj2VDtcScxGKm9',
        },
        {
            name: 'Cơ sở Tây Sơn',
            address: 'Tầng 2, 3 ngõ 167 Tây Sơn',
            href: 'https://maps.app.goo.gl/RVeYRTPuWTuiTymq9',
        },
    ],
    social: [
        {
            name: 'Facebook',
            href: 'https://facebook.com/nerdsociety',
            icon: (props: React.SVGProps<SVGSVGElement>) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        {
            name: 'Instagram',
            href: 'https://instagram.com/nerd.society',
            icon: (props: React.SVGProps<SVGSVGElement>) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        {
            name: 'TikTok',
            href: 'https://tiktok.com/@nerdsociety',
            icon: (props: React.SVGProps<SVGSVGElement>) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
            ),
        },
    ],
}

export default function FooterNerd({ logoUrl }: { logoUrl?: string }) {
    return (
        <footer className="relative overflow-hidden bg-neutral-900">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 size-80 rounded-full bg-primary-600/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 size-80 rounded-full bg-primary-500/10 blur-3xl" />
            </div>

            <div className="container relative">
                {/* Top section */}
                <div className="grid gap-12 border-b border-white/10 py-16 lg:grid-cols-12 lg:gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="group inline-flex items-center gap-2.5">
                            {logoUrl ? (
                                <div className="relative h-12 w-auto overflow-hidden transition-transform group-hover:scale-105">
                                    <img src={logoUrl} alt="Nerd Society" className="h-full w-auto object-contain" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-105">
                                        <CoffeeIcon className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold leading-tight text-white">
                                            Nerd Society
                                        </span>
                                        <span className="text-xs font-medium uppercase tracking-wider text-primary-400">
                                            Study & Work Space
                                        </span>
                                    </div>
                                </>
                            )}
                        </Link>
                        <p className="mt-6 max-w-sm text-neutral-400">
                            Cộng đồng học tập Gen Z năng động tại Hà Nội. Không gian làm việc chung, học nhóm lý tưởng với đầy đủ tiện nghi.
                        </p>

                        {/* Social links */}
                        <div className="mt-8 flex gap-3">
                            {navigation.social.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-neutral-400 transition-all hover:bg-primary-500 hover:text-white hover:shadow-lg hover:shadow-primary-500/30"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon className="size-5" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                            Liên kết
                        </h3>
                        <ul className="mt-6 space-y-4">
                            {navigation.main.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-neutral-400 transition-colors hover:text-primary-400"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Locations */}
                    <div className="lg:col-span-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                            Địa điểm
                        </h3>
                        <ul className="mt-6 space-y-6">
                            {navigation.locations.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-start gap-3"
                                    >
                                        <MapPinIcon className="size-5 shrink-0 text-primary-500" />
                                        <div>
                                            <p className="font-medium text-white transition-colors group-hover:text-primary-400">
                                                {item.name}
                                            </p>
                                            <p className="mt-1 text-sm text-neutral-400">
                                                {item.address}
                                            </p>
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="lg:col-span-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                            Liên hệ
                        </h3>
                        <ul className="mt-6 space-y-4">
                            <li>
                                <a
                                    href="tel:0368483689"
                                    className="flex items-center gap-3 text-neutral-400 transition-colors hover:text-primary-400"
                                >
                                    <PhoneIcon className="size-5 text-primary-500" />
                                    036 848 3689
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:nerd.society98@gmail.com"
                                    className="flex items-center gap-3 text-neutral-400 transition-colors hover:text-primary-400"
                                >
                                    <EnvelopeIcon className="size-5 text-primary-500" />
                                    nerd.society98@gmail.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://nerdsociety.com.vn"
                                    className="flex items-center gap-3 text-neutral-400 transition-colors hover:text-primary-400"
                                >
                                    <GlobeAltIcon className="size-5 text-primary-500" />
                                    nerdsociety.com.vn
                                </a>
                            </li>
                        </ul>

                        {/* Opening hours */}
                        <div className="mt-8 rounded-xl bg-white/5 p-4">
                            <p className="text-sm font-medium text-white">Giờ mở cửa</p>
                            <p className="mt-1 text-sm text-primary-400">24/7 - Mở cửa cả tuần</p>
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
                    <p className="text-sm text-neutral-500">
                        © 2025 Nerd Society. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-neutral-500">
                        <Link href="#" className="transition-colors hover:text-neutral-300">
                            Điều khoản sử dụng
                        </Link>
                        <Link href="#" className="transition-colors hover:text-neutral-300">
                            Chính sách bảo mật
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
