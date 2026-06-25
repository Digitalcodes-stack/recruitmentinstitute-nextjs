import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { deleteQuestion } from '@/lib/fastapiAdminClient'
import { FastApiError } from '@/lib/fastapiClient'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ assessmentId: string; questionId: string }> }) {
  const err = await guard()
  if (err) return err

  const { assessmentId, questionId } = await params
  try {
    await deleteQuestion(parseInt(assessmentId), parseInt(questionId))
    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    const status = error instanceof FastApiError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to delete question'
    return NextResponse.json({ success: false, message }, { status })
  }
}
