import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { generateSessionsForBatch, previewSessionSchedule } from '@/lib/services/batchSessionGenerator'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

function parseOptions(searchParams: URLSearchParams) {
  const classDaysParam = searchParams.get('classDays')
  return {
    classDays: classDaysParam ? classDaysParam.split(',').map(Number) : [1, 3, 5],
    startHour: Number(searchParams.get('startHour') ?? 19),
    startMinute: Number(searchParams.get('startMinute') ?? 0),
    endHour: Number(searchParams.get('endHour') ?? 21),
    endMinute: Number(searchParams.get('endMinute') ?? 0),
  }
}

/** GET — preview without writing to DB */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const batchId = parseInt(id)
  if (isNaN(batchId)) return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 })

  const options = parseOptions(req.nextUrl.searchParams)
  try {
    const preview = await previewSessionSchedule(batchId, options)
    return NextResponse.json({ success: true, data: preview })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed to build preview' }, { status: 500 })
  }
}

/** POST — generate and persist sessions */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const batchId = parseInt(id)
  if (isNaN(batchId)) return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const options = {
    classDays: Array.isArray(body.classDays) ? body.classDays : [1, 3, 5],
    startHour: body.startHour !== undefined ? Number(body.startHour) : 19,
    startMinute: body.startMinute !== undefined ? Number(body.startMinute) : 0,
    endHour: body.endHour !== undefined ? Number(body.endHour) : 21,
    endMinute: body.endMinute !== undefined ? Number(body.endMinute) : 0,
  }

  try {
    const result = await generateSessionsForBatch(batchId, options)
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed to generate sessions' }, { status: 500 })
  }
}
