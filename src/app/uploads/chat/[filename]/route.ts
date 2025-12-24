import { readFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { lookup } from 'mime-types'

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ filename: string }> }
) {
    const params = await props.params;
    try {
        const filename = params.filename
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'chat', filename)

        // Read file directly from disk
        const fileBuffer = await readFile(filePath)

        // Determine mime type
        const mimeType = lookup(filename) || 'application/octet-stream'

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
}
