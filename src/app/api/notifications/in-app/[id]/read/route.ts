import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { recipientTypeForSession } from '@/lib/notifications/session'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const recipientType = recipientTypeForSession(session)
  if (!recipientType) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const item = await prisma.inAppNotification.findUnique({ where: { id: Number(id) } })
  if (!item || item.recipientType !== recipientType || item.recipientId !== session.userId)
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })

  const updated = await prisma.inAppNotification.update({
    where: { id: Number(id) },
    data: { isRead: true, readAt: new Date() },
  })

  if (updated.notificationRecipientId) {
    await prisma.notificationRecipient.update({
      where: { id: updated.notificationRecipientId },
      data: { status: 'READ', readAt: new Date() },
    }).catch(() => {})
  }

  return NextResponse.json({ success: true, data: updated })
}
