import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { recipientTypeForSession } from '@/lib/notifications/session'

export async function GET(req: NextRequest) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const recipientType = recipientTypeForSession(session)
  if (!recipientType) return NextResponse.json({ success: true, data: [], meta: { page: 1, pageSize: 20, total: 0 } })

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1'))
  const pageSize = 20

  const where = { recipientType, recipientId: session.userId }
  const [items, total] = await Promise.all([
    prisma.inAppNotification.findMany({
      where,
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inAppNotification.count({ where }),
  ])

  return NextResponse.json({ success: true, data: items, meta: { page, pageSize, total } })
}
