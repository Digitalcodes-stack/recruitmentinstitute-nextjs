import { NextResponse } from 'next/server'
import { fastApiFetchWithCookie } from '@/lib/fastapiClient'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const result = await fastApiFetchWithCookie<any>(
      'ri_user_token',
      `/api/v1/assessment/${id}/start`
    )
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to start assessment' },
      { status: error.status || 500 }
    )
  }
}
