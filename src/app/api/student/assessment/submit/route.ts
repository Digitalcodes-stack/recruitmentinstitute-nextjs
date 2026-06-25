import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { submitAssessment, FastApiError, type TopicScoreInput } from '@/lib/fastapiClient'

export async function POST(req: NextRequest) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const assessmentId = Number(body.assessmentId)
  const topicScores = body.topicScores as TopicScoreInput[]

  if (!assessmentId || !Array.isArray(topicScores) || topicScores.length === 0) {
    return NextResponse.json({ success: false, message: 'assessmentId and topicScores are required' }, { status: 400 })
  }

  try {
    const data = await submitAssessment(assessmentId, topicScores)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    const status = error instanceof FastApiError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to submit assessment'
    return NextResponse.json({ success: false, message }, { status })
  }
}
