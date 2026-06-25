import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { startAssessment, FastApiError } from '@/lib/fastapiClient'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const questions = await startAssessment(parseInt(id))
    return NextResponse.json({ success: true, data: questions })
  } catch (error) {
    const status = error instanceof FastApiError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to start assessment'
    return NextResponse.json({ success: false, message }, { status })
  }
}
