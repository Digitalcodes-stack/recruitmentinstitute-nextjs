import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { generateAssessment, type GenerateAssessmentInput } from '@/lib/fastapiAdminClient'
import { FastApiError } from '@/lib/fastapiClient'

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as GenerateAssessmentInput
  if (!body.course_id) {
    return NextResponse.json({ success: false, message: 'course_id is required' }, { status: 400 })
  }

  try {
    const assessment = await generateAssessment(body)
    return NextResponse.json({ success: true, data: assessment }, { status: 201 })
  } catch (error) {
    const status = error instanceof FastApiError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to generate assessment'
    return NextResponse.json({ success: false, message }, { status })
  }
}
