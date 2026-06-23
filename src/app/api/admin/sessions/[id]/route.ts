import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { sessionSchema } from '@/lib/validations'
import { enqueueSessionReminders, cancelSessionReminders, enqueueCalendarSync } from '@/lib/jobs/queue'
import { sendSessionCancelledEmail } from '@/lib/email'

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
  const session = await prisma.session.findUnique({
    where: { id: parseInt(id) },
    include: {
      batch: { select: { id: true, name: true } },
      trainer: { select: { id: true, name: true } },
      attendance: { include: { enrollment: { include: { student: { select: { id: true, name: true } } } } } },
    },
  })
  if (!session) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: session })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = sessionSchema.partial().safeParse({
    ...body,
    ...(body.batchId !== undefined && { batchId: Number(body.batchId) }),
    ...(body.trainerId !== undefined && { trainerId: Number(body.trainerId) }),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { sessionDate, startTime, endTime, ...rest } = validated.data
  const sessionId = parseInt(id)

  const before = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { startTime: true, googleEventId: true },
  })

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: {
      ...rest,
      ...(sessionDate !== undefined && { sessionDate: new Date(sessionDate) }),
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(endTime !== undefined && { endTime: new Date(endTime) }),
    },
    include: { batch: { include: { enrollments: { include: { student: true } } } } },
  })

  if (session.status === 'CANCELLED') {
    await cancelSessionReminders(sessionId)
    if (before?.googleEventId) await enqueueCalendarSync(sessionId, 'cancel', before.googleEventId)

    const sessionDateLabel = session.sessionDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const startTimeLabel = session.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    for (const e of session.batch.enrollments.filter((en) => en.status === 'ENROLLED' && en.student.isActive)) {
      await sendSessionCancelledEmail({
        studentEmail: e.student.email,
        studentName: e.student.name,
        sessionTitle: session.title,
        batchName: session.batch.name,
        sessionDate: sessionDateLabel,
        startTime: startTimeLabel,
      })
    }
  } else {
    const timeChanged = startTime !== undefined && before && before.startTime.getTime() !== session.startTime.getTime()
    const contentChanged = rest.title !== undefined || rest.description !== undefined

    if (timeChanged) await enqueueSessionReminders(sessionId, session.startTime)
    if ((timeChanged || contentChanged) && before?.googleEventId) await enqueueCalendarSync(sessionId, 'patch')
  }

  return NextResponse.json({ success: true, data: session })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const sessionId = parseInt(id)

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      batch: { select: { name: true } },
      attendance: { include: { enrollment: { include: { student: { select: { name: true, email: true, isActive: true } } } } } },
    },
  })
  await cancelSessionReminders(sessionId)
  if (session) {
    const sessionDateLabel = session.sessionDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const startTimeLabel = session.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    for (const attendance of session.attendance) {
      const student = attendance.enrollment.student
      if (!student.isActive) continue
      await sendSessionCancelledEmail({
        studentEmail: student.email,
        studentName: student.name,
        sessionTitle: session.title,
        batchName: session.batch.name,
        sessionDate: sessionDateLabel,
        startTime: startTimeLabel,
      })
    }
  }
  if (session?.googleEventId) {
    await prisma.jobQueue.create({
      data: {
        type: 'sync_calendar_event',
        payload: { sessionId, action: 'cancel', googleEventId: session.googleEventId },
        runAfter: new Date(),
      },
    })
  }
  await prisma.session.delete({ where: { id: sessionId } })
  return NextResponse.json({ success: true, message: 'Session deleted' })
}
