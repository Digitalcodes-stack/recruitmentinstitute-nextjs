import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminSession, getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureSessionSyllabusPdf } from '@/lib/services/sessionSyllabusPdfGenerator'
import { sendSessionSyllabusPdfEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sessionId = parseInt(id)
  if (isNaN(sessionId)) {
    return NextResponse.json({ success: false, message: 'Invalid session ID' }, { status: 400 })
  }

  // Auth: Must be admin or trainer
  const admin = await getAdminSession()
  const user = await getUserSession()

  const isAdmin = admin && admin.type === 'admin'
  const isTrainer = user && user.type === 'trainer'

  if (!isAdmin && !isTrainer) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  // Optional body with attendance roster
  const body = await req.json().catch(() => ({}))
  const { records } = body || {}

  // Load session with batch, course, trainer, and enrollments
  const classSession = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      batch: {
        include: {
          course: { select: { id: true, title: true } },
          enrollments: {
            include: {
              student: { select: { id: true, name: true, email: true, isActive: true } },
            },
          },
        },
      },
      trainer: { select: { id: true, name: true } },
      attendance: true,
    },
  })

  if (!classSession) {
    return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 })
  }

  // If trainer, verify ownership
  if (isTrainer && !isAdmin && classSession.trainerId !== user.userId) {
    return NextResponse.json(
      { success: false, message: 'You are not assigned as the trainer for this session' },
      { status: 403 }
    )
  }

  // If attendance records were passed directly, sync them to the database immediately
  if (Array.isArray(records) && records.length > 0) {
    const validEnrollmentIds = new Set(classSession.batch.enrollments.map((e) => e.id))
    await prisma.$transaction(
      records
        .filter((r: { enrollmentId: number }) => validEnrollmentIds.has(r.enrollmentId))
        .map((r: { enrollmentId: number; present: boolean }) =>
          prisma.attendance.upsert({
            where: {
              enrollmentId_sessionId: {
                enrollmentId: r.enrollmentId,
                sessionId,
              },
            },
            create: {
              enrollmentId: r.enrollmentId,
              sessionId,
              present: Boolean(r.present),
              joinedAt: r.present ? new Date() : null,
            },
            update: {
              present: Boolean(r.present),
              joinedAt: r.present ? new Date() : null,
            },
          })
        )
    )
  }

  // Ensure PDF is generated
  const { pdfUrl } = await ensureSessionSyllabusPdf(sessionId)

  // Fetch updated attendance to identify present students
  const latestAttendance = await prisma.attendance.findMany({
    where: { sessionId },
  })

  const presentEnrollmentIds = new Set(
    latestAttendance.filter((a) => a.present).map((a) => a.enrollmentId)
  )

  const attendedStudents = classSession.batch.enrollments
    .filter((en) => presentEnrollmentIds.has(en.id) && en.student.isActive)
    .map((en) => en.student)

  // Update session record with timestamp and mark status as COMPLETED (if not cancelled)
  const now = new Date()
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      syllabusPdfSentAt: now,
      syllabusPdfUrl: pdfUrl,
      ...(classSession.status !== 'CANCELLED' ? { status: 'COMPLETED' } : {}),
    },
  })

  // Dispatch email notification to all attended students
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://recruitmentinstitute.in'
  const downloadUrl = `${siteUrl}/api/sessions/${sessionId}/syllabus-pdf`

  if (attendedStudents.length > 0) {
    await Promise.allSettled(
      attendedStudents.map((student) =>
        sendSessionSyllabusPdfEmail({
          studentEmail: student.email,
          studentName: student.name,
          sessionTitle: classSession.title,
          batchName: classSession.batch.name,
          courseTitle: classSession.batch.course.title,
          trainerName: classSession.trainer.name,
          downloadUrl,
        })
      )
    )
  }

  // Revalidate student profile, trainer dashboard, and sessions cache immediately
  try {
    revalidatePath('/profile')
    revalidatePath('/trainer/dashboard')
    revalidatePath('/trainer/sessions')
    revalidatePath('/trainer/attendance')
  } catch (revalErr) {
    console.warn('[send-syllabus-pdf] Cache revalidation warning:', revalErr)
  }

  return NextResponse.json({
    success: true,
    message: `Session Syllabus PDF successfully dispatched to ${attendedStudents.length} attended student(s)!`,
    data: {
      sessionId,
      sentAt: now.toISOString(),
      attendedStudentsCount: attendedStudents.length,
      pdfUrl,
    },
  })
}

