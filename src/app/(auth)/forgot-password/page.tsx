'use client'

import { Button } from '@/shared/Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import authBg from '../../../../public/images/auth-bg.png'

// Coffee cup icon for logo
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h15a3 3 0 013 3v1a3 3 0 01-3 3h-1.5M3 8v8a4 4 0 004 4h5a4 4 0 004-4v-3M3 8l1-4h13l1 4M7.5 8v1.5m4-1.5v1.5" />
  </svg>
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Đã xảy ra lỗi')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="size-4" />
            Quay lại đăng nhập
          </Link>

          {/* Logo */}
          <Link href="/" className="mb-6 flex items-center gap-2.5">
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

          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quên mật khẩu?</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>

          {/* Success message */}
          {success ? (
            <div className="mt-8 rounded-xl bg-green-50 p-6 text-center dark:bg-green-900/20">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-900 dark:text-green-300">Đã gửi email!</h3>
              <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                Vui lòng kiểm tra hộp thư đến (và cả mục Spam) để nhận liên kết đặt lại mật khẩu.
              </p>
              <Button
                color="zinc"
                className="mt-6 w-full justify-center"
                onClick={() => setSuccess(false)}
              >
                Gửi lại email
              </Button>
            </div>
          ) : (
            <>
              {/* Error message */}
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Email đăng ký
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

                <Button
                  type="submit"
                  color="primary"
                  className="w-full justify-center py-3"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
                </Button>
              </form>
            </>
          )}
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
