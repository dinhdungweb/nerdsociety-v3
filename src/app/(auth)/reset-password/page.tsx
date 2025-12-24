'use client'

import { Suspense } from 'react'
import { Button } from '@/shared/Button'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import authBg from '../../../../public/images/auth-bg.png'

// Coffee cup icon for logo
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h15a3 3 0 013 3v1a3 3 0 01-3 3h-1.5M3 8v8a4 4 0 004 4h5a4 4 0 004-4v-3M3 8l1-4h13l1 4M7.5 8v1.5m4-1.5v1.5" />
    </svg>
)

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div></div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Liên kết không hợp lệ. Vui lòng kiểm tra lại email của bạn.')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Đã xảy ra lỗi')
            }

            setSuccess(true)
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-neutral-800 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Thành công!</h2>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng đến trang đăng nhập...
                    </p>
                    <div className="mt-6 flex justify-center">
                        <div className="size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen">
            {/* Left side - Form */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    {/* Logo */}
                    <Link href="/" className="mb-8 flex items-center gap-2.5">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
                            <CoffeeIcon className="size-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-neutral-900 dark:text-white">Nerd Society</span>
                            <span className="text-xs font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
                                Study & Work Space
                            </span>
                        </div>
                    </Link>

                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Đặt lại mật khẩu</h1>
                    <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                        Nhập mật khẩu mới cho tài khoản của bạn.
                    </p>

                    {/* Error message */}
                    {error && (
                        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={!token}
                                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-12 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white disabled:bg-neutral-100 disabled:text-neutral-500 dark:disabled:bg-neutral-700"
                                    placeholder="Ít nhất 6 ký tự"
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

                        <div>
                            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={!token}
                                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white disabled:bg-neutral-100 disabled:text-neutral-500 dark:disabled:bg-neutral-700"
                                placeholder="Nhập lại mật khẩu"
                            />
                        </div>

                        <Button
                            type="submit"
                            color="primary"
                            className="w-full justify-center py-3"
                            disabled={loading || !token}
                        >
                            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                        </Button>
                    </form>
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
