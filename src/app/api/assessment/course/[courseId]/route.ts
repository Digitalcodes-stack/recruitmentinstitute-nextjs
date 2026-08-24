import { NextResponse } from 'next/server'
import { fastApiFetchWithCookie } from '@/lib/fastapiClient'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  try {
    const result = await fastApiFetchWithCookie<any>(
      'ri_user_token',
      `/api/v1/assessment/by-course/${courseId}`
    )
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    if (error.status === 404) {
      return NextResponse.json({ success: false, message: 'No assessment found for this course' }, { status: 404 })
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch assessment' },
      { status: error.status || 500 }
    )
  }
}
