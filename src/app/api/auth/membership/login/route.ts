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
    const member = await prisma.membership.findUnique({ where: { email } })

    if (!member || !member.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await verifyPassword(password, member.password)
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const token = signToken({
      userId: member.id,
      email: member.email,
      name: member.name,
      role: 'EMPLOYEE',
      type: 'membership',
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: member.id, name: member.name, email: member.email },
    })

    response.cookies.set(setUserCookie(token))
    return response
  } catch (error) {
    console.error('Membership login error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
