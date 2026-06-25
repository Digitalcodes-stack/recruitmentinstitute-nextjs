import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { retrySingleRecipient } from '@/lib/jobs/notifications'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const retried = await retrySingleRecipient(Number(id))
  if (!retried) return NextResponse.json({ success: false, message: 'Recipient not found or not retryable' }, { status: 400 })

  return NextResponse.json({ success: true, data: retried })
}
