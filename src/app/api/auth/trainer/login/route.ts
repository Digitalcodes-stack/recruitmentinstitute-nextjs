import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, setUserCookie } from '@/lib/auth'
import { trainerLoginSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = trainerLoginSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 400 })
    }

    const { email, password } = validated.data
    const trainer = await prisma.trainer.findUnique({ where: { email: email.trim().toLowerCase() } })

    if (!trainer || !trainer.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await verifyPassword(password, trainer.password)
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const token = signToken({
      userId: trainer.id,
      email: trainer.email,
      name: trainer.name,
      role: 'EMPLOYEE',
      type: 'trainer',
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: trainer.id, name: trainer.name, email: trainer.email },
    })

    response.cookies.set(setUserCookie(token))
    return response
  } catch (error) {
    console.error('Trainer login error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
