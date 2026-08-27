/**
 * nextBatchGenerator.ts
 * Creates the next upcoming batch for a course: picks a start date after the last
 * batch's end (or today), assigns the best available trainer for the requested
 * schedule, and auto-generates sessions from the syllabus.
 */

import { prisma } from '@/lib/prisma'
import { pickBestTrainer, ScheduleRequirement } from '@/lib/services/trainerAvailability'
import { generateSessionsForBatch, GenerateSessionsResult } from '@/lib/services/batchSessionGenerator'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface NextBatchOptions {
  classDays?: number[]      // default [1,3,5] Mon/Wed/Fri
  startTime?: string        // "HH:mm", default "19:00"
  endTime?: string          // "HH:mm", default "21:00"
  capacity?: number         // default 30
  mode?: 'ONLINE' | 'OFFLINE' | 'HYBRID'
  /** Days after the last batch ends (or today, if none exist) before the next one starts. Default 14. */
  gapDays?: number
}

export class NoTrainerAvailableError extends Error {
  constructor(requirement: ScheduleRequirement) {
    const days = requirement.classDays.map((d) => DAY_LABELS[d]).join('/')
    super(`No active trainer is available ${days} ${requirement.startTime}–${requirement.endTime} IST. Add availability to a trainer or adjust the schedule.`)
    this.name = 'NoTrainerAvailableError'
  }
}

export interface NextBatchResult {
  batchId: number
  batchName: string
  trainerId: number
  trainerName: string
  startDate: string
  sessionsCreated: number
  sessionPreview: GenerateSessionsResult['preview']
}

function nextClassDayOnOrAfter(from: Date, classDays: number[]): Date {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  for (let i = 0; i < 14; i++) {
    if (classDays.includes(d.getDay())) return d
    d.setDate(d.getDate() + 1)
  }
  return d
}

/**
 * Computes the start date + assigns a trainer for a course's next batch, then creates it.
 * Throws NoTrainerAvailableError if no active trainer covers the requested schedule.
 */
export async function generateNextBatch(courseId: number, options: NextBatchOptions = {}): Promise<NextBatchResult> {
  const classDays = options.classDays?.length ? options.classDays : [1, 3, 5]
  const startTime = options.startTime ?? '19:00'
  const endTime = options.endTime ?? '21:00'
  const capacity = options.capacity ?? 30
  const mode = options.mode ?? 'ONLINE'
  const gapDays = options.gapDays ?? 14

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true },
  })
  if (!course) throw new Error('Course not found')

  const lastBatch = await prisma.batch.findFirst({
    where: { courseId },
    orderBy: { startDate: 'desc' },
    select: { startDate: true, endDate: true },
  })

  const earliestStart = lastBatch
    ? new Date(Math.max((lastBatch.endDate ?? lastBatch.startDate).getTime() + gapDays * 86_400_000, Date.now()))
    : new Date()

  const startDate = nextClassDayOnOrAfter(earliestStart, classDays)

  const trainer = await pickBestTrainer({ classDays, startTime, endTime })
  if (!trainer) throw new NoTrainerAvailableError({ classDays, startTime, endTime })

  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  const existingCount = await prisma.batch.count({ where: { courseId } })
  const batchName = `${course.title} — Batch ${existingCount + 1}`
  const schedule = `${classDays.map((d) => DAY_LABELS[d]).join(' & ')} • ${startTime}–${endTime} IST`

  const batch = await prisma.batch.create({
    data: {
      name: batchName,
      courseId,
      trainerId: trainer.id,
      capacity,
      mode,
      startDate,
      schedule,
      status: 'UPCOMING',
    },
  })

  const { sessionsCreated, preview } = await generateSessionsForBatch(batch.id, {
    classDays,
    startHour,
    startMinute,
    endHour,
    endMinute,
  })

  return {
    batchId: batch.id,
    batchName,
    trainerId: trainer.id,
    trainerName: trainer.name,
    startDate: startDate.toISOString().slice(0, 10),
    sessionsCreated,
    sessionPreview: preview,
  }
}
