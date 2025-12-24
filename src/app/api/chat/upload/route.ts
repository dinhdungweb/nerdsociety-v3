import { writeFile, mkdir } from 'fs/promises'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/lib/auth'

// POST /api/chat/upload - Upload images for chat
export async function POST(request: NextRequest) {
    try {
        // Allow both authenticated users and guests (for chat widget)
        const session = await getServerSession(authOptions)

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const guestSessionId = formData.get('guestSessionId') as string | null

        // Allow if logged in OR if guest has session ID
        if (!session?.user && !guestSessionId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat')

        // Ensure upload directory exists
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch {
            // Directory might already exist
        }

        const bytes = await file.arrayBuffer()
        const buffer = new Uint8Array(bytes)

        // Generate unique filename
        const ext = path.extname(file.name) || '.webp'
        const filename = `${uuidv4()}${ext}`
        const filepath = path.join(uploadDir, filename)

        await writeFile(filepath, buffer)

        const url = `/uploads/chat/${filename}`

        return NextResponse.json({ url })
    } catch (error) {
        console.error('Error uploading chat file:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
