import { PrismaClient, RoomType, ServiceType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'dungdd.work@gmail.com' },
        update: {},
        create: {
            email: 'dungdd.work@gmail.com',
            name: 'Admin Nerd Society',
            password: adminPassword,
            phone: '0368483689',
            role: 'ADMIN',
        },
    })
    console.log('✅ Admin user created:', admin.email)

    // Create locations
    const locationHTM = await prisma.location.upsert({
        where: { id: 'loc-ho-tung-mau' },
        update: {},
        create: {
            id: 'loc-ho-tung-mau',
            name: 'Cơ sở Hồ Tùng Mậu',
            address: 'Tập thể trường múa, Khu Văn hóa & Nghệ Thuật, đường Hồ Tùng Mậu, P. Mai Dịch, Hà Nội',
            phone: '0368483689',
            mapUrl: 'https://maps.app.goo.gl/1hdXj2VDtcScxGKm9',
            isActive: true,
        },
    })

    await prisma.location.upsert({
        where: { id: 'loc-tay-son' },
        update: {},
        create: {
            id: 'loc-tay-son',
            name: 'Cơ sở Tây Sơn',
            address: 'Tầng 2, 3 ngõ 167 Tây Sơn, Hà Nội',
            phone: '0368483689',
            mapUrl: 'https://maps.app.goo.gl/RVeYRTPuWTuiTymq9',
            isActive: true,
        },
    })
    console.log('✅ Locations created: 2')

    // Create Rooms for Hồ Tùng Mậu location
    const rooms = [
        {
            id: 'room-meeting-1',
            name: 'Meeting Room 1 - Bàn dài',
            type: RoomType.MEETING_LONG,
            description: 'Phòng họp bàn dài, phù hợp cho họp nhóm lớn, thuyết trình, workshop',
            capacity: 20,
            amenities: ['Máy chiếu', 'Điều hòa', 'Bảng trắng', 'Pantry tự phục vụ'],
            locationId: locationHTM.id,
        },
        {
            id: 'room-meeting-2',
            name: 'Meeting Room 2 - Bàn tròn',
            type: RoomType.MEETING_ROUND,
            description: 'Phòng họp bàn tròn, phù hợp cho họp nhóm nhỏ, thảo luận',
            capacity: 10,
            amenities: ['Máy chiếu', 'Điều hòa', 'Bảng trắng', 'Pantry tự phục vụ'],
            locationId: locationHTM.id,
        },
        {
            id: 'room-pod-mono',
            name: 'Mono Pod',
            type: RoomType.POD_MONO,
            description: 'Pod cá nhân cho 1 người, yên tĩnh tuyệt đối',
            capacity: 1,
            amenities: ['Ổ cắm điện', 'WiFi tốc độ cao', 'Điều hòa', 'Đèn đọc sách'],
            locationId: locationHTM.id,
        },
        {
            id: 'room-pod-multi',
            name: 'Multi Pod',
            type: RoomType.POD_MULTI,
            description: 'Pod đôi cho 2 người, phù hợp học nhóm nhỏ',
            capacity: 2,
            amenities: ['Ổ cắm điện', 'WiFi tốc độ cao', 'Điều hòa', 'Đèn đọc sách'],
            locationId: locationHTM.id,
        },
    ]

    for (const room of rooms) {
        await prisma.room.upsert({
            where: { id: room.id },
            update: {},
            create: room,
        })
    }
    console.log('✅ Rooms created:', rooms.length)

    // Create Services with pricing
    const services = [
        {
            slug: 'meeting-room',
            name: 'Meeting Room',
            type: ServiceType.MEETING,
            description: 'Phòng họp cho nhóm, thích hợp workshop, brainstorm',
            priceSmall: 80000,    // < 8 người
            priceLarge: 100000,   // 8-20 người
            nerdCoinReward: 0,
            minDuration: 60,
            timeStep: 30,
            features: ['Máy chiếu', 'Điều hòa', 'Bảng trắng', 'Pantry tự phục vụ'],
            icon: 'users',
            sortOrder: 1,
        },
        {
            slug: 'mono-pod',
            name: 'Mono Pod',
            type: ServiceType.POD_MONO,
            description: 'Pod cá nhân yên tĩnh cho 1 người',
            priceFirstHour: 19000,
            pricePerHour: 15000,
            nerdCoinReward: 1,
            minDuration: 60,
            timeStep: 15,
            features: ['Không gian riêng tư', 'Yên tĩnh tuyệt đối', 'Ổ cắm điện', 'WiFi cao tốc'],
            icon: 'user',
            sortOrder: 2,
        },
        {
            slug: 'multi-pod',
            name: 'Multi Pod',
            type: ServiceType.POD_MULTI,
            description: 'Pod đôi cho 2 người học/làm việc cùng nhau',
            priceFirstHour: 29000,
            pricePerHour: 25000,
            nerdCoinReward: 2,
            minDuration: 60,
            timeStep: 15,
            features: ['Không gian cho 2 người', 'Yên tĩnh', 'Ổ cắm điện', 'WiFi cao tốc'],
            icon: 'users',
            sortOrder: 3,
        },
    ]

    for (const service of services) {
        await prisma.service.upsert({
            where: { slug: service.slug },
            update: {},
            create: service,
        })
    }
    console.log('✅ Services created:', services.length)

    // Create Combos for backward compatibility with frontend
    const combos = [
        { slug: 'combo-1h', name: 'Combo 1 Giờ', duration: 60, price: 25000, description: 'Trải nghiệm không gian trong 1 giờ', features: ['1 giờ sử dụng', '1 đồ uống miễn phí', 'WiFi tốc độ cao'], icon: 'clock', isPopular: false, sortOrder: 1 },
        { slug: 'combo-3h', name: 'Combo 3 Giờ', duration: 180, price: 55000, description: 'Combo dành cho buổi học nhóm ngắn', features: ['3 giờ sử dụng', '2 đồ uống miễn phí', 'WiFi tốc độ cao', 'Ổ cắm điện'], icon: 'coffee', isPopular: true, sortOrder: 2 },
        { slug: 'combo-6h', name: 'Combo 6 Giờ', duration: 360, price: 85000, description: 'Nửa ngày học tập hiệu quả', features: ['6 giờ sử dụng', 'Đồ uống không giới hạn', 'WiFi tốc độ cao', 'Ổ cắm điện', 'Máy lạnh'], icon: 'book', isPopular: true, sortOrder: 3 },
        { slug: 'combo-24h', name: 'Combo 24 Giờ', duration: 1440, price: 180000, description: 'Trọn ngày đêm', features: ['24 giờ sử dụng', 'Đồ uống không giới hạn', 'WiFi tốc độ cao', 'Ổ cắm điện', 'Máy lạnh'], icon: 'fire', isPopular: true, sortOrder: 4 },
    ]

    for (const combo of combos) {
        await prisma.combo.upsert({
            where: { slug: combo.slug },
            update: {},
            create: combo,
        })
    }
    console.log('✅ Combos created:', combos.length)

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
