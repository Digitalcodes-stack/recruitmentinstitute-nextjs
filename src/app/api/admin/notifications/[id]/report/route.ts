import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const notificationId = Number(id)

  const grouped = await prisma.notificationRecipient.groupBy({
    by: ['channel', 'status'],
    where: { notificationId },
    _count: true,
  })

  const byChannel: Record<string, Record<string, number>> = {}
  for (const row of grouped) {
    byChannel[row.channel] ??= {}
    byChannel[row.channel][row.status] = row._count
  }

  const total = grouped.reduce((sum, r) => sum + r._count, 0)
  const sent = grouped.filter((r) => ['SENT', 'DELIVERED', 'READ'].includes(r.status)).reduce((s, r) => s + r._count, 0)
  const failed = grouped.filter((r) => ['FAILED', 'BOUNCED'].includes(r.status)).reduce((s, r) => s + r._count, 0)
  const read = grouped.filter((r) => r.status === 'READ').reduce((s, r) => s + r._count, 0)

  return NextResponse.json({
    success: true,
    data: { total, sent, failed, read, byChannel },
  })
}
