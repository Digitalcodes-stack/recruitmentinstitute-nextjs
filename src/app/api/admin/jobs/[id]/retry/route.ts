import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { enqueueJobRetry } from '@/lib/jobs/queue'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const jobId = Number(id)
  if (!Number.isFinite(jobId)) {
    return NextResponse.json({ success: false, message: 'Invalid job id' }, { status: 400 })
  }

  const job = await enqueueJobRetry(jobId)
  if (!job) {
    return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: job })
}
