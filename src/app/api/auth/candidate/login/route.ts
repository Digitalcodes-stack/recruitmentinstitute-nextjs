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

    const candidate = await prisma.candidate.findUnique({ where: { email: email.trim().toLowerCase() } })

    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    if (candidate.acceptSignin === 0) {
      return NextResponse.json(
        { success: false, message: 'Your account is pending approval. Please wait for admin confirmation.' },
        { status: 403 }
      )
    }

    const valid = await verifyPassword(password, candidate.password)
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const token = signToken({
      userId: candidate.id,
      email: candidate.email,
      name: candidate.name,
      role: 'EMPLOYEE',
      type: 'candidate',
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: candidate.id, name: candidate.name, email: candidate.email },
    })

    response.cookies.set(setUserCookie(token))
    return response
  } catch (error) {
    console.error('Candidate login error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
