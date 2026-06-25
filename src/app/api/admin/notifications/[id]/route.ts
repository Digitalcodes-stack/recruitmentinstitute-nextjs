import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const notification = await prisma.notification.findUnique({
    where: { id: Number(id) },
    include: { template: true },
  })
  if (!notification) return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 })

  const counts = await prisma.notificationRecipient.groupBy({
    by: ['status', 'channel'],
    where: { notificationId: Number(id) },
    _count: true,
  })

  return NextResponse.json({ success: true, data: { ...notification, counts } })
}
