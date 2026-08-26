import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { batchSchema } from '@/lib/validations'
import { generateSessionsForBatch } from '@/lib/services/batchSessionGenerator'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard()
  if (err) return err

  const batches = await prisma.batch.findMany({
    include: {
      course: { select: { id: true, title: true } },
      trainer: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, sessions: true } },
    },
    orderBy: { startDate: 'desc' },
  })
  return NextResponse.json({ success: true, data: batches })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = batchSchema.safeParse({
    ...body,
    courseId: Number(body.courseId),
    trainerId: Number(body.trainerId),
    capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { startDate, endDate, ...rest } = validated.data
  const batch = await prisma.batch.create({
    data: {
      ...rest,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  // ── Auto-generate sessions from syllabus if requested ───────────────────
  let sessionsCreated = 0
  let sessionPreview: import('@/lib/services/batchSessionGenerator').SessionPreviewItem[] = []

  if (body.autoGenerateSessions === true) {
    try {
      const result = await generateSessionsForBatch(batch.id, {
        classDays: Array.isArray(body.classDays) ? body.classDays : [1, 3, 5],
        startHour: body.classStartHour !== undefined ? Number(body.classStartHour) : 19,
        startMinute: body.classStartMinute !== undefined ? Number(body.classStartMinute) : 0,
        endHour: body.classEndHour !== undefined ? Number(body.classEndHour) : 21,
        endMinute: body.classEndMinute !== undefined ? Number(body.classEndMinute) : 0,
      })
      sessionsCreated = result.sessionsCreated
      sessionPreview = result.preview
    } catch (err) {
      console.error('[batches POST] Session generation failed:', err)
      // Don't fail the batch creation — sessions can be generated later
    }
  }

  return NextResponse.json(
    { success: true, data: batch, sessionsCreated, sessionPreview },
    { status: 201 },
  )
}
