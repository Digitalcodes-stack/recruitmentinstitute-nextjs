import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { COURSE_BROCHURES } from '@/lib/data/course-brochures'
import nodemailer from 'nodemailer'

function getTransporter() {
  const auth = process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'serenity.herosite.pro',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth,
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
  })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { courseSlug, candidateName, candidateEmail, candidatePhone, customNote } = body

    if (!courseSlug || !candidateEmail) {
      return NextResponse.json({ error: 'Course slug and Candidate Email are required' }, { status: 400 })
    }

    const brochure = COURSE_BROCHURES.find((b) => b.slug === courseSlug)
    if (!brochure) {
      return NextResponse.json({ error: 'Course brochure not found' }, { status: 404 })
    }

    const transporter = getTransporter()
    const name = candidateName ? candidateName.trim() : 'Candidate'
    const baseUrl = process.env.NEXTAUTH_URL || 'https://recruitmentinstitute.in'
    const brochureLink = `${baseUrl}/brochures/${brochure.slug}`
    const demoLink = `${baseUrl}/contact?course=${encodeURIComponent(brochure.title)}`
    const whatsappLink = `https://wa.me/917385204165?text=${encodeURIComponent(`Hi, I am interested in ${brochure.title}. Please guide me.`)}`

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${brochure.title} — Official Course Brochure</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f1f5f9;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);padding:28px 32px;text-align:center;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Recruitment Institute • Pune</div>
              <div style="font-size:24px;font-weight:800;color:#ffffff;line-height:1.3;">Official Program Syllabus & Brochure</div>
              <div style="font-size:13px;color:#cbd5e1;margin-top:6px;">India's #1 Practical HR & Recruitment Training Academy</div>
            </td>
          </tr>

          <!-- CANDIDATE GREETING -->
          <tr>
            <td style="padding:32px 32px 20px 32px;">
              <p style="font-size:16px;font-weight:600;color:#0f172a;margin:0 0 12px 0;">Dear ${name},</p>
              <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 16px 0;">
                Thank you for your interest in advancing your career with <strong>Recruitment Institute</strong>. As requested during your career counselling session, we have enclosed the complete official program syllabus, modules, and schedule for:
              </p>

              <!-- COURSE HIGHLIGHT CARD -->
              <div style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px;padding:18px 20px;margin-bottom:24px;border:1px solid #e2e8f0;">
                <div style="display:inline-block;background:#dbeafe;color:#1e40af;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;text-transform:uppercase;margin-bottom:8px;">${brochure.badge}</div>
                <div style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:4px;">${brochure.title}</div>
                <div style="font-size:13px;color:#64748b;margin-bottom:14px;">${brochure.subtitle}</div>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;border-top:1px solid #e2e8f0;padding-top:12px;">
                  <tr>
                    <td width="33%" style="padding:4px 0;"><strong>⏳ Duration:</strong> ${brochure.duration}</td>
                    <td width="33%" style="padding:4px 0;"><strong>🎓 Rating:</strong> ⭐ ${brochure.rating}/5.0</td>
                    <td width="33%" style="padding:4px 0;"><strong>🎯 Support:</strong> 95% Placement Support</td>
                  </tr>
                  <tr>
                    <td width="33%" style="padding:4px 0;"><strong>📍 Mode:</strong> Online & Pune</td>
                    <td width="33%" style="padding:4px 0;"><strong>💳 Tuition:</strong> ₹${brochure.discountedFee.toLocaleString('en-IN')} <span style="text-decoration:line-through;color:#94a3b8;font-size:11px;">₹${brochure.originalFee.toLocaleString('en-IN')}</span></td>
                    <td width="33%" style="padding:4px 0;"><strong>⚡ Certification:</strong> ISO Accredited</td>
                  </tr>
                </table>
              </div>

              ${customNote ? `<div style="background:#eff6ff;border:1px dashed #93c5fd;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#1e40af;line-height:1.5;"><strong>Admissions Note for you:</strong> ${customNote}</div>` : ''}

              <!-- KEY HIGHLIGHTS -->
              <div style="margin-bottom:24px;">
                <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:12px;">Program Highlights & USPs:</div>
                <ul style="margin:0;padding-left:20px;font-size:13px;color:#475569;line-height:1.7;">
                  ${brochure.keyHighlights.map((h) => `<li>${h}</li>`).join('')}
                </ul>
              </div>

              <!-- CURRICULUM OVERVIEW -->
              <div style="margin-bottom:24px;">
                <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:12px;">Curriculum Breakdown:</div>
                ${brochure.modules
                  .map(
                    (m) => `
                  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:10px 14px;margin-bottom:8px;">
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">Module ${m.moduleNumber}: ${m.title} <span style="font-weight:400;color:#64748b;font-size:11px;">(${m.duration})</span></div>
                    <div style="font-size:12px;color:#64748b;margin-top:2px;">• ${m.topics.slice(0, 3).join(' • ')}</div>
                  </div>
                `
                  )
                  .join('')}
              </div>

              <!-- PRIMARY ACTION BUTTONS -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${brochureLink}" target="_blank" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:8px;box-shadow:0 4px 12px rgba(37,99,235,0.3);">
                      📄 View & Download Full Interactive Brochure &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:14px;">
                    <a href="${demoLink}" target="_blank" style="display:inline-block;background:#10b981;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:6px;margin-right:8px;">
                      📅 Book Free Live Demo Class
                    </a>
                    <a href="${whatsappLink}" target="_blank" style="display:inline-block;background:#059669;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:6px;">
                      💬 Chat on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <!-- FOOTER DETAILS -->
              <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:20px;font-size:12px;color:#64748b;line-height:1.6;">
                <p style="margin:0 0 4px 0;"><strong>Need immediate assistance or personalized batch timings?</strong></p>
                <p style="margin:0 0 4px 0;">📞 Helpline / WhatsApp: +91-7385204165 | ✉️ support@recruitmentinstitute.in</p>
                <p style="margin:0;">🏢 Campus: Recruitment Institute Pune, Maharashtra 411005</p>
              </div>

            </td>
          </tr>

          <!-- SUBFOOTER -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;font-size:11px;color:#94a3b8;">
              © 2026 Recruitment Institute Pune. All rights reserved. • ISO 9001:2015 Certified Academy.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'support@recruitmentinstitute.in'
    const fromName = process.env.EMAIL_FROM_NAME || 'Recruitment Institute Admissions'
    const ccEmail = process.env.EMAIL_CC || 'sesasiba.es@gmail.com'

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: candidateEmail,
      cc: ccEmail,
      subject: `Official Brochure & Syllabus: ${brochure.title} — Recruitment Institute Pune`,
      html: htmlContent,
      replyTo: fromEmail,
    })

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      brochureTitle: brochure.title,
      candidateEmail,
      brochureLink,
    })
  } catch (error: any) {
    console.error('Failed to send brochure email:', error)
    return NextResponse.json({ error: error.message || 'Failed to dispatch brochure email' }, { status: 500 })
  }
}
