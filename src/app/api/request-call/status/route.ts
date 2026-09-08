import { NextRequest, NextResponse } from 'next/server'
import { recordCallOutcome } from '@/lib/callSecurity'
import { triggerPostCallDelivery, getCallSession } from '@/lib/postCallService'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const callId = searchParams.get('call_id')
    const phone = searchParams.get('phone')

    if (!callId) {
      return NextResponse.json(
        { success: false, message: 'Missing call_id parameter' },
        { status: 400 }
      )
    }

    const aideskApiBase = (
      process.env.AIDESK_INTERNAL_URL ||
      process.env.AIDESK_SERVICE_URL ||
      process.env.NEXT_PUBLIC_AIDESK_API_URL ||
      (process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000'
        : 'https://recruitmentinstitute-aidesk-396924250862.asia-south1.run.app')
    ).replace(/\/$/, '')

    const targetUrl = `${aideskApiBase}/api/plivo/call-status/${callId}`

    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })

    if (!res.ok) {
      return NextResponse.json({
        call_id: callId,
        status: 'ringing',
        disconnected: false,
      })
    }

    const data = await res.json()
    const isDisconnected = Boolean(data.disconnected) || data.status === 'completed' || data.status === 'failed'

    // If call concluded or connected, record outcome for cooldown tracking
    if (isDisconnected && phone) {
      recordCallOutcome(phone, data.status)

      // Automatically trigger post-call delivery (WhatsApp + Email) exactly once
      const session = getCallSession(callId) || (phone ? getCallSession(phone) : undefined)
      if (session) {
        triggerPostCallDelivery({
          ...session,
          duration: data.duration || 0,
        }).catch((err) => console.error('[PostCall] Error in status poller trigger:', err))
      }
    } else if (data.status === 'in_call' && phone) {
      recordCallOutcome(phone, 'in_call')
    }

    return NextResponse.json({
      success: true,
      call_id: callId,
      status: data.status,
      disconnected: isDisconnected,
      duration: data.duration || 0,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      status: 'ringing',
      disconnected: false,
    })
  }
}
