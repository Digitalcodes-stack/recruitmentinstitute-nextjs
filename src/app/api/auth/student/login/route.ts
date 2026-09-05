import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, setUserCookie } from '@/lib/auth'
import { studentLoginSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = studentLoginSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 400 })
    }

    const { email, password } = validated.data
    const cleanEmail = email.trim().toLowerCase()
    const student = await prisma.student.findUnique({ where: { email: cleanEmail } })

    if (!student) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    if (!student.isActive) {
      return NextResponse.json({ success: false, message: 'Your account is inactive. Please contact administration.' }, { status: 403 })
    }

    const valid = await verifyPassword(password, student.password)
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const token = signToken({
      userId: student.id,
      email: student.email,
      name: student.name,
      role: 'EMPLOYEE',
      type: 'student',
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: student.id, name: student.name, email: student.email, type: 'student' },
    })

    response.cookies.set(setUserCookie(token))
    return response
  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
