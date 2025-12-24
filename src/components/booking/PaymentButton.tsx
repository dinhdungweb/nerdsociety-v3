'use client'


import { Button } from '@/shared/Button'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface PaymentButtonProps {
    bookingId: string
    amount: number
}

export default function PaymentButton({ bookingId, amount }: PaymentButtonProps) {
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'VNPAY' | 'MOMO'>('BANK_TRANSFER')
    const router = useRouter()

    const handlePayment = async () => {
        setLoading(true)
        try {
            if (paymentMethod === 'BANK_TRANSFER') {
                // Redirect to VietQR payment page
                router.push(`/booking/payment?id=${bookingId}`)
            } else if (paymentMethod === 'VNPAY') {
                // ... Existing VNPay logic (disabled for now) ...
            }
        } catch (error) {
            console.error(error)
            toast.error('Đã xảy ra lỗi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Chọn phương thức thanh toán:
                </p>
                <div className="space-y-2">
                    {/* Bank Transfer (VietQR) - Default */}
                    <label className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 shadow-sm transition-all ${paymentMethod === 'BANK_TRANSFER'
                        ? 'border-primary-500 bg-white ring-1 ring-primary-500 dark:bg-neutral-900'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800'
                        }`}>
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="payment"
                                value="BANK_TRANSFER"
                                checked={paymentMethod === 'BANK_TRANSFER'}
                                onChange={() => setPaymentMethod('BANK_TRANSFER')}
                                className="text-primary-500 focus:ring-primary-500"
                            />
                            <div className="flex flex-col">
                                <span className="font-medium text-neutral-900 dark:text-white">Chuyển khoản (VietQR)</span>
                                <span className="text-xs text-neutral-500">Quét mã QR - Xác nhận ngay</span>
                            </div>
                        </div>
                        <QrCodeIcon className="h-6 w-6 text-neutral-400" />
                    </label>

                    {/* VNPay - Coming Soon */}
                    <label className="flex cursor-not-allowed items-center justify-between rounded-lg border border-neutral-200 bg-neutral-100 p-3 opacity-60 dark:border-neutral-700 dark:bg-neutral-800">
                        <div className="flex items-center gap-3">
                            <input type="radio" name="payment" disabled className="text-neutral-400" />
                            <span className="font-medium text-neutral-500">VNPay (Sắp có)</span>
                        </div>
                        <img src="https://vnpay.vn/assets/images/logo-icon/logo-primary.svg" alt="VNPay" className="h-6 opacity-50" />
                    </label>

                    {/* MoMo - Coming soon */}
                    <label className="flex cursor-not-allowed items-center justify-between rounded-lg border border-neutral-200 bg-neutral-100 p-3 opacity-60 dark:border-neutral-700 dark:bg-neutral-800">
                        <div className="flex items-center gap-3">
                            <input type="radio" name="payment" disabled className="text-neutral-400" />
                            <span className="font-medium text-neutral-500">MoMo (Sắp có)</span>
                        </div>
                        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-6 opacity-50" />
                    </label>
                </div>
            </div>

            <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full justify-center"
            >
                {loading ? 'Đang xử lý...' : `Thanh toán ${new Intl.NumberFormat('vi-VN').format(amount)}đ`}
            </Button>
        </div>
    )
}

