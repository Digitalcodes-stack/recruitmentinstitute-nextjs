import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { resetPasswordSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = resetPasswordSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 })
    }

    const { token, password } = validated.data

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: 'Invalid or expired reset token' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const email = resetToken.email.toLowerCase()

    const [student, trainer, admin, membership] = await Promise.all([
      prisma.student.findUnique({ where: { email } }),
      prisma.trainer.findUnique({ where: { email } }),
      prisma.adminUser.findUnique({ where: { email } }),
      prisma.membership.findUnique({ where: { email } }),
    ])

    if (student) {
      await prisma.student.update({
        where: { email },
        data: { password: hashedPassword },
      })
    } else if (trainer) {
      await prisma.trainer.update({
        where: { email },
        data: { password: hashedPassword },
      })
    } else if (admin) {
      await prisma.adminUser.update({
        where: { email },
        data: { password: hashedPassword },
      })
    } else if (membership) {
      await prisma.membership.update({
        where: { email },
        data: { password: hashedPassword },
      })
    } else {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 })
    }

    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    })

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
