import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { recipientTypeForSession } from '@/lib/notifications/session'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(10),
  platform: z.enum(['web', 'android', 'ios']),
})

export async function POST(req: NextRequest) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const recipientType = recipientTypeForSession(session)
  if (!recipientType) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const validated = schema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const device = await prisma.pushDevice.upsert({
    where: { token: validated.data.token },
    update: { recipientType, recipientId: session.userId, platform: validated.data.platform, isActive: true },
    create: { recipientType, recipientId: session.userId, ...validated.data },
  })

  return NextResponse.json({ success: true, data: device })
}
