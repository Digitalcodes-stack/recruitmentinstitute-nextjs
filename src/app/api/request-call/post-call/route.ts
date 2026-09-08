import { NextRequest, NextResponse } from 'next/server'
import { triggerPostCallDelivery } from '@/lib/postCallService'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { call_id, name, phone, email, language, state, counselor_name, duration } = body

    if (!phone || !name) {
      return NextResponse.json(
        { success: false, message: 'Name and Phone number are required to trigger post-call delivery.' },
        { status: 400 }
      )
    }

    const result = await triggerPostCallDelivery({
      callId: call_id,
      name,
      phone,
      email,
      language,
      state,
      counselorName: counselor_name || 'Pooja Kulkarni',
      duration: duration || 0,
    })

    return NextResponse.json({
      success: true,
      result,
      message: 'Post-call communication dispatched successfully.',
    })
  } catch (error: any) {
    console.error('Error in /api/request-call/post-call:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to dispatch post-call details.' },
      { status: 500 }
    )
  }
}
