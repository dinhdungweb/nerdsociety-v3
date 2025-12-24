import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { canView, canManage } from '@/lib/apiPermissions'

/**
 * GET /api/admin/email-templates
 * Get all email templates (requires canViewEmailTemplates permission)
 */
export async function GET() {
    try {
        const { session, hasAccess } = await canView('EmailTemplates')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem email templates' }, { status: 403 })
        }

        const templates = await prisma.emailTemplate.findMany({
            orderBy: { name: 'asc' },
        })

        return NextResponse.json({ templates })
    } catch (error) {
        console.error('Error fetching email templates:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/admin/email-templates
 * Create or update an email template (requires canManageEmailTemplates permission)
 */
export async function POST(request: NextRequest) {
    try {
        const { session, hasAccess } = await canManage('EmailTemplates')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền sửa email templates' }, { status: 403 })
        }

        const body = await request.json()
        const { id, name, subject, content, variables, isActive } = body

        if (!name || !subject || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        let template
        if (id) {
            // Update existing
            template = await prisma.emailTemplate.update({
                where: { id },
                data: { name, subject, content, variables, isActive },
            })
        } else {
            // Create new
            template = await prisma.emailTemplate.create({
                data: { name, subject, content, variables, isActive: isActive ?? true },
            })
        }

        return NextResponse.json({ success: true, template })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Template với tên này đã tồn tại' }, { status: 400 })
        }
        console.error('Error saving email template:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/admin/email-templates
 * Delete an email template (requires canManageEmailTemplates permission)
 */
export async function DELETE(request: NextRequest) {
    try {
        const { session, hasAccess } = await canManage('EmailTemplates')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xóa email templates' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing template ID' }, { status: 400 })
        }

        await prisma.emailTemplate.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting email template:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
