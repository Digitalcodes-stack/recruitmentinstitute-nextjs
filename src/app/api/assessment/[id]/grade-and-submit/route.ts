import { NextResponse } from 'next/server'
import { fastApiFetchWithCookie } from '@/lib/fastapiClient'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const payload = await request.json()
    const result = await fastApiFetchWithCookie<any>(
      'ri_user_token',
      `/api/v1/assessments/${id}/grade-and-submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    )
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to submit assessment' },
      { status: error.status || 500 }
    )
  }
}
