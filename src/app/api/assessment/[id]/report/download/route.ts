import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('ri_user_token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.FASTAPI_SERVICE_URL || 'http://localhost:8000'
  const upstream = await fetch(`${baseUrl}/api/v1/assessment/report/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!upstream.ok) {
    return NextResponse.json({ message: 'Report not available' }, { status: upstream.status })
  }

  const pdfBuffer = await upstream.arrayBuffer()
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="assessment-report-${id}.pdf"`,
    },
  })
}
