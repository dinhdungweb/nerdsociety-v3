'use client'

import BookingFormV2 from '@/components/booking/BookingFormV2'
import LocationSelector from '@/components/booking/LocationSelector'
import RoomSelector from '@/components/booking/RoomSelector'
import ServiceSelector from '@/components/booking/ServiceSelector'
import { CheckIcon, MapPinIcon, SparklesIcon, HomeModernIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { RoomType, ServiceType } from '@prisma/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Location {
    id: string
    name: string
    address: string
    image: string | null
}

interface Service {
    id: string
    name: string
    slug: string
    type: ServiceType
    description?: string | null
    priceSmall?: number | null
    priceLarge?: number | null
    priceFirstHour?: number | null
    pricePerHour?: number | null
    nerdCoinReward: number
    minDuration: number
    timeStep: number
    features: string[]
    icon?: string | null
}

interface Room {
    id: string
    name: string
    type: RoomType
    description?: string | null
    capacity: number
    amenities: string[]
    image?: string | null
}

interface BookingWizardV2Props {
    locations: Location[]
}

const steps = [
    { id: 1, name: 'Cơ sở', icon: MapPinIcon },
    { id: 2, name: 'Dịch vụ', icon: SparklesIcon },
    { id: 3, name: 'Phòng', icon: HomeModernIcon },
    { id: 4, name: 'Đặt lịch', icon: CalendarDaysIcon },
]

export default function BookingWizardV2({ locations }: BookingWizardV2Props) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Selected values
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    // Fetched data
    const [services, setServices] = useState<Service[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [loadingServices, setLoadingServices] = useState(false)
    const [loadingRooms, setLoadingRooms] = useState(false)

    // Fetch services on mount
    useEffect(() => {
        const fetchServices = async () => {
            setLoadingServices(true)
            try {
                const res = await fetch('/api/booking/services')
                const data = await res.json()
                setServices(data.services || [])
            } catch (error) {
                console.error('Error fetching services:', error)
                toast.error('Không thể tải danh sách dịch vụ')
            } finally {
                setLoadingServices(false)
            }
        }
        fetchServices()
    }, [])

    // Fetch rooms when location and service change
    useEffect(() => {
        if (!selectedLocation || !selectedService) {
            setRooms([])
            return
        }

        const fetchRooms = async () => {
            setLoadingRooms(true)
            try {
                const res = await fetch(
                    `/api/booking/rooms?locationId=${selectedLocation}&serviceType=${selectedService.type}`
                )
                const data = await res.json()
                setRooms(data.rooms || [])
            } catch (error) {
                console.error('Error fetching rooms:', error)
                toast.error('Không thể tải danh sách phòng')
            } finally {
                setLoadingRooms(false)
            }
        }
        fetchRooms()
    }, [selectedLocation, selectedService])

    // Handlers
    const handleLocationSelect = (id: string) => {
        setSelectedLocation(id)
        setSelectedRoom(null)
        setCurrentStep(2)
    }

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service)
        setSelectedRoom(null)
        setCurrentStep(3)
    }

    const handleRoomSelect = (room: Room) => {
        setSelectedRoom(room)
        setCurrentStep(4)
    }

    const handleBookingSubmit = async (data: {
        date: Date
        startTime: string
        endTime: string
        guests: number
        customerName: string
        customerPhone: string
        customerEmail?: string
        note?: string
    }) => {
        if (!selectedLocation || !selectedRoom || !selectedService) return

        setLoading(true)
        try {
            const response = await fetch('/api/booking/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: selectedRoom.id,
                    locationId: selectedLocation,
                    serviceType: selectedService.type,
                    date: format(data.date, 'yyyy-MM-dd'),
                    startTime: data.startTime,
                    endTime: data.endTime,
                    guests: data.guests,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    customerEmail: data.customerEmail,
                    note: data.note,
                }),
            })

            if (response.ok) {
                const result = await response.json()
                toast.success('Đặt phòng thành công!')

                // Redirect to payment URL hoặc success page
                if (result.paymentUrl) {
                    window.location.href = result.paymentUrl
                } else {
                    router.push(`/booking/success?id=${result.booking.id}`)
                }
            } else {
                const error = await response.json()
                toast.error(error.error || 'Có lỗi xảy ra, vui lòng thử lại')
            }
        } catch (error) {
            console.error('Booking error:', error)
            toast.error('Có lỗi xảy ra, vui lòng thử lại')
        } finally {
            setLoading(false)
        }
    }

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <div>
            {/* Modern Steps Indicator */}
            <div className="mx-auto mb-8 max-w-4xl px-4 sm:mb-12 sm:px-0">
                <div className="relative">
                    {/* Background Card */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-100/50 via-secondary-100/30 to-primary-100/50 dark:from-primary-900/20 dark:via-secondary-900/10 dark:to-primary-900/20 blur-xl" />

                    <div className="relative rounded-2xl border border-primary-200/50 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-12 sm:py-6 dark:border-primary-800/30 dark:bg-neutral-900/80">
                        {/* Progress Line Background */}
                        <div
                            className="absolute hidden h-1 rounded-full bg-neutral-200 sm:block dark:bg-neutral-700"
                            style={{
                                left: 'calc(48px + 24px)',
                                right: 'calc(48px + 24px)',
                                top: '46px'
                            }}
                        />
                        {/* Mobile Progress Line */}
                        <div
                            className="absolute h-1 rounded-full bg-neutral-200 sm:hidden dark:bg-neutral-700"
                            style={{
                                left: 'calc(16px + 20px)',
                                right: 'calc(16px + 20px)',
                                top: '36px'
                            }}
                        />

                        {/* Progress Line Fill - with spring animation */}
                        <div
                            className="absolute hidden h-1 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 sm:block"
                            style={{
                                left: 'calc(48px + 24px)',
                                top: '46px',
                                width: currentStep === 1
                                    ? '0%'
                                    : `calc((100% - 48px - 48px - 48px) * ${(currentStep - 1) / (steps.length - 1)})`,
                                transition: 'width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)' // Spring effect
                            }}
                        />
                        {/* Mobile Progress Line Fill */}
                        <div
                            className="absolute h-1 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 sm:hidden"
                            style={{
                                left: 'calc(16px + 20px)',
                                top: '36px',
                                width: currentStep === 1
                                    ? '0%'
                                    : `calc((100% - 32px - 40px) * ${(currentStep - 1) / (steps.length - 1)})`,
                                transition: 'width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                        />

                        <div className="relative flex items-start justify-between">
                            {steps.map((step) => {
                                const isCompleted = currentStep > step.id
                                const isCurrent = currentStep === step.id
                                const StepIcon = step.icon

                                return (
                                    <div key={step.id} className="flex flex-col items-center">
                                        {/* Step Circle */}
                                        <div className="relative">
                                            {/* Glow Effect for Current */}
                                            {isCurrent && (
                                                <div className="absolute -inset-1.5 animate-pulse rounded-full bg-primary-400/30 blur-md sm:-inset-2 dark:bg-primary-500/20" />
                                            )}

                                            <button
                                                onClick={() => {
                                                    if (isCompleted) setCurrentStep(step.id)
                                                }}
                                                disabled={!isCompleted && !isCurrent}
                                                className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 font-semibold sm:size-12 ${isCompleted
                                                    ? 'cursor-pointer border-primary-500 bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:scale-110'
                                                    : isCurrent
                                                        ? 'border-primary-500 bg-white text-primary-600 shadow-lg shadow-primary-500/20 dark:bg-neutral-800 dark:text-primary-400'
                                                        : 'cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500'
                                                    }`}
                                                style={{ transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                                            >
                                                {isCompleted ? (
                                                    <CheckIcon className="size-5 sm:size-6" />
                                                ) : (
                                                    <StepIcon className="size-5 sm:size-6" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Step Name - Hidden on mobile */}
                                        <span
                                            className={`mt-2 hidden text-sm font-medium sm:mt-3 sm:block ${isCompleted
                                                ? 'text-primary-600 dark:text-primary-400'
                                                : isCurrent
                                                    ? 'text-primary-700 dark:text-primary-300'
                                                    : 'text-neutral-400 dark:text-neutral-500'
                                                }`}
                                            style={{ transition: 'color 300ms ease-out' }}
                                        >
                                            {step.name}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-4xl">
                {/* Step 1: Location */}
                {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
                            Chọn cơ sở gần bạn
                        </h2>
                        <LocationSelector
                            locations={locations}
                            selectedLocationId={selectedLocation || ''}
                            onSelect={handleLocationSelect}
                        />
                    </div>
                )}

                {/* Step 2: Service */}
                {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Chọn loại dịch vụ
                            </h2>
                            <button
                                onClick={goBack}
                                className="cursor-pointer text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                                ← Quay lại
                            </button>
                        </div>
                        {loadingServices ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800 h-48" />
                                ))}
                            </div>
                        ) : (
                            <ServiceSelector
                                services={services}
                                selectedServiceType={selectedService?.type || null}
                                onSelect={handleServiceSelect}
                            />
                        )}
                    </div>
                )}

                {/* Step 3: Room */}
                {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Chọn phòng
                            </h2>
                            <button
                                onClick={goBack}
                                className="cursor-pointer text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                                ← Quay lại
                            </button>
                        </div>
                        <RoomSelector
                            rooms={rooms}
                            selectedRoomId={selectedRoom?.id || null}
                            onSelect={handleRoomSelect}
                            loading={loadingRooms}
                        />
                    </div>
                )}

                {/* Step 4: Booking Form */}
                {currentStep === 4 && selectedRoom && selectedService && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    Đặt lịch
                                </h2>
                                <p className="mt-1 text-sm text-neutral-500">
                                    {selectedRoom.name} - {selectedService.name}
                                </p>
                            </div>
                            <button
                                onClick={goBack}
                                className="cursor-pointer text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                                ← Quay lại
                            </button>
                        </div>
                        <BookingFormV2
                            roomId={selectedRoom.id}
                            serviceType={selectedService.type}
                            onSubmit={handleBookingSubmit}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
