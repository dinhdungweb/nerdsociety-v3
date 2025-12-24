'use client'

import BookingForm from '@/components/booking/BookingForm'
import ComboSelector from '@/components/booking/ComboSelector'
import LocationSelector from '@/components/booking/LocationSelector'
import { CheckIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const steps = [
    { id: 1, name: 'Chọn cơ sở' },
    { id: 2, name: 'Chọn gói dịch vụ' },
    { id: 3, name: 'Thời gian' },
]

export default function BookingWizard({ locations, combos }: { locations: any[]; combos: any[] }) {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [currentStep, setCurrentStep] = useState(1)

    // Booking State
    const [selectedLocation, setSelectedLocation] = useState<string>('')
    const [selectedCombo, setSelectedCombo] = useState<string>('')
    const [date, setDate] = useState<Date | null>(null)
    const [time, setTime] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const handleLocationSelect = (id: string) => {
        setSelectedLocation(id)
        setCurrentStep(2)
    }

    const handleComboSelect = (combo: any) => {
        setSelectedCombo(combo.id)
        setCurrentStep(3)
    }

    const handleSubmit = async () => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/booking')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locationId: selectedLocation,
                    comboId: selectedCombo,
                    date: date,
                    startTime: time,
                }),
            })

            if (response.ok) {
                const booking = await response.json()
                router.push(`/booking/success?id=${booking.id}`)
            } else {
                const data = await response.json()
                alert(data.error || 'Có lỗi xảy ra, vui lòng thử lại')
            }
        } catch (error) {
            console.error(error)
            alert('Có lỗi xảy ra, vui lòng thử lại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {/* Steps Indicator */}
            <div className="mb-12">
                <div className="relative flex items-center justify-between">
                    {/* Progress Bar Container - positioned behind step circles */}
                    <div className="absolute left-[50px] right-[50px] top-5 h-0.5">
                        {/* Background line */}
                        <div className="absolute inset-0 bg-neutral-700" />

                        {/* Active progress line */}
                        <div
                            className="absolute inset-y-0 left-0 bg-primary-500 transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    {steps.map((step) => {
                        const isCompleted = currentStep > step.id
                        const isCurrent = currentStep === step.id

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div
                                    className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors duration-300 ${isCompleted
                                        ? 'border-primary-500 bg-primary-500 text-white'
                                        : isCurrent
                                            ? 'border-primary-500 bg-neutral-950 text-primary-500'
                                            : 'border-neutral-700 bg-neutral-950 text-neutral-400'
                                        }`}
                                >
                                    {isCompleted ? <CheckIcon className="size-6" /> : <span>{step.id}</span>}
                                </div>
                                <span className={`text-sm font-medium ${isCurrent ? 'text-primary-400' : 'text-neutral-400'
                                    }`}>
                                    {step.name}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-4xl">
                {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
                            Chọn cơ sở gần bạn
                        </h2>
                        <LocationSelector
                            locations={locations}
                            selectedLocationId={selectedLocation}
                            onSelect={handleLocationSelect}
                        />
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Chọn gói dịch vụ
                            </h2>
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                                ← Quay lại
                            </button>
                        </div>
                        <ComboSelector
                            combos={combos}
                            selectedComboId={selectedCombo}
                            onSelect={handleComboSelect}
                        />
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Chọn thời gian
                            </h2>
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                                ← Quay lại
                            </button>
                        </div>
                        <BookingForm
                            selectedDate={date}
                            selectedTime={time}
                            onDateChange={setDate}
                            onTimeChange={setTime}
                            onSubmit={handleSubmit}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
