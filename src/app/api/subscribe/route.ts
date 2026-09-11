import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { newsletterSchema } from '@/lib/validations'
import { sendSubscriberWelcomeEmail, sendSubscriberAdminAlert } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = newsletterSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, message: 'Invalid email address' }, { status: 400 })
    }

    const { email } = validated.data
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''

    const existing = await prisma.subscriber.findUnique({ where: { email } })
    if (existing) {
      if (!existing.isActive) {
        await prisma.subscriber.update({ where: { email }, data: { isActive: true } })
      }

      // Re-send latest updates to the subscriber
      try {
        await Promise.allSettled([
          sendSubscriberWelcomeEmail({ email }),
          sendSubscriberAdminAlert({ email, ipAddress: ip }),
        ])
      } catch (emailErr) {
        console.error('Error dispatching subscriber updates email:', emailErr)
      }

      return NextResponse.json({
        success: true,
        message: 'All latest updates and resources have been sent to your email!',
      })
    }

    await prisma.subscriber.create({ data: { email, ipAddress: ip } })

    // Dispatch welcome email with all course updates & resources directly to subscriber + admin alert
    try {
      await Promise.allSettled([
        sendSubscriberWelcomeEmail({ email }),
        sendSubscriberAdminAlert({ email, ipAddress: ip }),
      ])
    } catch (emailErr) {
      console.error('Error dispatching new subscriber emails:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully! All updates have been sent to your email.',
    })
  } catch (error) {
    console.error('Subscribe API error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
