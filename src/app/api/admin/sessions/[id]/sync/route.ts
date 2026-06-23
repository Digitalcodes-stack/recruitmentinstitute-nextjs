import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { enqueueCalendarSync } from '@/lib/jobs/queue'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const sessionId = Number(id)
  if (!Number.isFinite(sessionId)) {
    return NextResponse.json({ success: false, message: 'Invalid session id' }, { status: 400 })
  }

  const existing = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { googleEventId: true },
  })
  if (!existing) {
    return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 })
  }

  await enqueueCalendarSync(sessionId, existing.googleEventId ? 'patch' : 'create', existing.googleEventId ?? undefined)
  return NextResponse.json({ success: true, message: 'Sync queued' })
}
