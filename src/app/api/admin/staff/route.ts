import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { audit } from '@/lib/audit'
import { canView, canManage } from '@/lib/apiPermissions'

// Roles that can be managed by MANAGER (not ADMIN or MANAGER itself)
const MANAGER_ALLOWED_ROLES = ['STAFF', 'CONTENT_EDITOR']

// Helper to check if a role can be managed by the current user
function canManageTargetRole(userRole: string, targetRole: string): boolean {
    if (userRole === 'ADMIN') return true // Admin can manage all
    if (userRole === 'MANAGER') {
        return MANAGER_ALLOWED_ROLES.includes(targetRole)
    }
    return false
}

// GET - List all staff (requires canViewStaff permission)
export async function GET() {
    try {
        const { session, hasAccess, role } = await canView('Staff')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem nhân viên' }, { status: 403 })
        }

        const userRole = role as string

        // Determine which roles to show based on current user's role
        // Admin can see all, Manager and below cannot see Admin accounts
        const visibleRoles: ('ADMIN' | 'MANAGER' | 'STAFF' | 'CONTENT_EDITOR')[] = userRole === 'ADMIN'
            ? ['ADMIN', 'MANAGER', 'STAFF', 'CONTENT_EDITOR']
            : ['MANAGER', 'STAFF', 'CONTENT_EDITOR'] // Hide ADMIN from non-Admin users

        const staff = await prisma.user.findMany({
            where: {
                role: { in: visibleRoles },
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                assignedLocationId: true,
                assignedLocation: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        const locations = await prisma.location.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
        })

        // Return current user role so frontend can adjust UI
        return NextResponse.json({ staff, locations, currentUserRole: userRole })
    } catch (error) {
        console.error('Error fetching staff:', error)
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }
}

// POST - Create new staff (requires canManageStaff permission)
export async function POST(req: Request) {
    try {
        const { session, hasAccess, role: currentRole } = await canManage('Staff')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền tạo nhân viên' }, { status: 403 })
        }

        const userRole = currentRole as string
        const { name, email, phone, password, role, assignedLocationId } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
        }

        // Validate role permissions
        const targetRole = role || 'STAFF'
        if (!canManageTargetRole(userRole, targetRole)) {
            return NextResponse.json({
                error: 'Bạn không có quyền tạo tài khoản với role này. Manager chỉ có thể tạo Staff hoặc Content Editor.'
            }, { status: 403 })
        }

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                phone,
                password: hashedPassword,
                role: targetRole,
                assignedLocationId: assignedLocationId || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                assignedLocationId: true,
                createdAt: true,
            },
        })

        // Audit logging
        await audit.create(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Unknown',
            'user',
            user.id,
            { name: user.name, email: user.email, role: user.role, createdBy: userRole }
        )

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error creating staff:', error)
        return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
    }
}

// PATCH - Update staff (requires canManageStaff permission)
export async function PATCH(req: Request) {
    try {
        const { session, hasAccess, role: currentRole } = await canManage('Staff')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền sửa nhân viên' }, { status: 403 })
        }

        const userRole = currentRole as string
        const { id, name, phone, role: newRole, assignedLocationId, password } = await req.json()

        if (!id) {
            return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 })
        }

        // Get target user's current role
        const targetUser = await prisma.user.findUnique({
            where: { id },
            select: { role: true, email: true }
        })

        if (!targetUser) {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
        }

        // Check if current user can manage the target user
        if (!canManageTargetRole(userRole, targetUser.role)) {
            return NextResponse.json({
                error: 'Bạn không có quyền chỉnh sửa tài khoản này. Manager chỉ có thể chỉnh sửa Staff hoặc Content Editor.'
            }, { status: 403 })
        }

        // If trying to change role, validate the new role too
        if (newRole && !canManageTargetRole(userRole, newRole)) {
            return NextResponse.json({
                error: 'Bạn không có quyền đổi role thành giá trị này. Manager chỉ có thể đặt role là Staff hoặc Content Editor.'
            }, { status: 403 })
        }

        const updateData: any = {}
        if (name) updateData.name = name
        if (phone !== undefined) updateData.phone = phone
        if (newRole) updateData.role = newRole
        if (assignedLocationId !== undefined) updateData.assignedLocationId = assignedLocationId || null
        if (password) {
            updateData.password = await bcrypt.hash(password, 12)
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                assignedLocationId: true,
                assignedLocation: {
                    select: { id: true, name: true },
                },
                createdAt: true,
            },
        })

        // Audit logging
        await audit.update(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Unknown',
            'user',
            user.id,
            { name: user.name, email: user.email, role: user.role, updatedBy: userRole }
        )

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error updating staff:', error)
        return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
    }
}

// DELETE - Delete staff (requires canManageStaff permission)
export async function DELETE(req: Request) {
    try {
        const { session, hasAccess, role } = await canManage('Staff')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xóa nhân viên' }, { status: 403 })
        }

        const userRole = role as string
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 })
        }

        // Prevent self-deletion
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true },
        })

        if (currentUser?.id === id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // Get user info before deletion
        const userToDelete = await prisma.user.findUnique({
            where: { id },
            select: { name: true, email: true, role: true }
        })

        if (!userToDelete) {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
        }

        // Check if current user can delete the target user
        if (!canManageTargetRole(userRole, userToDelete.role)) {
            return NextResponse.json({
                error: 'Bạn không có quyền xóa tài khoản này. Manager chỉ có thể xóa Staff hoặc Content Editor.'
            }, { status: 403 })
        }

        await prisma.user.delete({
            where: { id },
        })

        // Audit logging
        await audit.delete(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Unknown',
            'user',
            id,
            { name: userToDelete.name, email: userToDelete.email, role: userToDelete.role, deletedBy: userRole }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting staff:', error)
        return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 })
    }
}
