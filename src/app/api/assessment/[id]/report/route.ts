import { NextResponse } from 'next/server'
import { fastApiFetchWithCookie } from '@/lib/fastapiClient'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const result = await fastApiFetchWithCookie<any>(
      'ri_user_token',
      `/api/v1/assessment/report/${id}/run-now`,
      { method: 'POST' }
    )
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to generate report' },
      { status: error.status || 500 }
    )
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const result = await fastApiFetchWithCookie<any>(
      'ri_user_token',
      `/api/v1/assessment/report/${id}/status`
    )
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to get report status' },
      { status: error.status || 500 }
    )
  }
}
