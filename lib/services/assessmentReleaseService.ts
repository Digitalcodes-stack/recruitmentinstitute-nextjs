/**
 * assessmentReleaseService.ts
 * After attendance is finalized for a session, releases a topic-scoped
 * AI assessment ONLY to students marked Present.
 * Includes a guard: if a SessionAssessment already exists for this session, skip.
 */

import { prisma } from '@/lib/prisma'

export interface AssessmentReleaseResult {
  skipped: boolean          // true if assessment was already released for this session
  assessmentId?: number     // FastAPI assessment ID
  moduleName?: string
  studentsReleased: number
}

// FastAPI base URL
const FASTAPI_URL =
  process.env.FASTAPI_SERVICE_URL ||
  'https://recruitmentinstitute-api-396924250862.asia-south1.run.app'

// Internal service-level FastAPI call (no cookie needed — uses service secret)
async function internalFastApiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${FASTAPI_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Use a service-to-service header so FastAPI allows it
      'X-Service-Token': process.env.INTERNAL_SERVICE_TOKEN || 'internal',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `FastAPI error ${res.status}`)
  }
  return json.data as T
}

export async function releaseAssessmentForPresentStudents(
  sessionId: number,
): Promise<AssessmentReleaseResult> {
  // ── Guard: already released? ─────────────────────────────────────────────
  const existing = await prisma.sessionAssessment.findUnique({
    where: { sessionId },
  })
  if (existing) {
    const count = await prisma.sessionAssessmentStudent.count({
      where: { sessionAssessmentId: existing.id },
    })
    return { skipped: true, assessmentId: existing.fastapiAssessmentId, moduleName: existing.moduleName, studentsReleased: count }
  }

  // ── Load session with module, batch, and attendance ──────────────────────
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      batch: {
        include: {
          course: { select: { id: true, title: true } },
          enrollments: {
            where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED', 'COMPLETED'] } },
            include: { student: { select: { id: true, name: true, email: true } } },
          },
        },
      },
      attendance: true,
    },
  })

  if (!session) return { skipped: false, studentsReleased: 0 }

  const topicsJson = (session.topicsJson as string[]) || []
  const moduleName = session.moduleNameSnapshot || session.title
  const courseId = session.batch.course.id

  // If no module topics, skip (manually created session — not syllabus-based)
  if (!topicsJson.length) {
    console.log(`[assessmentRelease] Session ${sessionId} has no topicsJson — skipping auto-assessment.`)
    return { skipped: true, studentsReleased: 0 }
  }

  // ── Identify present students ─────────────────────────────────────────────
  const presentEnrollmentIds = new Set(
    session.attendance.filter((a) => a.present).map((a) => a.enrollmentId),
  )

  const presentStudents = session.batch.enrollments
    .filter((en) => presentEnrollmentIds.has(en.id))
    .map((en) => en.student)


  if (!presentStudents.length) {
    console.log(`[assessmentRelease] Session ${sessionId} has no present students — skipping.`)
    return { skipped: false, studentsReleased: 0 }
  }

  // ── Generate AI assessment via FastAPI ────────────────────────────────────
  let fastapiAssessmentId: number

  try {
    const assessmentData = await internalFastApiPost<{ id: number }>('/api/v1/assessment/generate', {
      course_id: courseId,
      name: `Assessment – ${moduleName}`,
      topics: topicsJson,
      question_count: 10,
    })
    fastapiAssessmentId = assessmentData.id
  } catch (err) {
    console.error('[assessmentRelease] FastAPI generate failed:', err)
    // Don't block session completion — just skip assessment
    return { skipped: false, studentsReleased: 0 }
  }

  // ── Persist SessionAssessment ─────────────────────────────────────────────
  const sessionAssessment = await prisma.sessionAssessment.create({
    data: {
      sessionId,
      fastapiAssessmentId,
      courseId,
      moduleName,
      topicsJson,
    },
  })

  // ── Persist eligible students ─────────────────────────────────────────────
  await prisma.sessionAssessmentStudent.createMany({
    data: presentStudents.map((s) => ({
      sessionAssessmentId: sessionAssessment.id,
      studentId: s.id,
    })),
    skipDuplicates: true,
  })

  // ── Send in-app notifications ────────────────────────────────────────────
  await prisma.inAppNotification.createMany({
    data: presentStudents.map((s) => ({
      recipientType: 'STUDENT',
      recipientId: s.id,
      title: `New Assessment: ${moduleName}`,
      body: `Based on your attendance in "${moduleName}", a topic-specific assessment has been released for you. Topics: ${topicsJson.slice(0, 3).join(', ')}${topicsJson.length > 3 ? '…' : ''}`,
      link: '/profile/session-assessments',
    })),
    skipDuplicates: true,
  })

  return {
    skipped: false,
    assessmentId: fastapiAssessmentId,
    moduleName,
    studentsReleased: presentStudents.length,
  }
}
