import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { releaseAssessmentForPresentStudents } from '@/lib/services/assessmentReleaseService'

export async function GET(req: NextRequest) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const sessionIdStr = searchParams.get('sessionId')

  if (!sessionIdStr) {
    // Return all sessions with attendance overview for this trainer
    const trainerSessions = await prisma.session.findMany({
      where: { trainerId: session.userId },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
            course: { select: { title: true } },
            _count: { select: { enrollments: true } },
          },
        },
        attendance: {
          select: {
            id: true,
            present: true,
            joinedAt: true,
          },
        },
      },
      orderBy: [{ sessionDate: 'desc' }, { startTime: 'desc' }],
    })

    return NextResponse.json({ success: true, data: trainerSessions })
  }

  const sessionId = parseInt(sessionIdStr)
  if (isNaN(sessionId)) {
    return NextResponse.json({ success: false, message: 'Invalid sessionId' }, { status: 400 })
  }

  const classSession = await prisma.session.findFirst({
    where: { id: sessionId, trainerId: session.userId },
    include: {
      batch: {
        include: {
          course: { select: { id: true, title: true } },
          enrollments: {
            where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED', 'COMPLETED'] } },
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  contact: true,
                },
              },
            },
          },
        },
      },
      attendance: true,
    },
  })

  if (!classSession) {
    return NextResponse.json({ success: false, message: 'Session not found or not owned by trainer' }, { status: 404 })
  }

  // Combine enrolled students with attendance records
  const attendanceMap = new Map(classSession.attendance.map((a) => [a.enrollmentId, a]))

  const roster = classSession.batch.enrollments.map((en) => {
    const att = attendanceMap.get(en.id)
    return {
      enrollmentId: en.id,
      studentId: en.student.id,
      studentName: en.student.name,
      studentEmail: en.student.email,
      studentContact: en.student.contact,
      present: att ? att.present : false,
      joinedAt: att?.joinedAt || null,
      attendanceId: att?.id || null,
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      session: {
        id: classSession.id,
        title: classSession.title,
        sessionDate: classSession.sessionDate,
        startTime: classSession.startTime,
        endTime: classSession.endTime,
        status: classSession.status,
        meetLink: classSession.meetLink,
        batchId: classSession.batchId,
        batchName: classSession.batch.name,
        courseTitle: classSession.batch.course.title,
      },
      roster,
    },
  })
}

export async function POST(req: NextRequest) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { sessionId, records } = body

    if (!sessionId || !Array.isArray(records)) {
      return NextResponse.json({ success: false, message: 'Invalid payload. sessionId and records array required' }, { status: 400 })
    }

    const classSession = await prisma.session.findFirst({
      where: { id: Number(sessionId), trainerId: session.userId },
      include: {
        batch: {
          include: {
            enrollments: true,
          },
        },
      },
    })

    if (!classSession) {
      return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 })
    }

    // Valid enrollment IDs for this batch
    const validEnrollmentIds = new Set(classSession.batch.enrollments.map((e) => e.id))

    // Upsert attendance for each record
    await prisma.$transaction(
      records
        .filter((r: { enrollmentId: number }) => validEnrollmentIds.has(r.enrollmentId))
        .map((r: { enrollmentId: number; present: boolean }) =>
          prisma.attendance.upsert({
            where: {
              enrollmentId_sessionId: {
                enrollmentId: r.enrollmentId,
                sessionId: Number(sessionId),
              },
            },
            create: {
              enrollmentId: r.enrollmentId,
              sessionId: Number(sessionId),
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

    // Also mark session status as COMPLETED if it wasn't cancelled
    if (classSession.status !== 'CANCELLED') {
      await prisma.session.update({
        where: { id: classSession.id },
        data: { status: 'COMPLETED' },
      })
    }

    // ── Release attendance-gated assessment for present students ──────────
    const presentCount = records.filter((r: { present: boolean }) => r.present).length
    let assessmentReleaseResult: { skipped: boolean; assessmentId?: number; moduleName?: string; studentsReleased: number } = {
      skipped: false,
      studentsReleased: 0,
    }

    try {
      assessmentReleaseResult = await releaseAssessmentForPresentStudents(classSession.id)
    } catch (releaseErr) {
      console.error('[attendance POST] Assessment release failed (non-fatal):', releaseErr)
    }

    const moduleLabel = assessmentReleaseResult.moduleName
    const assessmentMsg = !assessmentReleaseResult.skipped && assessmentReleaseResult.studentsReleased > 0
      ? `Assessment for "${moduleLabel}" released to ${assessmentReleaseResult.studentsReleased} present student(s).`
      : assessmentReleaseResult.skipped
        ? 'Assessment already released for this session.'
        : 'No assessment released (no syllabus module or no present students).'

    return NextResponse.json({
      success: true,
      message: 'Attendance updated and session finalized successfully',
      presentCount,
      absentCount: (records as Array<{ present: boolean }>).length - presentCount,
      moduleName: assessmentReleaseResult.moduleName || null,
      assessmentReleased: !assessmentReleaseResult.skipped && assessmentReleaseResult.studentsReleased > 0,
      assessmentStudentsReleased: assessmentReleaseResult.studentsReleased,
      assessmentNote: assessmentMsg,
    })
  } catch (error) {
    console.error('Error saving attendance:', error)
    return NextResponse.json({ success: false, message: 'Failed to update attendance' }, { status: 500 })
  }
}

