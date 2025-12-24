'use client'

import { Button } from '@/shared/Button'
import {
    BanknotesIcon,
    BuildingLibraryIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ClipboardDocumentIcon,
    ExclamationTriangleIcon,
    LightBulbIcon,
    MapPinIcon,
    QrCodeIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface BookingInfo {
    id: string
    bookingCode: string
    customerName: string
    customerPhone: string
    date: string
    startTime: string
    endTime: string
    guests: number
    estimatedAmount: number
    depositAmount: number
    createdAt: string
    paymentStartedAt: string | null // Thời điểm bắt đầu thanh toán (khi chọn phương thức)
    location: {
        id: string
        name: string
        address: string
    }
    room: {
        id: string
        name: string
        type: string
    }
    payment: {
        id: string
        method: string
        status: string
    } | null
}

interface PaymentInfo {
    qrUrl: string
    bankCode: string
    accountNumber: string
    accountName: string
    amount: number
    description: string
    bookingCode: string
    bookingId: string
}

type PaymentMethodOption = {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    disabled?: boolean
    comingSoon?: boolean
}

const paymentMethods: PaymentMethodOption[] = [
    {
        id: 'BANK_TRANSFER',
        name: 'Chuyển khoản (VietQR)',
        description: 'Quét mã QR bằng app ngân hàng',
        icon: <QrCodeIcon className="size-5" />,
    },
    {
        id: 'VNPAY',
        name: 'VNPay',
        description: 'Thanh toán qua cổng VNPay',
        icon: <BuildingLibraryIcon className="size-5" />,
        disabled: true,
        comingSoon: true,
    },
    {
        id: 'MOMO',
        name: 'MoMo',
        description: 'Thanh toán qua ví MoMo',
        icon: <BanknotesIcon className="size-5" />,
        disabled: true,
        comingSoon: true,
    },
    {
        id: 'CASH',
        name: 'Thanh toán tại quầy',
        description: 'Thanh toán khi đến check-in',
        icon: <BanknotesIcon className="size-5" />,
        disabled: true,
        comingSoon: true,
    },
]

import { Suspense } from 'react'

const CheckoutContent = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const bookingId = searchParams.get('id')
    const stepParam = searchParams.get('step') // Track if user is on QR step

    const [loading, setLoading] = useState(true)
    const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null)
    const [selectedMethod, setSelectedMethod] = useState<string>('BANK_TRANSFER')
    const [processing, setProcessing] = useState(false)
    const [showQR, setShowQR] = useState(false)

    // VietQR specific state
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
    const [copied, setCopied] = useState<string | null>(null)
    const [confirming, setConfirming] = useState(false)
    const [countdown, setCountdown] = useState(5 * 60) // 5 minutes - matches API timeout

    useEffect(() => {
        if (!bookingId) {
            router.push('/booking')
            return
        }

        const fetchBookingInfo = async () => {
            try {
                const res = await fetch(`/api/booking/${bookingId}`)
                if (res.ok) {
                    const data = await res.json()
                    setBookingInfo(data.booking)

                    // Calculate remaining time based on paymentStartedAt (when user selected payment)
                    // If paymentStartedAt is not set yet, show full 5 minutes
                    if (data.booking.paymentStartedAt) {
                        const paymentStarted = new Date(data.booking.paymentStartedAt)
                        const now = new Date()
                        const elapsedSeconds = Math.floor((now.getTime() - paymentStarted.getTime()) / 1000)
                        const remainingSeconds = Math.max(0, 5 * 60 - elapsedSeconds)
                        setCountdown(remainingSeconds)
                    } else {
                        // Timer hasn't started yet - show full 5 minutes
                        setCountdown(5 * 60)
                    }

                    // If payment already selected AND user is on QR step (via URL param), restore that state
                    if (data.booking.payment?.method) {
                        setSelectedMethod(data.booking.payment.method)
                        // Only auto-show QR if step=qr param is present (user explicitly proceeded)
                        if (data.booking.payment.method === 'BANK_TRANSFER' && stepParam === 'qr') {
                            fetchVietQRInfo()
                            setShowQR(true)
                        }
                    }
                } else {
                    toast.error('Không tìm thấy thông tin đặt phòng')
                    router.push('/booking')
                }
            } catch (error) {
                console.error('Error fetching booking info:', error)
                toast.error('Có lỗi xảy ra')
            } finally {
                setLoading(false)
            }
        }

        const fetchVietQRInfo = async () => {
            try {
                const res = await fetch(`/api/payment/vietqr/info?bookingId=${bookingId}`)
                if (res.ok) {
                    const data = await res.json()
                    setPaymentInfo(data)
                }
            } catch (error) {
                console.error('Error fetching VietQR info:', error)
            }
        }

        fetchBookingInfo()
    }, [bookingId, router])

    // Countdown timer for VietQR
    useEffect(() => {
        if (!showQR || !paymentInfo) return

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 0) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [showQR, paymentInfo])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleProceedToPayment = async () => {
        if (!selectedMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán')
            return
        }

        setProcessing(true)
        try {
            const res = await fetch('/api/payment/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, method: selectedMethod }),
            })

            if (res.ok) {
                if (selectedMethod === 'BANK_TRANSFER') {
                    const qrRes = await fetch(`/api/payment/vietqr/info?bookingId=${bookingId}`)
                    if (qrRes.ok) {
                        const qrData = await qrRes.json()
                        setPaymentInfo(qrData)
                        setShowQR(true)
                        // Update URL to track QR step
                        router.replace(`/booking/payment?id=${bookingId}&step=qr`, { scroll: false })
                    }
                } else if (selectedMethod === 'CASH') {
                    toast.success('Đã ghi nhận! Vui lòng thanh toán tại quầy khi check-in.')
                    router.push(`/profile/bookings`)
                } else {
                    // VNPay, MoMo - show coming soon message
                    toast.error('Phương thức này sẽ sớm được hỗ trợ!')
                }
            } else {
                const error = await res.json()
                toast.error(error.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error selecting payment method:', error)
            toast.error('Có lỗi xảy ra')
        } finally {
            setProcessing(false)
        }
    }

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopied(field)
        toast.success('Đã sao chép!')
        setTimeout(() => setCopied(null), 2000)
    }

    const handleConfirmPayment = async () => {
        setConfirming(true)
        try {
            const res = await fetch('/api/payment/vietqr/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId }),
            })

            if (res.ok) {
                toast.success('Đã ghi nhận thanh toán! Đang chờ xác nhận.')
                router.push(`/booking/pending?id=${bookingId}`)
            } else {
                const error = await res.json()
                toast.error(error.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error confirming payment:', error)
            toast.error('Có lỗi xảy ra')
        } finally {
            setConfirming(false)
        }
    }

    const handleBack = () => {
        setShowQR(false)
        setPaymentInfo(null)
        setCountdown(5 * 60)
        // Remove step param from URL
        router.replace(`/booking/payment?id=${bookingId}`, { scroll: false })
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                <div className="animate-pulse text-lg text-neutral-600">Đang tải...</div>
            </div>
        )
    }

    if (!bookingInfo) {
        return null
    }

    // Show VietQR payment view
    if (showQR && paymentInfo) {
        return (
            <div className="min-h-screen bg-neutral-50 py-8 dark:bg-neutral-950">
                <div className="container">
                    <div className="mx-auto max-w-4xl">
                        {/* Header */}
                        <div className="mb-6">
                            <button
                                onClick={handleBack}
                                className="mb-4 cursor-pointer text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                            >
                                ← Quay lại chọn phương thức
                            </button>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Thanh toán chuyển khoản
                            </h1>
                            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                                Mã đặt phòng: <span className="font-semibold">{paymentInfo.bookingCode}</span>
                            </p>
                        </div>

                        {/* Timer */}
                        <div className="mb-6 rounded-xl bg-yellow-50 p-4 text-center dark:bg-yellow-900/20">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                Thời gian còn lại để thanh toán
                            </p>
                            <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-300">
                                {formatTime(countdown)}
                            </p>
                        </div>

                        {/* QR Code Card */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* QR Code */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
                                <div className="flex justify-center">
                                    <div className="overflow-hidden rounded-xl border-4 border-primary-500 p-2">
                                        <Image
                                            src={paymentInfo.qrUrl}
                                            alt="VietQR Payment"
                                            width={300}
                                            height={300}
                                            className="rounded-lg"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Số tiền cần thanh toán
                                    </p>
                                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                        {new Intl.NumberFormat('vi-VN').format(paymentInfo.amount)}đ
                                    </p>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="space-y-4">
                                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
                                    <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">
                                        Thông tin chuyển khoản
                                    </h3>
                                    <div className="space-y-3">
                                        <PaymentDetailRow
                                            label="Ngân hàng"
                                            value={paymentInfo.bankCode}
                                            onCopy={() => copyToClipboard(paymentInfo.bankCode, 'bank')}
                                            copied={copied === 'bank'}
                                        />
                                        <PaymentDetailRow
                                            label="Số tài khoản"
                                            value={paymentInfo.accountNumber}
                                            onCopy={() => copyToClipboard(paymentInfo.accountNumber, 'account')}
                                            copied={copied === 'account'}
                                        />
                                        <PaymentDetailRow
                                            label="Chủ tài khoản"
                                            value={paymentInfo.accountName}
                                            onCopy={() => copyToClipboard(paymentInfo.accountName, 'name')}
                                            copied={copied === 'name'}
                                        />
                                        <PaymentDetailRow
                                            label="Nội dung CK"
                                            value={paymentInfo.description}
                                            onCopy={() => copyToClipboard(paymentInfo.description, 'desc')}
                                            copied={copied === 'desc'}
                                            highlight
                                        />
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                    <ExclamationTriangleIcon className="mt-0.5 size-4 flex-shrink-0" />
                                    <span>Vui lòng nhập <strong>đúng nội dung chuyển khoản</strong></span>
                                </div>

                                {/* Confirm Button */}
                                <Button
                                    onClick={handleConfirmPayment}
                                    disabled={confirming}
                                    className="w-full"
                                >
                                    <CheckCircleIcon className="mr-2 size-5" />
                                    {confirming ? 'Đang xác nhận...' : 'Tôi đã thanh toán'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show method selection (2-column layout)
    return (
        <div className="min-h-screen bg-neutral-50 py-8 dark:bg-neutral-950">
            <div className="container">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Thanh toán đặt cọc
                        </h1>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                            Mã đặt phòng: <span className="font-semibold">{bookingInfo.bookingCode}</span>
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column - Booking Summary */}
                        <div className="space-y-4">
                            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
                                <h3 className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    THÔNG TIN ĐẶT PHÒNG
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="mt-0.5 size-5 flex-shrink-0 text-neutral-400" />
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-white">
                                                {bookingInfo.location.name}
                                            </p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {bookingInfo.room.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CalendarDaysIcon className="mt-0.5 size-5 flex-shrink-0 text-neutral-400" />
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-white">
                                                {new Date(bookingInfo.date).toLocaleDateString('vi-VN', {
                                                    weekday: 'long',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {bookingInfo.startTime} - {bookingInfo.endTime}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <UserGroupIcon className="mt-0.5 size-5 flex-shrink-0 text-neutral-400" />
                                        <p className="font-medium text-neutral-900 dark:text-white">
                                            {bookingInfo.guests} người
                                        </p>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">Tổng tiền:</span>
                                        <span className="font-medium text-neutral-900 dark:text-white">
                                            {new Intl.NumberFormat('vi-VN').format(bookingInfo.estimatedAmount)}đ
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="font-medium text-primary-700 dark:text-primary-300">
                                            Đặt cọc (50%):
                                        </span>
                                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                            {new Intl.NumberFormat('vi-VN').format(bookingInfo.depositAmount)}đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                <LightBulbIcon className="mt-0.5 size-4 flex-shrink-0" />
                                <span>Phòng sẽ được giữ sau khi bạn thanh toán cọc 50%. Số tiền còn lại thanh toán khi check-out dựa trên thời gian sử dụng thực tế.</span>
                            </div>
                        </div>

                        {/* Right Column - Payment Methods */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
                            <h3 className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                CHỌN PHƯƠNG THỨC THANH TOÁN
                            </h3>

                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${method.disabled
                                            ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-60 dark:border-neutral-700 dark:bg-neutral-800'
                                            : selectedMethod === method.id
                                                ? 'cursor-pointer border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
                                                : 'cursor-pointer border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={selectedMethod === method.id}
                                            onChange={() => !method.disabled && setSelectedMethod(method.id)}
                                            disabled={method.disabled}
                                            className="size-4 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
                                        />
                                        <div className={`rounded-full p-2 ${method.disabled
                                            ? 'bg-neutral-200 text-neutral-400 dark:bg-neutral-700'
                                            : selectedMethod === method.id
                                                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                                            }`}>
                                            {method.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-medium ${method.disabled
                                                    ? 'text-neutral-400 dark:text-neutral-500'
                                                    : 'text-neutral-900 dark:text-white'
                                                    }`}>
                                                    {method.name}
                                                </p>
                                                {method.comingSoon && (
                                                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        Sắp có
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {method.description}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Proceed Button */}
                            <div className="mt-6">
                                <Button
                                    onClick={handleProceedToPayment}
                                    disabled={processing || !selectedMethod}
                                    className="w-full"
                                >
                                    {processing ? 'Đang xử lý...' : `Thanh toán ${new Intl.NumberFormat('vi-VN').format(bookingInfo.depositAmount)}đ`}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PaymentDetailRow({
    label,
    value,
    onCopy,
    copied,
    highlight = false
}: {
    label: string
    value: string
    onCopy: () => void
    copied: boolean
    highlight?: boolean
}) {
    return (
        <div className={`flex items-center justify-between rounded-lg p-3 ${highlight
            ? 'bg-primary-50 dark:bg-primary-900/20'
            : 'bg-neutral-50 dark:bg-neutral-800'
            }`}>
            <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
                <p className={`font-medium ${highlight
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-neutral-900 dark:text-white'
                    }`}>
                    {value}
                </p>
            </div>
            <button
                onClick={onCopy}
                className="cursor-pointer rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
            >
                {copied ? (
                    <CheckCircleIcon className="size-5 text-green-500" />
                ) : (
                    <ClipboardDocumentIcon className="size-5" />
                )}
            </button>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
            <div className="animate-pulse text-lg text-neutral-600">Đang tải...</div>
        </div>}>
            <CheckoutContent />
        </Suspense>
    )
}
