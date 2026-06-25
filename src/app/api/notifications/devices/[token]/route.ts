import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { recipientTypeForSession } from '@/lib/notifications/session'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const recipientType = recipientTypeForSession(session)
  if (!recipientType) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { token } = await params
  const device = await prisma.pushDevice.findUnique({ where: { token } })
  if (!device || device.recipientType !== recipientType || device.recipientId !== session.userId)
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })

  await prisma.pushDevice.update({ where: { token }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
