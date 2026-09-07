import { NextRequest, NextResponse } from 'next/server'
import {
  validateIndianPhoneNumber,
  checkCallAbuseAndRateLimit,
  recordCallAttempt,
} from '@/lib/callSecurity'
import { sendCallRequestLeadEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

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
    const { name, phone, preferred_course, executive_id, counselor_name } = body
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
    const cleanName = name.trim()
    const assignedCounselor = counselor_name || 'Senior Career Counsellor'
    const interestedCourse = preferred_course || 'HR & Recruitment Training Program'

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

    // 4. Immediately record in Database (never lose a lead)
    prisma.contactSubmission
      .create({
        data: {
          name: cleanName,
          email: `${cleanPhone.replace(/\D/g, '')}@call-lead.recruitmentinstitute.in`,
          mobile: cleanPhone,
          message: `[Request a Call] Requested immediate callback. Course: ${interestedCourse}. Counselor: ${assignedCounselor}. IP: ${clientIp}`,
        },
      })
      .catch((err) => console.error('Error saving call request lead to database:', err))

    // 5. Immediately send Email Notification to Admin & CC
    sendCallRequestLeadEmail({
      name: cleanName,
      phone: cleanPhone,
      preferredCourse: interestedCourse,
      counselorName: assignedCounselor,
      clientIp,
    }).catch((err) => console.error('Error dispatching call request email notification:', err))

    // 6. Forward to AI-Desk FastAPI backend for outbound Plivo dialing
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
          preferred_course: interestedCourse,
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

    // Record verified attempt
    recordCallAttempt(cleanPhone, clientIp)

    return NextResponse.json({
      success: true,
      message: 'Calling your phone... Please pick up',
      call_id: callId,
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
