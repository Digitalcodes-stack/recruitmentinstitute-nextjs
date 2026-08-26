import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sessionId = parseInt(id)

  const liveSession = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!liveSession)
    return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 })

  const now = new Date()
  if (liveSession.status === 'COMPLETED' || new Date(liveSession.endTime) < now) {
    return NextResponse.json({ success: false, message: 'This training session has already concluded.' }, { status: 400 })
  }

  if (!liveSession.meetLink)
    return NextResponse.json({ success: false, message: 'No meeting link has been added for this session yet' }, { status: 400 })

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_batchId: { studentId: session.userId, batchId: liveSession.batchId } },
  })
  if (!enrollment)
    return NextResponse.json({ success: false, message: 'You are not enrolled in this batch' }, { status: 403 })

  const attendance = await prisma.attendance.upsert({
    where: { enrollmentId_sessionId: { enrollmentId: enrollment.id, sessionId } },
    update: { joinedAt: new Date(), present: true },
    create: { enrollmentId: enrollment.id, sessionId, joinedAt: new Date(), present: true },
  })

  return NextResponse.json({ success: true, data: { meetLink: liveSession.meetLink, attendance } })
}
