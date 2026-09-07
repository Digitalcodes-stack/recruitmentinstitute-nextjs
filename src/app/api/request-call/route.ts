import { NextRequest, NextResponse } from 'next/server'
import {
  validateIndianPhoneNumber,
  checkCallAbuseAndRateLimit,
  recordCallAttempt,
} from '@/lib/callSecurity'

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, preferred_course, executive_id } = body
    const clientIp = getClientIp(req)

    // 1. Validate Name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please enter your full name.' },
        { status: 400 }
      )
    }

    // 2. Validate Phone Format & Fake Number Detection
    const phoneValidation = validateIndianPhoneNumber(phone)
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: phoneValidation.error || 'Please enter a valid 10-digit mobile number.',
        },
        { status: 400 }
      )
    }

    const cleanPhone = phoneValidation.formatted

    // 3. Anti-Spam & Rate Limiting Checks
    const rateCheck = checkCallAbuseAndRateLimit(cleanPhone, clientIp)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: rateCheck.reason || 'You can request a call again after some time.',
        },
        { status: 429 }
      )
    }

    // 4. Forward to AI-Desk FastAPI backend
    const aideskApiBase = (
      process.env.AIDESK_INTERNAL_URL ||
      process.env.AIDESK_SERVICE_URL ||
      process.env.NEXT_PUBLIC_AIDESK_API_URL ||
      (process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000'
        : 'https://recruitmentinstitute-aidesk-396924250862.asia-south1.run.app')
    ).replace(/\/$/, '')

    const targetUrl = `${aideskApiBase}/api/plivo/request-callback`

    const aiDeskResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        phone: cleanPhone,
        preferred_course: preferred_course || '',
        executive_id: executive_id || null,
      }),
    })

    const data = await aiDeskResponse.json()

    if (!aiDeskResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.detail || data.message || 'Unable to place call at this moment. Please try again.',
        },
        { status: aiDeskResponse.status }
      )
    }

    // Record verified attempt
    recordCallAttempt(cleanPhone, clientIp)

    return NextResponse.json({
      success: true,
      message: 'Calling your phone... Please pick up',
      call_id: data.call_id,
      phone: cleanPhone,
    })
  } catch (error: any) {
    console.error('Error in /api/request-call route:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong while requesting call. Please try again.',
      },
      { status: 500 }
    )
  }
}
