import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { canManage } from '@/lib/apiPermissions'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

// GET /api/admin/media - List all uploaded files
export async function GET() {
    try {
        // Ensure uploads directory exists
        if (!fs.existsSync(UPLOADS_DIR)) {
            return NextResponse.json({ files: [] })
        }

        const files = fs.readdirSync(UPLOADS_DIR)
        const fileDetails = files
            .filter(file => !file.startsWith('.')) // Ignore hidden files
            .map(file => {
                const filePath = path.join(UPLOADS_DIR, file)
                const stats = fs.statSync(filePath)
                const ext = path.extname(file).toLowerCase()
                const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)

                return {
                    name: file,
                    url: `/uploads/${file}`,
                    size: stats.size,
                    isImage,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime,
                }
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json({ files: fileDetails })
    } catch (error) {
        console.error('Error listing media:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE /api/admin/media - Delete a file (requires canManageGallery permission)
export async function DELETE(request: NextRequest) {
    try {
        const { session, hasAccess } = await canManage('Gallery')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xóa media' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename')

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
        }

        // Security: only allow alphanumeric, dash, underscore, dot
        if (!/^[\w\-\.]+$/.test(filename)) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
        }

        const filePath = path.join(UPLOADS_DIR, filename)

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        // Delete file
        fs.unlinkSync(filePath)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting media:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
