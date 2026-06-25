import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const status = req.nextUrl.searchParams.get('status')
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1'))
  const pageSize = 50

  const where = { notificationId: Number(id), ...(status && { status: status as never }) }
  const [recipients, total] = await Promise.all([
    prisma.notificationRecipient.findMany({
      where,
      orderBy: { id: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notificationRecipient.count({ where }),
  ])

  return NextResponse.json({ success: true, data: recipients, meta: { page, pageSize, total } })
}
