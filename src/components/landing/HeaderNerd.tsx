'use client'

import { ThemeContext } from '@/app/theme-provider'
import { Button } from '@/shared/Button'
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems, Transition, TransitionChild } from '@headlessui/react'
import {
    ArrowRightStartOnRectangleIcon,
    Bars3Icon,
    CalendarDaysIcon,
    CreditCardIcon,
    MoonIcon,
    SunIcon,
    UserCircleIcon,
    UserIcon,
    UserPlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Fragment, useContext, useEffect, useState } from 'react'

const navigation = [
    { name: 'Giới thiệu', href: '/#about' },
    { name: 'Không gian', href: '/#gallery' },
    { name: 'Bảng giá', href: '/#combos' },
    { name: 'Địa điểm', href: '/#locations' },
    { name: 'Tin tức', href: '/#news' },
    { name: 'Liên hệ', href: '/#contact' },
]

// Coffee cup icon for logo
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h15a3 3 0 013 3v1a3 3 0 01-3 3h-1.5M3 8v8a4 4 0 004 4h5a4 4 0 004-4v-3M3 8l1-4h13l1 4M7.5 8v1.5m4-1.5v1.5" />
    </svg>
)

export default function HeaderNerd({ logoUrl, logoLightUrl }: { logoUrl?: string, logoLightUrl?: string }) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [userAvatar, setUserAvatar] = useState<string | null>(null)
    const themeContext = useContext(ThemeContext)
    const { data: session } = useSession()

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Fetch user avatar from database
    useEffect(() => {
        if (session?.user?.id) {
            fetch('/api/auth/user-avatar')
                .then(res => res.json())
                .then(data => setUserAvatar(data.avatar))
                .catch(() => setUserAvatar(null))
        }
    }, [session?.user?.id])

    const toggleTheme = () => {
        themeContext?.toggleDarkMode()
    }

    const isDarkMode = themeContext?.isDarkMode ?? false

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-white/95 shadow-md backdrop-blur-xl dark:bg-neutral-900/95'
                : 'bg-transparent'
                }`}
        >
            <nav className="container">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2.5">
                        {(logoUrl || logoLightUrl) ? (
                            <div className="relative h-10 w-auto overflow-hidden transition-transform group-hover:scale-105">
                                <img
                                    src={isDarkMode && logoLightUrl ? logoLightUrl : (logoUrl || logoLightUrl)}
                                    alt="Nerd Society"
                                    className="h-full w-auto object-contain"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-105">
                                    <CoffeeIcon className="size-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold leading-tight text-neutral-900 dark:text-white">
                                        Nerd Society
                                    </span>
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
                                        Study & Work Space
                                    </span>
                                </div>
                            </>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center lg:flex">
                        <div className="flex items-center rounded-full bg-neutral-100/80 p-1.5 backdrop-blur-sm dark:bg-neutral-800/80">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 transition-all hover:bg-white hover:text-primary-600 hover:shadow-sm dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-primary-400"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop CTA & Actions */}
                    <div className="hidden items-center gap-3 lg:flex">
                        {/* Dark mode toggle */}
                        {mounted && (
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <SunIcon className="size-5" />
                                ) : (
                                    <MoonIcon className="size-5" />
                                )}
                            </button>
                        )}



                        {session ? (
                            <Menu as="div" className="relative">
                                <MenuButton className="flex cursor-pointer items-center gap-2 rounded-xl bg-white p-1 pr-3 shadow-md transition-shadow hover:shadow-lg dark:bg-neutral-800">
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt={session.user.name || 'User'}
                                            className="size-8 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
                                            <span className="text-xs font-bold">
                                                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                        {session.user?.name}
                                    </span>
                                </MenuButton>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-neutral-100 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:divide-neutral-700 dark:bg-neutral-800 dark:ring-white/5">
                                        <div className="px-4 py-3">
                                            <p className="text-sm text-neutral-900 dark:text-white">Xin chào,</p>
                                            <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{session.user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <MenuItem>
                                                {({ active }) => (
                                                    <Link
                                                        href="/profile"
                                                        className={`${active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                                            } flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                                                    >
                                                        <UserIcon className="mr-3 size-5 text-neutral-400" />
                                                        Tài khoản của tôi
                                                    </Link>
                                                )}
                                            </MenuItem>
                                            <MenuItem>
                                                {({ active }) => (
                                                    <Link
                                                        href="/profile"
                                                        className={`${active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                                            } flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                                                    >
                                                        <CalendarDaysIcon className="mr-3 size-5 text-neutral-400" />
                                                        Lịch sử đặt chỗ
                                                    </Link>
                                                )}
                                            </MenuItem>
                                        </div>
                                        <div className="py-1">
                                            <MenuItem>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => signOut()}
                                                        className={`${active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                                            } flex w-full cursor-pointer items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                                                    >
                                                        <ArrowRightStartOnRectangleIcon className="mr-3 size-5" />
                                                        Đăng xuất
                                                    </button>
                                                )}
                                            </MenuItem>
                                        </div>
                                    </MenuItems>
                                </Transition>
                            </Menu>
                        ) : (
                            <>
                                <Menu as="div" className="relative">
                                    <MenuButton className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
                                        <UserIcon className="size-5" />
                                    </MenuButton>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-neutral-800 dark:ring-white/5">
                                            <MenuItem>
                                                {({ active }) => (
                                                    <Link
                                                        href="/login"
                                                        className={`${active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                                            } flex items-center rounded-lg px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                                                    >
                                                        <ArrowRightStartOnRectangleIcon className="mr-3 size-5 text-neutral-400" />
                                                        Đăng nhập
                                                    </Link>
                                                )}
                                            </MenuItem>
                                            <MenuItem>
                                                {({ active }) => (
                                                    <Link
                                                        href="/signup"
                                                        className={`${active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                                            } flex items-center rounded-lg px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                                                    >
                                                        <UserPlusIcon className="mr-3 size-5 text-neutral-400" />
                                                        Đăng ký
                                                    </Link>
                                                )}
                                            </MenuItem>
                                        </MenuItems>
                                    </Transition>
                                </Menu>
                                <Button
                                    color="primary"
                                    href="/booking"
                                    className="shadow-lg shadow-primary-500/25"
                                >
                                    Đặt lịch ngay
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button & dark mode */}
                    <div className="flex items-center gap-2 lg:hidden">
                        {mounted && (
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <SunIcon className="size-5" />
                                ) : (
                                    <MoonIcon className="size-5" />
                                )}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                        >
                            <span className="sr-only">Open menu</span>
                            <Bars3Icon className="size-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            <Transition show={mobileMenuOpen} as={Fragment}>
                <Dialog as="div" className="lg:hidden" onClose={setMobileMenuOpen}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
                    </TransitionChild>

                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-x-full"
                        enterTo="opacity-100 translate-x-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-x-0"
                        leaveTo="opacity-0 translate-x-full"
                    >
                        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white px-6 py-6 dark:bg-neutral-900">
                            {/* Mobile header */}
                            <div className="flex items-center justify-between">
                                {/* Logo */}
                                <Link href="/" className="group flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                                    {(logoUrl || logoLightUrl) ? (
                                        <div className="relative h-10 w-auto overflow-hidden transition-transform group-hover:scale-105">
                                            <img
                                                src={isDarkMode && logoLightUrl ? logoLightUrl : (logoUrl || logoLightUrl)}
                                                alt="Nerd Society"
                                                className="h-full w-auto object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-105">
                                                <CoffeeIcon className="size-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold leading-tight text-neutral-900 dark:text-white">
                                                    Nerd Society
                                                </span>
                                                <span className="text-[10px] font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
                                                    Study & Work Space
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <span className="sr-only">Close menu</span>
                                    <XMarkIcon className="size-6" aria-hidden="true" />
                                </button>
                            </div>

                            {/* Mobile navigation */}
                            <div className="mt-8 flow-root">
                                <div className="space-y-1">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block rounded-xl px-4 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Authenticated Mobile Menu */}
                                {session ? (
                                    <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                                        <div className="px-4 py-2">
                                            <div className="flex items-center gap-3">
                                                {userAvatar ? (
                                                    <img
                                                        src={userAvatar}
                                                        alt={session.user.name || 'User'}
                                                        className="size-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
                                                        <span className="text-sm font-bold">
                                                            {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">{session.user?.name}</p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{session.user?.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="block rounded-xl px-4 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
                                        >
                                            Tài khoản của tôi
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="block rounded-xl px-4 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
                                        >
                                            Lịch sử đặt chỗ
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="block w-full cursor-pointer rounded-xl px-4 py-3 text-left text-base font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-6 flex gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
                                        <Link
                                            href="/login"
                                            className="flex-1 rounded-xl bg-neutral-100 px-4 py-3 text-center text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="flex-1 rounded-xl bg-primary-50 px-4 py-3 text-center text-base font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                                        >
                                            Đăng ký
                                        </Link>
                                    </div>
                                )}

                                {/* Mobile contact info */}
                                <div className="mt-6">
                                    <p className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                        Liên hệ với chúng tôi
                                    </p>
                                    <a
                                        href="tel:0368483689"
                                        className="flex items-center gap-3 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800"
                                    >
                                        <div className="flex size-10 items-center justify-center rounded-full bg-primary-500 text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Hotline</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white">036 848 3689</p>
                                        </div>
                                    </a>
                                </div>

                                {/* Mobile CTA */}
                                {!session && (
                                    <div className="mt-6">
                                        <Button
                                            color="primary"
                                            href="/booking"
                                            className="w-full justify-center py-3"
                                        >
                                            Đặt lịch ngay
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>
        </header >
    )
}
