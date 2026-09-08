import { NextRequest, NextResponse } from 'next/server'
import {
  validateIndianPhoneNumber,
  checkCallAbuseAndRateLimit,
  recordCallAttempt,
} from '@/lib/callSecurity'
import { sendCallRequestLeadEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { registerCallSession } from '@/lib/postCallService'

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}

// Supported Major Indian Languages
export const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Bengali',
  'Gujarati',
  'Malayalam',
  'Punjabi',
  'Odia',
  'Assamese',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, language, state, preferred_course, executive_id, counselor_name } = body
    const clientIp = getClientIp(req)

    // 1. Validate Name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please enter your full name (at least 2 characters).' },
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

    // 3. Validate Email (if provided)
    const cleanEmail = email && typeof email === 'string' ? email.trim() : ''
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // 4. Validate Language Preference
    let cleanLanguage = 'English'
    if (language && typeof language === 'string') {
      const parsed = language.split('(')[0].trim()
      cleanLanguage = parsed || 'English'
    }

    // 5. State (Optional)
    const cleanState = state && typeof state === 'string' ? state.trim() : ''

    const cleanPhone = phoneValidation.formatted
    const cleanName = name.trim()
    const assignedCounselor = counselor_name || 'Pooja Kulkarni'
    const interestedCourse = preferred_course || 'End-to-End Practical Recruitment & HR Operations Training'

    // 6. Anti-Spam & Rate Limiting Checks
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

    // 7. Record in Database (never lose a lead)
    const dbEmail = cleanEmail || `${cleanPhone.replace(/\D/g, '')}@call-lead.recruitmentinstitute.in`
    prisma.contactSubmission
      .create({
        data: {
          name: cleanName,
          email: dbEmail,
          mobile: cleanPhone,
          message: `[Request a Call] Immediate callback requested. Counselor: ${assignedCounselor}. Language: ${cleanLanguage}. State: ${cleanState}. Course: ${interestedCourse}. IP: ${clientIp}`,
        },
      })
      .catch((err) => console.error('Error saving call request lead to database:', err))

    // 8. Immediately send Email Notification to Admin & CC
    sendCallRequestLeadEmail({
      name: cleanName,
      phone: cleanPhone,
      preferredCourse: `${interestedCourse} (Lang: ${cleanLanguage}, State: ${cleanState})`,
      counselorName: assignedCounselor,
      clientIp,
    }).catch((err) => console.error('Error dispatching call request email notification:', err))

    // 9. Forward to AI-Desk FastAPI backend for outbound Plivo dialing
    const aideskApiBase = (
      process.env.AIDESK_INTERNAL_URL ||
      process.env.AIDESK_SERVICE_URL ||
      process.env.NEXT_PUBLIC_AIDESK_API_URL ||
      (process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000'
        : 'https://recruitmentinstitute-aidesk-396924250862.asia-south1.run.app')
    ).replace(/\/$/, '')

    const targetUrl = `${aideskApiBase}/api/plivo/request-callback`

    let callId: string | null = null
    try {
      const aiDeskResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail || null,
          language: cleanLanguage,
          state: cleanState,
          preferred_course: interestedCourse,
          counselor_name: assignedCounselor,
          executive_id: executive_id || null,
        }),
      })

      const data = await aiDeskResponse.json()
      if (aiDeskResponse.ok && data.call_id) {
        callId = data.call_id
      }
    } catch (aiDeskErr) {
      console.error('Error communicating with AI-Desk telephony service:', aiDeskErr)
    }

    // Register call session for automated post-call trigger on call completion
    registerCallSession(callId || cleanPhone, {
      callId: callId || undefined,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail || undefined,
      language: cleanLanguage,
      state: cleanState,
      counselorName: assignedCounselor,
    })

    // Record verified attempt
    recordCallAttempt(cleanPhone, clientIp)

    const tenDigitPhone = phoneValidation.raw10 || cleanPhone.replace(/^\+91/, '')
    return NextResponse.json({
      success: true,
      message: 'Calling your phone... Please pick up',
      call_id: callId,
      phone: tenDigitPhone,
      display_phone: `+91 ${tenDigitPhone}`,
      counselor: assignedCounselor,
      language: cleanLanguage,
      state: cleanState,
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
