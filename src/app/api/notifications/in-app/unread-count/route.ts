import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { recipientTypeForSession } from '@/lib/notifications/session'

export async function GET() {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const recipientType = recipientTypeForSession(session)
  if (!recipientType) return NextResponse.json({ success: true, data: { count: 0 } })

  const count = await prisma.inAppNotification.count({
    where: { recipientType, recipientId: session.userId, isRead: false },
  })
  return NextResponse.json({ success: true, data: { count } })
}
