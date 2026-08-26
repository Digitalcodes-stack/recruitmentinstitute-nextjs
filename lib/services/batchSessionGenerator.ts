/**
 * batchSessionGenerator.ts
 * Reads the course syllabus modules and auto-generates one Session per module,
 * spread across the batch duration on chosen class days.
 */

import { prisma } from '@/lib/prisma'
import { sendSessionScheduledEmail } from '@/lib/email'

export interface SessionGeneratorOptions {
  /** Class days of week: 0=Sun, 1=Mon ... 6=Sat. Default: [1,3,5] Mon/Wed/Fri */
  classDays?: number[]
  /** Hour (24h) for class start. Default: 19 (7 PM IST) */
  startHour?: number
  /** Minute for class start. Default: 0 */
  startMinute?: number
  /** Hour (24h) for class end. Default: 21 (9 PM IST) */
  endHour?: number
  /** Minute for class end. Default: 0 */
  endMinute?: number
}

export interface SessionPreviewItem {
  moduleTitle: string
  moduleId: number | null
  sessionNumber: number
  sessionDate: string     // ISO date string YYYY-MM-DD
  topics: string[]
}

export interface GenerateSessionsResult {
  sessionsCreated: number
  preview: SessionPreviewItem[]
}

/**
 * Returns the next available class day on or after `from`, restricted to `classDays`.
 */
function nextClassDay(from: Date, classDays: number[]): Date {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  for (let i = 0; i < 14; i++) {
    if (classDays.includes(d.getDay())) return d
    d.setDate(d.getDate() + 1)
  }
  return d // fallback — should not happen with valid classDays
}

/**
 * Builds a preview of session dates without writing to DB.
 * Useful for the "Schedule Preview" panel in BatchForm.
 */
export async function previewSessionSchedule(
  batchId: number,
  options: SessionGeneratorOptions = {},
): Promise<SessionPreviewItem[]> {
  const classDays = options.classDays?.length ? options.classDays : [1, 3, 5]

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { sortOrder: 'asc' },
            include: {
              chapters: {
                orderBy: { sortOrder: 'asc' },
                include: { topics: { orderBy: { sortOrder: 'asc' } } },
              },
            },
          },
        },
      },
    },
  })
  if (!batch) throw new Error('Batch not found')

  const modules = batch.course.modules
  if (!modules.length) return []

  const preview: SessionPreviewItem[] = []
  let cursor = new Date(batch.startDate)

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]
    const topics = mod.chapters.flatMap((ch) => ch.topics.map((t) => t.title))
    const sessionDate = nextClassDay(cursor, classDays)

    preview.push({
      moduleTitle: mod.title,
      moduleId: mod.id,
      sessionNumber: i + 1,
      sessionDate: sessionDate.toISOString().slice(0, 10),
      topics,
    })

    // Advance cursor past this session date
    cursor = new Date(sessionDate)
    cursor.setDate(cursor.getDate() + 1)
  }

  return preview
}

/**
 * Generates and saves Sessions in DB for a batch based on course syllabus modules.
 * One session per module, spread across class days starting from batch.startDate.
 */
export async function generateSessionsForBatch(
  batchId: number,
  options: SessionGeneratorOptions = {},
): Promise<GenerateSessionsResult> {
  const classDays = options.classDays?.length ? options.classDays : [1, 3, 5]
  const startHour = options.startHour ?? 19
  const startMinute = options.startMinute ?? 0
  const endHour = options.endHour ?? 21
  const endMinute = options.endMinute ?? 0

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { sortOrder: 'asc' },
            include: {
              chapters: {
                orderBy: { sortOrder: 'asc' },
                include: { topics: { orderBy: { sortOrder: 'asc' } } },
              },
            },
          },
        },
      },
      trainer: { select: { id: true, name: true } },
      enrollments: {
        where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED'] } },
        include: { student: { select: { id: true, name: true, email: true, isActive: true } } },
      },
    },
  })

  if (!batch) throw new Error('Batch not found')

  const modules = batch.course.modules
  if (!modules.length) {
    return { sessionsCreated: 0, preview: [] }
  }

  // Generate a random Google Meet link
  function genMeetCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`
  }

  const preview: SessionPreviewItem[] = []
  let cursor = new Date(batch.startDate)
  let sessionsCreated = 0

  const activeStudents = batch.enrollments
    .filter((en) => en.student.isActive)
    .map((en) => en.student)

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]
    const topics = mod.chapters.flatMap((ch) => ch.topics.map((t) => t.title))

    const sessionDate = nextClassDay(cursor, classDays)

    // Build start/end datetime on session date
    const startTime = new Date(sessionDate)
    startTime.setHours(startHour, startMinute, 0, 0)

    const endTime = new Date(sessionDate)
    endTime.setHours(endHour, endMinute, 0, 0)

    const meetLink = batch.mode !== 'OFFLINE' ? genMeetCode() : null

    const description = topics.length
      ? `Topics covered:\n${topics.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}`
      : undefined

    const createdSession = await prisma.session.create({
      data: {
        batchId: batch.id,
        trainerId: batch.trainer.id,
        title: `Session ${i + 1}: ${mod.title}`,
        description,
        sessionDate: new Date(sessionDate.toISOString().slice(0, 10)), // date only
        startTime,
        endTime,
        meetLink,
        status: 'UPCOMING',
        syllabusModuleId: mod.id,
        moduleNameSnapshot: mod.title,
        topicsJson: topics,
      },
    })

    preview.push({
      moduleTitle: mod.title,
      moduleId: mod.id,
      sessionNumber: i + 1,
      sessionDate: sessionDate.toISOString().slice(0, 10),
      topics,
    })
    sessionsCreated++

    // Email enrolled students about this session
    if (meetLink && activeStudents.length > 0) {
      const dateStr = sessionDate.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
      })
      const startStr = startTime.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
      })
      const endStr = endTime.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
      })

      await Promise.allSettled(
        activeStudents.map((student) =>
          sendSessionScheduledEmail({
            studentEmail: student.email,
            studentName: student.name,
            sessionTitle: createdSession.title,
            batchName: batch.name,
            sessionDate: dateStr,
            startTime: startStr,
            endTime: endStr,
            courseTitle: batch.course.title,
            trainerName: batch.trainer.name,
            meetLink,
          })
        )
      )
    }

    // Advance cursor past this session date
    cursor = new Date(sessionDate)
    cursor.setDate(cursor.getDate() + 1)
  }

  return { sessionsCreated, preview }
}
