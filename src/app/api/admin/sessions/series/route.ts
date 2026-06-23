import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { sessionSeriesSchema } from '@/lib/validations'
import { enqueueSessionReminders, enqueueCalendarSync } from '@/lib/jobs/queue'
import { computeOccurrenceDates, combineDateAndTime } from '@/lib/sessionSeries'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = sessionSeriesSchema.safeParse({
    ...body,
    batchId: Number(body.batchId),
    trainerId: Number(body.trainerId),
    occurrenceCount: Number(body.occurrenceCount),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { batchId, trainerId, title, description, daysOfWeek, startTime, endTime, startDate, occurrenceCount } = validated.data
  const recurrenceGroupId = crypto.randomUUID()
  const dates = computeOccurrenceDates(startDate, daysOfWeek, occurrenceCount)

  const created = await prisma.$transaction(
    dates.map((d) =>
      prisma.session.create({
        data: {
          batchId,
          trainerId,
          title,
          description,
          sessionDate: d,
          startTime: combineDateAndTime(d, startTime),
          endTime: combineDateAndTime(d, endTime),
          recurrenceGroupId,
        },
      })
    )
  )

  for (const s of created) {
    await enqueueSessionReminders(s.id, s.startTime)
    await enqueueCalendarSync(s.id, 'create')
  }

  return NextResponse.json({ success: true, data: { recurrenceGroupId, sessions: created } }, { status: 201 })
}
