import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const [pending, processing, failed, completed, recent] = await Promise.all([
    prisma.jobQueue.count({ where: { status: 'pending' } }),
    prisma.jobQueue.count({ where: { status: 'processing' } }),
    prisma.jobQueue.count({ where: { status: 'failed' } }),
    prisma.jobQueue.count({ where: { status: 'completed' } }),
    prisma.jobQueue.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: { id: true, type: true, status: true, attempts: true, error: true, runAfter: true, updatedAt: true, payload: true },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: { stats: { pending, processing, failed, completed }, recent },
  })
}
