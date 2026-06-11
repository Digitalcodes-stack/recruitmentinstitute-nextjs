import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, setAdminCookie } from '@/lib/auth'
import { adminLoginSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = adminLoginSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 400 })
    }

    const { email, password } = validated.data

    const admin = await prisma.adminUser.findUnique({ where: { email } })

    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await verifyPassword(password, admin.password)
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const token = signToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as any,
      type: 'admin',
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    })

    const cookieOpts = setAdminCookie(token)
    response.cookies.set(cookieOpts)

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
