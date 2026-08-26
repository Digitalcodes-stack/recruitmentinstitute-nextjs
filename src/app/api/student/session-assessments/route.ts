import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'

/**
 * GET /api/student/session-assessments
 * Returns all session assessments the logged-in student is eligible for.
 * Only returns assessments where SessionAssessmentStudent.studentId = me.
 */
export async function GET() {
  const session = await getUserSession()
  if (!session || session.type !== 'student') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const studentId = session.userId

  const records = await prisma.sessionAssessmentStudent.findMany({
    where: { studentId },
    include: {
      sessionAssessment: {
        include: {
          session: {
            select: {
              id: true,
              title: true,
              sessionDate: true,
              startTime: true,
              moduleNameSnapshot: true,
              topicsJson: true,
              batch: {
                select: {
                  id: true,
                  name: true,
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { releasedAt: 'desc' },
  })

  const data = records.map((r) => {
    const sa = r.sessionAssessment
    return {
      id: sa.id,
      fastapiAssessmentId: sa.fastapiAssessmentId,
      moduleName: sa.moduleName,
      topicsJson: sa.topicsJson,
      courseId: sa.courseId,
      courseTitle: sa.session.batch.course.title,
      batchName: sa.session.batch.name,
      sessionId: sa.session.id,
      sessionTitle: sa.session.title,
      sessionDate: sa.session.sessionDate,
      releasedAt: r.releasedAt,
    }
  })

  return NextResponse.json({ success: true, data })
}
