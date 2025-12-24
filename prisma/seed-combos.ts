import { PrismaClient } from '@prisma/client'
import { kebabCase } from 'lodash'

const prisma = new PrismaClient()

const combos = [
    {
        name: 'Giờ lẻ',
        price: 11000,
        duration: 60,
        features: ['11k/h/người', 'Không bao gồm Nerd coin'],
        isPopular: false,
        icon: 'ClockIcon',
        description: 'Linh hoạt cho nhu cầu ngắn hạn',
    },
    {
        name: 'Combo Bee',
        price: 33000,
        duration: 180, // 3h
        features: ['33k/3h/người', 'Tặng 1 Nerd coin'],
        isPopular: false,
        icon: 'CoffeeIcon',
        description: 'Gói 3 giờ nhẹ nhàng',
    },
    {
        name: 'Combo Owl',
        price: 59000,
        duration: 360, // 6h
        features: ['59k/6h/người', 'Tặng 2 Nerd coin'],
        isPopular: true,
        icon: 'BookOpenIcon',
        description: 'Gói 6 giờ phổ biến',
    },
    {
        name: 'Combo Fox',
        price: 79000,
        duration: 540, // 9h
        features: ['79k/9h/người', 'Tặng 3 Nerd coin'],
        isPopular: false,
        icon: 'FireIcon',
        description: 'Gói 9 giờ năng suất',
    },
    {
        name: 'Combo Báo Đêm',
        price: 49000,
        duration: 480, // 8h
        features: ['49k/8h/người', 'Tặng 1 Nerd coin', 'Áp dụng: 23h - 07h'],
        isPopular: false,
        icon: 'MoonIcon',
        description: 'Khung giờ đêm yên tĩnh',
    },
    {
        name: 'Combo Gấu Ngày',
        price: 169000,
        duration: 1440, // 24h
        features: ['169k/24h/người', 'Tặng 4 Nerd coin', 'Sử dụng trọn vẹn 24h'],
        isPopular: false,
        icon: 'SunIcon',
        description: 'Full day pass 24 giờ',
    },
    {
        name: 'Meeting Room',
        price: 80000,
        duration: 60,
        features: [
            'Nhóm 3-8: 80k/h',
            'Nhóm 8-15: 100k/h',
            'Tiện nghi: Bảng & máy chiếu',
            'Free trà & cafe',
        ],
        isPopular: false,
        icon: 'PresentationChartBarIcon',
        description: 'Phòng họp nhóm tiện nghi',
    },
    {
        name: 'Pod Room',
        price: 19000,
        duration: 60,
        features: [
            'Monopod: 19k/h đầu',
            'Multipod: 29k/h đầu',
            'Giờ sau giảm giá',
            'Tặng Nerd coin',
        ],
        isPopular: false,
        icon: 'UserGroupIcon',
        description: 'Phòng riêng tư yên tĩnh',
    },
]

async function main() {
    try {
        console.log('Clearing existing combos...')
        await prisma.combo.deleteMany({})

        console.log('Seeding new combos...')
        for (let i = 0; i < combos.length; i++) {
            const combo = combos[i]
            await prisma.combo.create({
                data: {
                    ...combo,
                    slug: kebabCase(combo.name) + '-' + Date.now() + i, // Ensure unique slug
                    sortOrder: i,
                },
            })
        }
        console.log('Seeded successfully 8 items.')
    } catch (error) {
        console.error('Error seeding combos:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
