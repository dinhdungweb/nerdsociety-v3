import { writeFile, mkdir } from 'fs/promises'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/lib/auth'

// POST /api/upload - Upload images
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const files = formData.getAll('files') as File[]

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads')

        // Ensure upload directory exists
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch {
            // Directory might already exist
        }

        const uploadedUrls: string[] = []

        for (const file of files) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                continue
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                continue
            }

            const bytes = await file.arrayBuffer()
            const buffer = new Uint8Array(bytes)

            // Generate unique filename
            const ext = path.extname(file.name)
            const filename = `${uuidv4()}${ext}`
            const filepath = path.join(uploadDir, filename)

            await writeFile(filepath, buffer)
            uploadedUrls.push(`/uploads/${filename}`)
        }

        if (uploadedUrls.length === 0) {
            return NextResponse.json(
                { error: 'No valid files were uploaded' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            urls: uploadedUrls,
            url: uploadedUrls[0], // For single file uploads
        })
    } catch (error) {
        console.error('Error uploading files:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
