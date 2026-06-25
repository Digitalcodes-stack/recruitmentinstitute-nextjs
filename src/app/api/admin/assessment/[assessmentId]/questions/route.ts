import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { addQuestion, listQuestions, type QuestionBankItemInput } from '@/lib/fastapiAdminClient'
import { FastApiError } from '@/lib/fastapiClient'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ assessmentId: string }> }) {
  const err = await guard()
  if (err) return err

  const { assessmentId } = await params
  try {
    const questions = await listQuestions(parseInt(assessmentId))
    return NextResponse.json({ success: true, data: questions })
  } catch (error) {
    const status = error instanceof FastApiError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to fetch questions'
    return NextResponse.json({ success: false, message }, { status })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ assessmentId: string }> }) {
  const err = await guard()
  if (err) return err

  const { assessmentId } = await params
  const body = (await req.json()) as QuestionBankItemInput

  if (!body.topic_name || !body.question_text || !body.correct_option) {
    return NextResponse.json({ success: false, message: 'topic_name, question_text, and correct_option are required' }, { status: 400 })
  }

  try {
    const question = await addQuestion(parseInt(assessmentId), body)
    return NextResponse.json({ success: true, data: question }, { status: 201 })
  } catch (error) {
    const status = error instanceof FastApiError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to add question'
    return NextResponse.json({ success: false, message }, { status })
  }
}
