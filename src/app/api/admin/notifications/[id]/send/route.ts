import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { sendNotificationNow } from '@/lib/jobs/notifications'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const notification = await prisma.notification.findUnique({ where: { id: Number(id) } })
  if (!notification) return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 })
  if (notification.status !== 'DRAFT' && notification.status !== 'SCHEDULED')
    return NextResponse.json({ success: false, message: `Cannot send a notification with status ${notification.status}` }, { status: 400 })

  const queued = await sendNotificationNow(notification.id)
  return NextResponse.json({ success: true, data: { queued } })
}
