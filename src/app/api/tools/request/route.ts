import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RECRUITMENT_TEMPLATES } from '@/lib/data/admin-templates'
import nodemailer from 'nodemailer'

function getTransporter() {
  const auth = process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465',
    auth,
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, templateId, name, email, phone } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // Find template either by slug or templateId
    const template = RECRUITMENT_TEMPLATES.find((t) => t.slug === slug || t.id === templateId)
    if (!template) {
      return NextResponse.json({ error: 'Requested template not found' }, { status: 404 })
    }

    const recipientName = name ? name.trim() : 'Recruiter / Student'
    const recipientPhone = phone ? phone.trim() : ''

    // 1. Record lead in Contact Submissions so Admin can track it
    try {
      await prisma.contactSubmission.create({
        data: {
          name: recipientName,
          email: email.trim(),
          mobile: recipientPhone || null,
          message: `Requested Tool / Template: "${template.title}" (Format: ${template.format}, Category: ${template.category})`,
        },
      })
    } catch (dbErr) {
      console.warn('Could not save tool request to ContactSubmission:', dbErr)
    }

    // 2. Dispatch the template to user's email
    const transporter = getTransporter()
    const baseUrl = process.env.NEXTAUTH_URL || 'https://recruitmentinstitute.in'
    const toolsPageLink = `${baseUrl}/tools`
    const whatsappLink = `https://wa.me/917385204165?text=${encodeURIComponent(`Hi, I downloaded ${template.title} from Recruitment Institute and would like guidance.`)}`

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${template.title} — Recruitment Institute</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg, #0A1628 0%, #1E3A8A 100%);padding:28px 32px;text-align:center;">
              <div style="font-size:11px;font-weight:700;color:#93c5fd;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Recruitment Institute • Professional Resource Suite</div>
              <div style="font-size:22px;font-weight:800;color:#ffffff;line-height:1.3;">${template.title}</div>
              <div style="font-size:12px;color:#cbd5e1;margin-top:6px;">Format: ${template.format} | Category: ${template.category}</div>
            </td>
          </tr>

          <!-- CANDIDATE GREETING -->
          <tr>
            <td style="padding:32px 32px 20px 32px;">
              <p style="font-size:16px;font-weight:600;color:#0f172a;margin:0 0 12px 0;">Dear ${recipientName},</p>
              <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 16px 0;">
                Thank you for visiting <strong>Recruitment Institute</strong>. Here is your complimentary copy of the <strong>${template.title}</strong>, prepared and curated by our senior faculty and recruitment practitioners.
              </p>

              <!-- HIGHLIGHTS CARD -->
              <div style="background:#f8fafc;border-radius:10px;padding:18px 20px;margin-bottom:24px;border:1px solid #e2e8f0;">
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:8px;">Included in this Resource:</div>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#475569;line-height:1.8;">
                  ${template.highlights.map((h) => `<li>${h}</li>`).join('')}
                </ul>
              </div>

              <!-- TEMPLATE CONTENT BLOCK -->
              <div style="margin-bottom:24px;">
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:8px;">Document Content &amp; Instructions:</div>
                <div style="background:#0f172a;color:#e2e8f0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:1.6;padding:20px;border-radius:10px;overflow-x:auto;max-height:450px;overflow-y:auto;white-space:pre-wrap;">${template.fullContent}</div>
              </div>

              <!-- CALL TO ACTION BUTTONS -->
              <div style="text-align:center;padding:12px 0 20px;">
                <a href="${toolsPageLink}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;box-shadow:0 4px 12px rgba(37,99,235,0.25);margin-right:10px;">
                  Explore All Calculators &amp; Tools
                </a>
                <a href="${whatsappLink}" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(22,163,74,0.25);">
                  Chat on WhatsApp
                </a>
              </div>

              <p style="font-size:12px;color:#64748b;line-height:1.6;text-align:center;margin:16px 0 0 0;">
                Looking to advance your career with certified Recruitment Training, Executive Headhunting Masterclasses, or Agency Business Acceleration? Contact us at <a href="tel:+917385204165" style="color:#2563eb;text-decoration:none;">+91 7385204165</a>.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f1f5f9;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;font-size:11px;color:#64748b;">
              <p style="margin:0 0 6px 0;font-weight:700;color:#334155;">Recruitment Institute • India</p>
              <p style="margin:0;">Office: Pune, Maharashtra | Email: support@recruitmentinstitute.in | Phone: +91 7385204165</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || 'support@recruitmentinstitute.in'
    const fromName = process.env.EMAIL_FROM_NAME || 'Recruitment Institute'

    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: email.trim(),
      subject: template.emailSubject,
      html: htmlContent,
      text: `${template.title}\n\nDear ${recipientName},\n\nHere is your requested template:\n\n${template.fullContent}\n\nRecruitment Institute`,
    })

    return NextResponse.json({
      success: true,
      message: `The template has been sent to ${email.trim()}! Please check your inbox.`,
    })
  } catch (error: any) {
    console.error('Tool request dispatch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to dispatch template' }, { status: 500 })
  }
}
