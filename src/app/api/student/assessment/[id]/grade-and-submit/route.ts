import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { gradeAndSubmitAssessment, FastApiError, type AssessmentAnswerInput } from '@/lib/fastapiClient'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const answers = body.answers as AssessmentAnswerInput[]

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ success: false, message: 'answers are required' }, { status: 400 })
  }

  try {
    const result = await gradeAndSubmitAssessment(parseInt(id), answers)
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    const status = error instanceof FastApiError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to submit assessment'
    return NextResponse.json({ success: false, message }, { status })
  }
}
