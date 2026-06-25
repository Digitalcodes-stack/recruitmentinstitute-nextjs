import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { recipientTypeForSession } from '@/lib/notifications/session'

export async function POST() {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const recipientType = recipientTypeForSession(session)
  if (!recipientType) return NextResponse.json({ success: true, data: { updated: 0 } })

  const result = await prisma.inAppNotification.updateMany({
    where: { recipientType, recipientId: session.userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })

  return NextResponse.json({ success: true, data: { updated: result.count } })
}
