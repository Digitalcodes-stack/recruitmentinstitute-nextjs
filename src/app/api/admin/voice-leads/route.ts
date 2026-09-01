import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const aiDeskUrl =
      process.env.AIDESK_SERVICE_URL ||
      'https://recruitmentinstitute-aidesk-396924250862.asia-south1.run.app'

    const res = await fetch(`${aiDeskUrl}/api/public/voice-leads`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`AI-Desk responded with status ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching voice leads:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch voice leads',
        data: {
          executive: null,
          slots: [],
          conversations: [],
        },
      },
      { status: 200 }
    )
  }
}
