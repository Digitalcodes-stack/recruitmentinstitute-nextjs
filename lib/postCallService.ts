import nodemailer from 'nodemailer'
import { renderExecutiveEmailHtml, EmailRow } from './email-templates'
import { prisma } from './prisma'

// Global in-memory cache to guarantee idempotency across status polls / webhooks
const executedCalls = new Map<string, number>()
const callSessions = new Map<string, PostCallPayload>()
const CLEANUP_INTERVAL = 1000 * 60 * 60 // 1 hour

// Periodically clean up old call records
setInterval(() => {
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 // 24 hours
  for (const [id, time] of executedCalls.entries()) {
    if (time < cutoff) executedCalls.delete(id)
  }
  for (const [id] of callSessions.entries()) {
    // Keep max 1000 sessions
    if (callSessions.size > 1000) callSessions.delete(id)
  }
}, CLEANUP_INTERVAL).unref?.()

export function registerCallSession(key: string, payload: PostCallPayload) {
  if (!key) return
  callSessions.set(key, payload)
  if (payload.phone) {
    const cleanDigits = payload.phone.replace(/\D/g, '')
    callSessions.set(cleanDigits, payload)
  }
}

export function getCallSession(key: string): PostCallPayload | undefined {
  if (!key) return undefined
  if (callSessions.has(key)) return callSessions.get(key)
  const cleanDigits = key.replace(/\D/g, '')
  if (cleanDigits && callSessions.has(cleanDigits)) return callSessions.get(cleanDigits)
  return undefined
}

export interface PostCallPayload {
  callId?: string
  name: string
  phone: string
  email?: string
  language?: string
  state?: string
  counselorName?: string
  duration?: number
  notes?: string
  slotBooked?: string
  courseDiscussed?: string
}

const DEFAULT_COUNSELOR = 'Pooja Kulkarni'
const COUNSELOR_ROLE = 'Senior Career Counsellor'
const HELPLINE_PHONE = '+91 7385204165'
const HELPLINE_DIGITS = '917385204165'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sesasiba.es@gmail.com'
const EMAIL_CC = process.env.EMAIL_CC || 'sesasiba.es@gmail.com,patilrupalib@gmail.com'

function getTransporter() {
  const auth =
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth,
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  })
}

/**
 * Generate formatted WhatsApp message text
 */
export function generatePostCallWhatsAppText(payload: PostCallPayload): string {
  const counselor = payload.counselorName || DEFAULT_COUNSELOR
  const cleanName = payload.name.trim()
  const programTitle = payload.courseDiscussed || 'End-to-End Practical Recruitment & HR Operations Training'

  const slotSection = payload.slotBooked
    ? `\n\n🎉 *CONFIRMED DEMO / INTERVIEW SESSION:*\nYour session has been tentatively marked for: *${payload.slotBooked}*.\nPlease join on time via Google Meet / Zoom.`
    : ''

  const notesSection = payload.notes
    ? `\n\n📝 *KEY POINTS DISCUSSED ON CALL:*\n${payload.notes}`
    : ''

  return `Hello ${cleanName}! 👋

Thank you for speaking with *${counselor}* (${COUNSELOR_ROLE}) from *Recruitment Institute*.

As promised during our call, here are your requested course details, key curriculum highlights, and next steps:${slotSection}${notesSection}

━━━━━━━━━━━━━━━━━━━━━
📚 *PROGRAM OVERVIEW*
*${programTitle}*
Designed for freshers, HR aspirants, and working professionals looking to break into high-paying Talent Acquisition & Recruitment roles.

✨ *KEY BENEFITS & PRACTICAL MODULES:*
• Live Sourcing on LinkedIn Recruiter, Naukri, Shine & Portals
• Advanced Boolean Search Mastery & Talent Pipeline Mapping
• Complete ATS Lifecycle, Screening, Interviewing & Offer Negotiation
• Payroll, Compensation & Benefits, and Statutory Compliances
• 100% Placement Assistance with 500+ Hiring Partner Companies
• Industry Recognized Certification & Lifetime Career Community Access

🚀 *RECOMMENDED NEXT STEPS:*
1️⃣ Review the full syllabus & upcoming batch schedules online.
2️⃣ Attend our next Free Live Interactive Demo Session.
3️⃣ Connect with ${counselor} to confirm your batch preference (Weekday / Weekend).

🔗 *HELPFUL LINKS:*
• Course Details & Curriculum: https://recruitmentinstitute.in/courses
• Free Study Materials & Guides: https://recruitmentinstitute.in/knowledge
• Book Live Demo Class: https://recruitmentinstitute.in/contact

📞 *DIRECT COUNSELLOR SUPPORT:*
• Counsellor: ${counselor}
• Official Helpline / WhatsApp: ${HELPLINE_PHONE}
• Email: support@recruitmentinstitute.in
• Website: https://recruitmentinstitute.in

Reply directly to this chat if you have any questions. We are excited to support your career growth! 🎯`
}

export function normalizePhoneForWhatsApp(raw: string): string {
  if (!raw) return ''
  let digits = raw.replace(/\D/g, '').trim()
  // Strip duplicate 91 prefixes, e.g. 91919850063648 -> 919850063648
  while (digits.startsWith('9191') && digits.length >= 14) {
    digits = digits.slice(2)
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`
  }
  if (digits.length === 10) {
    return `91${digits}`
  }
  if (digits.length > 10) {
    return `91${digits.slice(-10)}`
  }
  return digits
}

export function formatIndianPhoneDisplay(raw: string): string {
  const wa = normalizePhoneForWhatsApp(raw)
  if (wa.length === 12 && wa.startsWith('91')) {
    return `+91 ${wa.slice(2)}`
  }
  return raw
}

/**
 * Generates direct wa.me link with pre-filled message for 1-click user interaction
 */
export function generateWhatsAppDirectLink(phone: string, text: string): string {
  const formattedDigits = normalizePhoneForWhatsApp(phone)
  return `https://wa.me/${formattedDigits}?text=${encodeURIComponent(text)}`
}

/**
 * Send WhatsApp via Meta Cloud API or Webhook if configured
 */
export async function sendWhatsAppMessage(toPhone: string, text: string): Promise<boolean> {
  const formattedDigits = normalizePhoneForWhatsApp(toPhone)

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0'
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL

  // 1. Meta WhatsApp Cloud API
  if (phoneNumberId && accessToken) {
    try {
      const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedDigits,
          type: 'text',
          text: { body: text },
        }),
      })
      const data = await res.json()
      if (res.ok) {
        console.log(`[PostCall] WhatsApp Cloud API sent successfully to ${formattedDigits}:`, data)
        return true
      } else {
        console.warn(`[PostCall] WhatsApp Cloud API error response:`, data)
      }
    } catch (err) {
      console.warn(`[PostCall] WhatsApp Cloud API request failed:`, err)
    }
  }

  // 2. Generic WhatsApp Webhook
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedDigits,
          message: text,
          channel: 'WHATSAPP',
        }),
      })
      if (res.ok) {
        console.log(`[PostCall] WhatsApp Webhook delivered to ${formattedDigits}`)
        return true
      }
    } catch (err) {
      console.warn(`[PostCall] WhatsApp Webhook request failed:`, err)
    }
  }

  console.log(`[PostCall] WhatsApp ready for ${formattedDigits} via direct wa.me gateway`)
  return true
}

/**
 * Renders an executive, modern, high-converting HTML email for candidate post-call follow-ups.
 */
export function renderCandidatePostCallEmailHtml(payload: PostCallPayload): string {
  const counselor = payload.counselorName || DEFAULT_COUNSELOR
  const cleanName = payload.name.trim()
  const recipientEmail = payload.email?.trim() || ''
  const programTitle = payload.courseDiscussed || 'End-to-End Practical Recruitment & HR Operations Program'

  const slotHtml = payload.slotBooked
    ? `
      <div style="margin-top: 14px; padding: 12px 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #065f46; margin-bottom: 2px;">
          📅 Confirmed Demo / Consultation Session
        </div>
        <div style="font-size: 14px; font-weight: 700; color: #047857;">
          ${payload.slotBooked}
        </div>
        <div style="font-size: 12px; color: #065f46; margin-top: 2px;">
          Meeting invitation and link will be sent prior to the session.
        </div>
      </div>
    `
    : ''

  const notesHtml = payload.notes
    ? `
      <div style="margin-top: 12px; padding: 12px 16px; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 2px;">
          📝 Discussion Notes
        </div>
        <div style="font-size: 13px; color: #334155; line-height: 1.5;">
          ${payload.notes}
        </div>
      </div>
    `
    : ''

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Course Details & Next Steps — Recruitment Institute</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 12px !important; }
      .email-card { width: 100% !important; border-radius: 8px !important; }
      .header-cell { padding: 24px 20px !important; }
      .content-cell { padding: 24px 18px !important; }
      .btn-stack { display: block !important; width: 100% !important; margin-bottom: 10px !important; margin-right: 0 !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f1f5f9" class="email-wrapper" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="email-card" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);">
          
          <!-- Header Banner (Deep Navy Gradient) -->
          <tr>
            <td align="center" bgcolor="#0b192c" class="header-cell" style="background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 100%); background-color: #0b192c; padding: 36px 32px 30px 32px; text-align: center; border-bottom: 3px solid #f59e0b;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #93c5fd; margin-bottom: 6px;">
                      RECRUITMENT INSTITUTE
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.3; margin-bottom: 10px;">
                      Career Counselling &amp; Next Steps
                    </div>
                    <div style="display: inline-block; padding: 5px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; background-color: rgba(255, 255, 255, 0.12); color: #f0fdf4; border: 1px solid rgba(255, 255, 255, 0.25);">
                      Official Admissions Desk • Pune Academy
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td class="content-cell" style="padding: 32px 32px 24px 32px; background-color: #ffffff;">
              
              <!-- Personal Greeting -->
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                Dear ${cleanName},
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #334155;">
                Thank you for speaking with me today. It was a pleasure discussing your background and learning more about your professional goals in Talent Acquisition and Human Resources.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.65; color: #334155;">
                As promised during our consultation call, here is your comprehensive consultation summary, core curriculum highlights, and actionable next steps for the <strong>${programTitle}</strong>.
              </p>

              <!-- Program Snapshot Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 22px; border-left: 4px solid #1e40af; border-radius: 10px 0 0 10px;">
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #1e40af; margin-bottom: 4px;">
                      CONSULTATION SNAPSHOT
                    </div>
                    <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.2px;">
                      ${programTitle}
                    </div>
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; width: 36%; font-weight: 600; color: #64748b;">Assigned Counsellor:</td>
                        <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${counselor} (${COUNSELOR_ROLE})</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Training Format:</td>
                        <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">Live Interactive Online &amp; Pune Classroom</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Batch Schedules:</td>
                        <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">Flexible Weekday Evening &amp; Weekend Batches</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Placement Support:</td>
                        <td style="padding: 4px 0; font-weight: 700; color: #059669;">100% Dedicated Assistance with 500+ Hiring Partners</td>
                      </tr>
                    </table>

                    ${slotHtml}
                    ${notesHtml}
                  </td>
                </tr>
              </table>

              <!-- Section: Curriculum Highlights -->
              <div style="margin-bottom: 28px;">
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 14px; letter-spacing: -0.3px;">
                  📚 Core Curriculum Highlights
                </div>

                <!-- Module Card 1 -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        🔍 Live Portal Mastery (LinkedIn Recruiter &amp; Naukri)
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        Hands-on sourcing on active portals. Master keyword search, advanced filters, candidate outreach messaging, and recruitment analytics.
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Module Card 2 -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        ⚡ Advanced Boolean Sourcing &amp; Talent Mapping
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        Formulate high-precision search strings (AND, OR, NOT, X-Ray) to uncover hidden, passive candidate pools across Google and GitHub.
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Module Card 3 -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        📋 Full ATS Lifecycle &amp; Salary Negotiation
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        End-to-end recruitment management: resume screening, structured interview coordination, CTC benchmarking, and counter-offer handling.
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Module Card 4 -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        ⚖️ HR Operations, Compliance &amp; Payroll Basics
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        Core operational HR skills: statutory compliances (PF, ESIC, Gratuity, Bonus), payroll structures, and standard onboarding documentation.
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Module Card 5 -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        🎯 100% Dedicated Placement Assistance
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        One-on-one resume overhaul, LinkedIn profile makeover, rigorous mock interviews with Senior HR Directors, and direct hiring partner referrals.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Section: Recommended Next Steps -->
              <div style="margin-bottom: 30px;">
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 14px; letter-spacing: -0.3px;">
                  🚀 Recommended Next Steps
                </div>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 26px; vertical-align: top;">
                            <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #1e40af; color: #ffffff; font-size: 12px; font-weight: 800; text-align: center; line-height: 22px;">1</div>
                          </td>
                          <td style="padding-left: 10px;">
                            <div style="font-size: 14px; font-weight: 700; color: #1e3a8a;">Review the Full Curriculum &amp; Batch Schedules</div>
                            <div style="font-size: 13px; color: #2563eb; margin-top: 2px;">
                              Explore week-by-week practical projects, module breakdowns, and real recruiter case studies.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 26px; vertical-align: top;">
                            <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #1e40af; color: #ffffff; font-size: 12px; font-weight: 800; text-align: center; line-height: 22px;">2</div>
                          </td>
                          <td style="padding-left: 10px;">
                            <div style="font-size: 14px; font-weight: 700; color: #1e3a8a;">Select Your Preferred Batch Timing</div>
                            <div style="font-size: 13px; color: #2563eb; margin-top: 2px;">
                              Choose Weekday evening sessions (Mon–Fri 1 hr) or intensive Weekend batches (Sat–Sun 2 hrs).
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 26px; vertical-align: top;">
                            <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #1e40af; color: #ffffff; font-size: 12px; font-weight: 800; text-align: center; line-height: 22px;">3</div>
                          </td>
                          <td style="padding-left: 10px;">
                            <div style="font-size: 14px; font-weight: 700; color: #1e3a8a;">Attend Your Free Live Demo Session</div>
                            <div style="font-size: 13px; color: #2563eb; margin-top: 2px;">
                              Join our practical walkthrough session, interact with our mentor, and get your questions answered.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Interactive CTA Buttons -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="https://recruitmentinstitute.in/courses" target="_blank" class="btn-stack" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); background-color: #1e40af; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.25); margin-right: 10px; margin-bottom: 8px;">
                      📚 Explore Full Syllabus &amp; Curriculum →
                    </a>
                    <a href="tel:${HELPLINE_DIGITS}" class="btn-stack" style="display: inline-block; background-color: #f8fafc; color: #0f172a; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 22px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 8px;">
                      📞 Call Helpline: ${HELPLINE_PHONE}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Counsellor Sign-off Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 12px;">
                <tr>
                  <td>
                    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
                      If you have any questions regarding batch timings, fee installments, or career transitions, feel free to reply directly to this email or reach out to our team anytime.
                    </div>
                    <div style="font-size: 14px; color: #475569;">Warm regards,</div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${counselor}</div>
                    <div style="font-size: 13px; font-weight: 600; color: #1e40af;">${COUNSELOR_ROLE} &amp; Admissions Advisor</div>
                    <div style="font-size: 13px; color: #64748b;">Recruitment Institute, Pune, India</div>

                    <!-- Contact Details Box -->
                    <div style="margin-top: 16px; padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #475569;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding: 3px 0; width: 34%; font-weight: 600; color: #64748b;">Direct Helpline:</td>
                          <td style="padding: 3px 0;"><a href="tel:${HELPLINE_DIGITS}" style="color: #1e40af; text-decoration: none; font-weight: 700;">${HELPLINE_PHONE}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 3px 0; font-weight: 600; color: #64748b;">Admissions Email:</td>
                          <td style="padding: 3px 0;"><a href="mailto:support@recruitmentinstitute.in" style="color: #1e40af; text-decoration: none; font-weight: 700;">support@recruitmentinstitute.in</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 3px 0; font-weight: 600; color: #64748b;">Official Portal:</td>
                          <td style="padding: 3px 0;"><a href="https://recruitmentinstitute.in" target="_blank" style="color: #1e40af; text-decoration: none; font-weight: 700;">recruitmentinstitute.in</a></td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td align="center" bgcolor="#f8fafc" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; border-radius: 0 0 12px 12px; text-align: center;">
              <div style="font-size: 12px; font-weight: 800; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
                RECRUITMENT INSTITUTE • PUNE, MAHARASHTRA, INDIA
              </div>
              <div style="font-size: 11px; line-height: 1.6; color: #94a3b8; max-width: 520px; margin: 0 auto;">
                This official consultation summary was sent to <strong>${recipientEmail}</strong> following your career counselling phone session. 
                Please save this email for your batch registration and enrollment records.
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 12px;">
                © ${new Date().getFullYear()} Recruitment Institute. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Send Post-Call Email to Candidate
 */
export async function sendPostCallCandidateEmail(payload: PostCallPayload): Promise<boolean> {
  const counselor = payload.counselorName || DEFAULT_COUNSELOR
  const cleanName = payload.name.trim()
  const recipientEmail = payload.email?.trim()

  if (!recipientEmail || !recipientEmail.includes('@') || recipientEmail.endsWith('@call-lead.recruitmentinstitute.in')) {
    console.log(`[PostCall] No valid candidate email address for ${cleanName} — skipping candidate email dispatch`)
    return false
  }

  const transporter = getTransporter()
  const senderEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'recruitmentinstitute5@gmail.com'
  const senderName = process.env.EMAIL_FROM_NAME || 'Recruitment Institute'
  const fromHeader = `"${senderName}" <${senderEmail}>`

  const html = renderCandidatePostCallEmailHtml(payload)

  try {
    await transporter.sendMail({
      from: fromHeader,
      to: recipientEmail,
      subject: `🎓 Course Details & Next Steps — ${counselor} | Recruitment Institute`,
      html,
    })
    console.log(`[PostCall] Candidate email delivered successfully to ${recipientEmail}`)
    return true
  } catch (err) {
    console.error(`[PostCall] Failed to send candidate email to ${recipientEmail}:`, err)
    return false
  }
}

/**
 * Send Admin Notification Copy
 */
export async function sendPostCallAdminAlert(payload: PostCallPayload): Promise<void> {
  const counselor = payload.counselorName || DEFAULT_COUNSELOR
  const cleanName = payload.name.trim()
  const cleanPhone = payload.phone.trim()
  const timeNow = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const transporter = getTransporter()
  const senderEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'recruitmentinstitute5@gmail.com'
  const senderName = process.env.EMAIL_FROM_NAME || 'Recruitment Institute'
  const fromHeader = `"${senderName}" <${senderEmail}>`

  const rows: EmailRow[] = [
    { label: 'Candidate Name', value: cleanName, isHighlight: true },
    { label: 'Mobile Number', value: formatIndianPhoneDisplay(cleanPhone), isPhone: true },
    { label: 'Email Address', value: payload.email || 'Not provided', isEmail: Boolean(payload.email) },
    { label: 'Preferred Language', value: payload.language || 'English' },
    { label: 'State / Location', value: payload.state || 'Not specified' },
    { label: 'Assigned Counsellor', value: counselor },
    { label: 'Call Status', value: 'Completed / Disconnected' },
    { label: 'Completion Time', value: `${timeNow} (IST)` },
    ...(payload.callId ? [{ label: 'Call ID', value: payload.callId }] : []),
  ]

  const candidateDigits = normalizePhoneForWhatsApp(cleanPhone)

  const html = renderExecutiveEmailHtml({
    badgeText: 'Call Completed',
    badgeBg: '#f0fdf4',
    badgeColor: '#15803d',
    badgeBorder: '#bbf7d0',
    title: 'Phone Consultation Completed',
    subtitle: `${cleanName} completed call with ${counselor}`,
    introText: `
      A candidate has concluded a phone consultation call. Automated course details, next steps, and helpful links have been dispatched to the candidate's WhatsApp and Email.
    `,
    rows,
    actionButton: {
      text: `📞 Call Candidate (${formatIndianPhoneDisplay(cleanPhone)})`,
      url: `tel:+${candidateDigits}`,
      color: '#16a34a',
    },
    secondaryButton: {
      text: '💬 WhatsApp Candidate',
      url: `https://wa.me/${candidateDigits}?text=${encodeURIComponent(
        `Hello ${cleanName}, ${counselor} here from Recruitment Institute following up on our consultation call.`
      )}`,
    },
    footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
  })

  // 1. Admin Email
  try {
    await transporter.sendMail({
      from: fromHeader,
      to: ADMIN_EMAIL,
      cc: EMAIL_CC,
      subject: `✅ Call Completed: Follow-up for ${cleanName} (${cleanPhone}) — ${counselor}`,
      html,
    })
    console.log(`[PostCall] Admin notification email sent to ${ADMIN_EMAIL}`)
  } catch (err) {
    console.warn(`[PostCall] Error sending admin notification email:`, err)
  }

  // 2. Admin WhatsApp alert
  const adminWhatsAppDigits = process.env.ADMIN_WHATSAPP || HELPLINE_DIGITS
  const adminMsg = `✅ *Call Completed with ${counselor}*\n\n` +
    `👤 *Candidate:* ${cleanName}\n` +
    `📞 *Phone:* ${cleanPhone}\n` +
    `📧 *Email:* ${payload.email || 'N/A'}\n` +
    `🗣️ *Language:* ${payload.language || 'English'}\n` +
    `📍 *State:* ${payload.state || 'N/A'}\n` +
    `⏰ *Time:* ${timeNow} (IST)\n\n` +
    `Course details & next steps have been auto-sent to the candidate.\n` +
    `Direct Chat: https://wa.me/91${candidateDigits}`

  try {
    await sendWhatsAppMessage(adminWhatsAppDigits, adminMsg)
  } catch (err) {
    console.warn(`[PostCall] Error sending admin WhatsApp alert:`, err)
  }
}

/**
 * Main Trigger Function: Executed on Call Disconnect / Completion
 * Ensures exact-once execution per call ID (idempotent)
 */
export async function triggerPostCallDelivery(payload: PostCallPayload): Promise<{
  success: boolean
  whatsappSent: boolean
  emailSent: boolean
  alreadyExecuted: boolean
}> {
  const callKey = payload.callId || `${payload.phone.replace(/\D/g, '')}_${payload.name.trim()}`

  if (executedCalls.has(callKey)) {
    console.log(`[PostCall] Call ${callKey} already processed. Skipping duplicate dispatch.`)
    return {
      success: true,
      whatsappSent: true,
      emailSent: true,
      alreadyExecuted: true,
    }
  }

  // Mark as processed immediately
  executedCalls.set(callKey, Date.now())
  console.log(`[PostCall] Processing post-call delivery for ${payload.name} (${payload.phone})...`)

  // 1. WhatsApp dispatch is disabled — details sent exclusively via Email
  const whatsappSent = false
  console.log('[PostCall] WhatsApp dispatch skipped as per policy. Course details sent strictly via Email.')

  // 2. Send email to candidate (if valid email provided)
  let emailSent = false
  try {
    emailSent = await sendPostCallCandidateEmail(payload)
  } catch (err) {
    console.warn('[PostCall] Error dispatching candidate email:', err)
  }

  // 3. Send admin notification copy (Email only)
  try {
    await sendPostCallAdminAlert(payload)
  } catch (err) {
    console.warn('[PostCall] Error dispatching admin alert:', err)
  }

  // 4. Update Database record if exists
  try {
    const cleanPhone = payload.phone.replace(/[^\d+]/g, '')
    const latestSubmission = await prisma.contactSubmission.findFirst({
      where: { mobile: cleanPhone },
      orderBy: { createdAt: 'desc' },
    })

    if (latestSubmission) {
      await prisma.contactSubmission.update({
        where: { id: latestSubmission.id },
        data: {
          message: `${latestSubmission.message} | [PostCall Sent: WhatsApp=${whatsappSent}, Email=${emailSent}]`,
        },
      })
    }
  } catch (dbErr) {
    console.warn('[PostCall] Could not update DB submission record:', dbErr)
  }

  return {
    success: true,
    whatsappSent,
    emailSent,
    alreadyExecuted: false,
  }
}
