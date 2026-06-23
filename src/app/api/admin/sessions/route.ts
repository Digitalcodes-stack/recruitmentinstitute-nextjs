import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { sessionSchema } from '@/lib/validations'
import { enqueueSessionReminders, enqueueCalendarSync } from '@/lib/jobs/queue'

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
      batch: { select: { id: true, name: true } },
      trainer: { select: { id: true, name: true } },
    },
    orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
  })
  return NextResponse.json({ success: true, data: sessions })
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

  const { sessionDate, startTime, endTime, ...rest } = validated.data
  const startTimeDate = new Date(startTime)
  const session = await prisma.session.create({
    data: {
      ...rest,
      sessionDate: new Date(sessionDate),
      startTime: startTimeDate,
      endTime: new Date(endTime),
    },
  })

  await enqueueSessionReminders(session.id, startTimeDate)
  await enqueueCalendarSync(session.id, 'create')

  return NextResponse.json({ success: true, data: session }, { status: 201 })
}
