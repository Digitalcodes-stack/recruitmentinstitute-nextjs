import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { recipientTypeForSession } from '@/lib/notifications/session'
import { z } from 'zod'

export async function GET() {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const recipientType = recipientTypeForSession(session)
  if (!recipientType) return NextResponse.json({ success: true, data: [] })

  const subscriptions = await prisma.notificationSubscription.findMany({
    where: { recipientType, recipientId: session.userId },
  })
  return NextResponse.json({ success: true, data: subscriptions })
}

const schema = z.object({
  channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP']),
  category: z.string().min(1),
  isEnabled: z.boolean(),
})

export async function PATCH(req: NextRequest) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const recipientType = recipientTypeForSession(session)
  if (!recipientType) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const validated = schema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { channel, category, isEnabled } = validated.data
  const subscription = await prisma.notificationSubscription.upsert({
    where: { recipientType_recipientId_channel_category: { recipientType, recipientId: session.userId, channel, category } },
    update: { isEnabled },
    create: { recipientType, recipientId: session.userId, channel, category, isEnabled },
  })

  return NextResponse.json({ success: true, data: subscription })
}
