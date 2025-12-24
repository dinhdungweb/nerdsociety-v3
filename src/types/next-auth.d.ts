import 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
    interface User {
        id: string
        role: Role
    }

    interface Session {
        user: {
            id: string
            name: string
            email: string
            role: string
            image?: string
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: string
    }
}

declare module 'next-auth/adapters' {
    interface AdapterUser {
        role: Role
    }
}
