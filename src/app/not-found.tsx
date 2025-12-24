'use client'

import Link from 'next/link'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="text-center">
        {/* 404 Number */}
        <div className="relative">
          <span className="text-[150px] font-black leading-none text-primary-100 sm:text-[200px] dark:text-primary-900/30">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 sm:size-24">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 sm:size-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="mt-4 text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-white">
          Oops! Trang không tồn tại
        </h1>
        <p className="mx-auto mt-4 max-w-md text-neutral-500 dark:text-neutral-400">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600 hover:shadow-primary-500/40"
          >
            <HomeIcon className="size-5" />
            Về trang chủ
          </Link>
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 font-semibold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <ArrowLeftIcon className="size-5" />
            Quay lại
          </button>
        </div>

        {/* Brand */}
        <div className="mt-16 text-sm text-neutral-400 dark:text-neutral-500">
          <span className="font-bold tracking-wider text-primary-600 dark:text-primary-400">NERD SOCIETY</span>
          <span className="mx-2">•</span>
          <span>Study & Work Space</span>
        </div>
      </div>
    </div>
  )
}
