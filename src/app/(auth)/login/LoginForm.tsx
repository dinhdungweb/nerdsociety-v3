'use client'

import { Button } from '@/shared/Button'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import authBg from '../../../../public/images/auth-bg.png'

// Coffee cup icon for logo (fallback)
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h15a3 3 0 013 3v1a3 3 0 01-3 3h-1.5M3 8v8a4 4 0 004 4h5a4 4 0 004-4v-3M3 8l1-4h13l1 4M7.5 8v1.5m4-1.5v1.5" />
    </svg>
)

interface LoginFormProps {
    logoUrl?: string
    logoLightUrl?: string
}

export default function LoginForm({ logoUrl, logoLightUrl }: LoginFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            } else {
                router.push(callbackUrl)
                router.refresh()
            }
        } catch (err) {
            setError('Đã xảy ra lỗi. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left side - Form */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    {/* Logo */}
                    <Link href="/" className="mb-8 flex items-center gap-2.5">
                        {logoUrl || logoLightUrl ? (
                            <div className="relative h-12 w-auto overflow-hidden transition-transform hover:scale-105">
                                {/* Light mode logo */}
                                <img
                                    src={logoUrl || logoLightUrl}
                                    alt="Nerd Society"
                                    className={`h-full w-auto object-contain ${logoLightUrl ? 'dark:hidden' : ''}`}
                                />
                                {/* Dark mode logo (if available) */}
                                {logoLightUrl && (
                                    <img
                                        src={logoLightUrl}
                                        alt="Nerd Society"
                                        className="hidden h-full w-auto object-contain dark:block"
                                    />
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex size-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
                                    <CoffeeIcon className="size-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-neutral-900 dark:text-white">Nerd Society</span>
                                    <span className="text-xs font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
                                        Study & Work Space
                                    </span>
                                </div>
                            </>
                        )}
                    </Link>

                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Đăng nhập</h1>
                    <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                        Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.
                    </p>

                    {/* Error message */}
                    {error && (
                        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-12 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                >
                                    {showPassword ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="size-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 dark:border-neutral-600"
                                />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            color="primary"
                            className="w-full justify-center py-3"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        Chưa có tài khoản?{' '}
                        <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Image */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <Image
                    src={authBg}
                    alt="Nerd Society Workspace"
                    fill
                    className="absolute inset-0 size-full object-cover"
                    placeholder="blur"
                />
                <div className="absolute inset-0 bg-primary-900/40" />
            </div>
        </div>
    )
}
