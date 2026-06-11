import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { newsletterSchema } from '@/lib/validations'

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
        return NextResponse.json({ success: true, message: 'Subscription reactivated' })
      }
      return NextResponse.json({ success: false, message: 'Email already subscribed' }, { status: 409 })
    }

    await prisma.subscriber.create({ data: { email, ipAddress: ip } })

    return NextResponse.json({ success: true, message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Subscribe API error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
