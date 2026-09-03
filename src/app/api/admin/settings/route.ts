import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, hashPassword, signToken, setAdminCookie } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, contact: true, role: true, isActive: true },
    })

    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin profile not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: admin })
  } catch (error) {
    console.error('Fetch admin profile error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, email, contact, password } = body

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 })
    }
    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const currentAdmin = await prisma.adminUser.findUnique({ where: { id: session.userId } })
    if (!currentAdmin) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 })
    }

    if (cleanEmail !== currentAdmin.email.toLowerCase()) {
      const existing = await prisma.adminUser.findUnique({ where: { email: cleanEmail } })
      if (existing && existing.id !== session.userId) {
        return NextResponse.json({ success: false, message: 'This email is already in use by another admin' }, { status: 409 })
      }
    }

    const updateData: any = {
      name: name.trim(),
      email: cleanEmail,
      contact: contact ? contact.trim() : null,
    }

    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 })
      }
      updateData.password = await hashPassword(password.trim())
    }

    const updatedAdmin = await prisma.adminUser.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, name: true, email: true, contact: true, role: true, isActive: true },
    })

    // Re-sign Admin JWT token with updated credentials
    const newToken = signToken({
      userId: updatedAdmin.id,
      email: updatedAdmin.email,
      name: updatedAdmin.name,
      role: updatedAdmin.role as any,
      type: 'admin',
    })

    const response = NextResponse.json({
      success: true,
      message: 'Admin profile updated successfully',
      data: updatedAdmin,
    })

    response.cookies.set(setAdminCookie(newToken))
    return response
  } catch (error) {
    console.error('Update admin profile error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update admin profile' }, { status: 500 })
  }
}
