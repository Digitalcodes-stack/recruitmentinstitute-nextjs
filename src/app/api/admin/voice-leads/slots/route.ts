import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const aiDeskUrl =
      process.env.AIDESK_SERVICE_URL ||
      'https://recruitmentinstitute-aidesk-396924250862.asia-south1.run.app'

    const endpoint = body.action === 'add' ? '/api/public/voice-leads/slots/add' : '/api/public/voice-leads/slots/toggle'

    const res = await fetch(`${aiDeskUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update slot')
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating slot:', error)
    return NextResponse.json({ error: error.message || 'Failed to update slot' }, { status: 500 })
  }
}
