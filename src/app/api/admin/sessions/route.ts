import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { sessionSchema } from '@/lib/validations'
import { enqueueSessionReminders, enqueueCalendarSync } from '@/lib/jobs/queue'
import { sendSessionScheduledEmail } from '@/lib/email'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const batchId = req.nextUrl.searchParams.get('batchId')
  const trainerId = req.nextUrl.searchParams.get('trainerId')
  const sessions = await prisma.session.findMany({
    where: {
      ...(batchId && { batchId: parseInt(batchId) }),
      ...(trainerId && { trainerId: parseInt(trainerId) }),
    },
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
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = sessionSchema.safeParse({
    ...body,
    batchId: Number(body.batchId),
    trainerId: Number(body.trainerId),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const batch = await prisma.batch.findUnique({
    where: { id: validated.data.batchId },
    include: {
      course: { select: { title: true } },
      enrollments: {
        where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED'] } },
        include: { student: { select: { id: true, name: true, email: true, isActive: true } } },
      },
    },
  })

  const { sessionDate, startTime, endTime, ...rest } = validated.data
  const startTimeDate = new Date(startTime)
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
      sessionDate: new Date(sessionDate),
      startTime: startTimeDate,
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
  if (batch) {
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
          trainerName: session.trainer?.name,
        }).catch((e) => console.error('Admin student email error:', e.message))
        notifiedCount++
      }
    }
  }

  await enqueueSessionReminders(session.id, startTimeDate)
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
