import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { generateNextBatch, NoTrainerAvailableError } from '@/lib/services/nextBatchGenerator'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

/** POST — auto-create the next batch for this course, assigning the best available trainer. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const courseId = parseInt(id)
  if (isNaN(courseId)) return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 })

  const body = await req.json().catch(() => ({}))

  try {
    const result = await generateNextBatch(courseId, {
      classDays: Array.isArray(body.classDays) ? body.classDays : undefined,
      startTime: body.startTime,
      endTime: body.endTime,
      capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
      mode: body.mode,
      gapDays: body.gapDays !== undefined ? Number(body.gapDays) : undefined,
    })
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (err) {
    if (err instanceof NoTrainerAvailableError) {
      return NextResponse.json({ success: false, message: err.message, code: 'NO_TRAINER_AVAILABLE' }, { status: 409 })
    }
    const message = err instanceof Error ? err.message : 'Failed to generate next batch'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
