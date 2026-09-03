import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createAssessment, getAssessmentByCourseAdmin } from '@/lib/fastapiAdminClient'
import { FastApiError } from '@/lib/fastapiClient'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  try {
    const assessment = await getAssessmentByCourseAdmin(parseInt(id))
    return NextResponse.json({ success: true, data: assessment })
  } catch (error) {
    if (error instanceof FastApiError && (error.status === 404 || error.status === 503)) {
      return NextResponse.json({ success: true, data: null })
    }
    // Also catch AI provider unavailable or missing assessment messages gracefully
    const message = error instanceof Error ? error.message : 'Unable to fetch assessment'
    if (message.toLowerCase().includes('ai provider unavailable') || message.toLowerCase().includes('not found')) {
      return NextResponse.json({ success: true, data: null })
    }
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const { assessmentName, totalMarks, durationMinutes } = body

  if (!assessmentName || !totalMarks || !durationMinutes) {
    return NextResponse.json({ success: false, message: 'assessmentName, totalMarks, and durationMinutes are required' }, { status: 400 })
  }

  try {
    const assessment = await createAssessment(parseInt(id), assessmentName, Number(totalMarks), Number(durationMinutes))
    return NextResponse.json({ success: true, data: assessment }, { status: 201 })
  } catch (error) {
    const status = error instanceof FastApiError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to create assessment'
    return NextResponse.json({ success: false, message }, { status })
  }
}
