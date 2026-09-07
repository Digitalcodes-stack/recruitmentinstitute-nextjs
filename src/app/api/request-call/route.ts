import { NextRequest, NextResponse } from 'next/server'

// In-memory sliding window rate limiter: max 3 requests per phone per hour
const phoneRequestLog = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3

function isRateLimited(phone: string): boolean {
  const now = Date.now()
  const history = (phoneRequestLog.get(phone) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  )
  if (history.length >= MAX_REQUESTS_PER_WINDOW) {
    phoneRequestLog.set(phone, history)
    return true
  }
  history.push(now)
  phoneRequestLog.set(phone, history)
  return false
}

function sanitizePhone(raw: string): string {
  let clean = raw.replace(/[^\d+]/g, '').trim()
  if (clean.startsWith('00')) clean = '+' + clean.slice(2)
  if (clean.length === 10) clean = '+91' + clean
  if (clean.length === 11 && clean.startsWith('0')) clean = '+91' + clean.slice(1)
  if (clean.length === 12 && clean.startsWith('91')) clean = '+' + clean
  if (!clean.startsWith('+')) clean = '+' + clean
  return clean
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, preferred_course, executive_id } = body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please enter your full name (at least 2 characters).' },
        { status: 400 }
      )
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid phone number.' },
        { status: 400 }
      )
    }

    const cleanPhone = sanitizePhone(phone)
    // Validate Indian mobile (6-9 followed by 9 digits) or general E.164 (7-15 digits)
    const isValidPhone = /^\+91[6-9]\d{9}$/.test(cleanPhone) || /^\+[1-9]\d{7,14}$/.test(cleanPhone)
    if (!isValidPhone) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      )
    }

    // Check rate limit per phone
    if (isRateLimited(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'You have reached the maximum of 3 call requests per hour for this phone number. Please try again later.',
        },
        { status: 429 }
      )
    }

    // Forward to AI-Desk FastAPI backend (prefer internal / service URL)
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
          message: data.detail || data.message || 'AI Desk was unable to initiate the call.',
        },
        { status: aiDeskResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Calling your phone now! Please answer.',
      call_id: data.call_id,
      phone: cleanPhone,
    })
  } catch (error: any) {
    console.error('Error in /api/request-call route:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while initiating call. Please try again.',
      },
      { status: 500 }
    )
  }
}
