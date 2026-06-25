import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, setUserCookie } from '@/lib/auth'
import { candidateLoginSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = candidateLoginSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 400 })
    }

    const { email, password } = validated.data
    const student = await prisma.student.findUnique({ where: { email: email.trim().toLowerCase() } })

    if (!student || !student.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
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
      user: { id: student.id, name: student.name, email: student.email },
    })

    response.cookies.set(setUserCookie(token))
    return response
  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
