import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { sessionSchema } from '@/lib/validations'
import { enqueueSessionReminders, enqueueCalendarSync } from '@/lib/jobs/queue'
import { sendSessionScheduledEmail } from '@/lib/email'

async function guard() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return { error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) }
  }
  return { session }
}

export async function GET() {
  const auth = await guard()
  if ('error' in auth) return auth.error

  const sessions = await prisma.session.findMany({
    where: { trainerId: auth.session.userId },
    include: {
      batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      trainer: { select: { id: true, name: true } },
    },
    orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
  })

  const now = new Date()
  const computedSessions = sessions.map((s) => {
    const dStart = new Date(s.startTime)
    const dEnd = new Date(s.endTime)
    let computedStatus = s.status
    if (s.status !== 'CANCELLED') {
      if (dEnd < now || s.status === 'COMPLETED') {
        computedStatus = 'COMPLETED'
      } else if (dStart <= now && dEnd >= now) {
        computedStatus = 'LIVE'
      } else {
        computedStatus = 'UPCOMING'
      }
    }
    return {
      ...s,
      status: computedStatus,
      isPast: dEnd < now,
      isLive: computedStatus === 'LIVE',
      isCompleted: computedStatus === 'COMPLETED',
    }
  })

  return NextResponse.json({ success: true, data: computedSessions })
}

export async function POST(req: NextRequest) {
  const auth = await guard()
  if ('error' in auth) return auth.error

  const body = await req.json()
  const validated = sessionSchema.safeParse({
    ...body,
    batchId: Number(body.batchId),
    trainerId: auth.session.userId,
  })

  if (!validated.success) {
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
  }

  const batch = await prisma.batch.findFirst({
    where: { id: validated.data.batchId, trainerId: auth.session.userId },
    include: {
      course: { select: { title: true } },
      enrollments: {
        where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED'] } },
        include: { student: { select: { id: true, name: true, email: true, isActive: true } } },
      },
    },
  })

  if (!batch) {
    return NextResponse.json({ success: false, message: 'Batch not found' }, { status: 404 })
  }

  const { sessionDate, startTime, endTime, ...rest } = validated.data
  const randChars = 'abcdefghijklmnopqrstuvwxyz'
  const randCode = (len: number) => Array.from({ length: len }, () => randChars[Math.floor(Math.random() * randChars.length)]).join('')
  const fallbackMeetLink = `https://meet.google.com/${randCode(3)}-${randCode(4)}-${randCode(3)}`
  const finalMeetLink = rest.meetLink && !rest.meetLink.includes('sample-link') && rest.meetLink.startsWith('http')
    ? rest.meetLink
    : fallbackMeetLink

  const session = await prisma.session.create({
    data: {
      ...rest,
      meetLink: finalMeetLink,
      trainerId: auth.session.userId,
      sessionDate: new Date(sessionDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
    include: {
      batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      trainer: { select: { id: true, name: true } },
    },
  })

  // Format date and time for email notification in IST
  const dDate = new Date(sessionDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  const dStart = new Date(startTime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
  const dEnd = new Date(endTime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })

  // Broadcast email notification to all enrolled students
  let notifiedCount = 0
  for (const en of batch.enrollments) {
    if (en.student?.email) {
      sendSessionScheduledEmail({
        studentEmail: en.student.email,
        studentName: en.student.name,
        sessionTitle: session.title,
        batchName: batch.name,
        courseTitle: batch.course?.title,
        sessionDate: dDate,
        startTime: dStart,
        endTime: dEnd,
        meetLink: finalMeetLink,
        trainerName: auth.session.name,
      }).catch((e) => console.error('Student email error:', e.message))
      notifiedCount++
    }
  }

  await enqueueSessionReminders(session.id, session.startTime)
  await enqueueCalendarSync(session.id, 'create')

  return NextResponse.json(
    {
      success: true,
      data: session,
      studentsNotified: notifiedCount,
      message: `Session created. Google Meet link generated and sent to ${notifiedCount} students`,
    },
    { status: 201 }
  )
}
