import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getAssessmentByCourse, FastApiError } from '@/lib/fastapiClient'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { courseId } = await params
  try {
    const assessment = await getAssessmentByCourse(parseInt(courseId))
    return NextResponse.json({ success: true, data: assessment })
  } catch (error) {
    const status = error instanceof FastApiError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to fetch assessment'
    return NextResponse.json({ success: false, message }, { status })
  }
}
