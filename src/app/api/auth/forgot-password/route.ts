import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validations'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = forgotPasswordSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 })
    }

    const email = validated.data.email.trim().toLowerCase()

    const [candidate, student, membership] = await Promise.all([
      prisma.candidate.findUnique({ where: { email } }),
      prisma.student.findUnique({ where: { email } }),
      prisma.membership.findUnique({ where: { email } }),
    ])
    const account = candidate || student || membership

    // Always return success to prevent email enumeration
    if (!account) {
      return NextResponse.json({ success: true, message: 'If the email is registered, a reset link has been sent.' })
    }

    // Delete existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://recruitmentinstitute.in'}/reset-password?token=${token}`
    await sendPasswordResetEmail(email, resetUrl).catch(console.error)

    return NextResponse.json({ success: true, message: 'If the email is registered, a reset link has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
