import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

async function testInboxDelivery() {
  console.log('Testing ultra-clean transactional email for Direct Inbox Delivery...')

  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use nodemailer's built-in optimized Gmail service profile
    auth: {
      user: process.env.SMTP_USER || 'recruitmentinstitute5@gmail.com',
      pass: process.env.SMTP_PASS || 'ledemkmjiesdqfpk',
    },
  })

  await transporter.verify()
  console.log('✅ Google SMTP Verified!')

  const recipientEmail = 'patilrupalib@gmail.com'
  const recipientName = 'Rupali Patil'
  const batchName = 'Executive HR Fast-Track Batch'
  const courseTitle = 'End-to-End Recruitment Training & Certification'
  const startDate = 'Tuesday, September 01, 2026 at 7:00 PM IST'

  const subject = `Welcome to Recruitment Institute: Schedule for ${batchName}`

  const textBody = `Hello ${recipientName},

Your training program for "${courseTitle}" is scheduled to begin in 3 days.

Batch Details:
- Program: ${courseTitle}
- Batch: ${batchName}
- Start Date: ${startDate}
- Mode: Live Interactive Online Training

You can log in to your student portal anytime to access course materials, session schedule, and live class links:
https://recruitmentinstitute.in/student-login

If you need any assistance, feel free to reply to this email.

Best regards,
Admissions & Academic Team
Recruitment Institute, Pune
Website: https://recruitmentinstitute.in
Phone / WhatsApp: +91 7385204165`

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0A1628; padding: 24px 30px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; color: #93C5FD; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Recruitment Institute</span>
                    <h1 style="margin: 0; font-size: 19px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">Upcoming Batch Schedule</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 30px;">
              <p style="font-size: 15px; color: #0F172A; margin: 0 0 16px; line-height: 1.5;">
                Hello <strong>${recipientName}</strong>,
              </p>
              <p style="font-size: 14px; color: #475569; margin: 0 0 20px; line-height: 1.6;">
                Your training program for <strong style="color: #0F172A;">${courseTitle}</strong> is scheduled to begin in <strong>3 days</strong>. Please review your batch details below:
              </p>

              <!-- Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="10" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td width="30%" style="font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">Program</td>
                  <td style="font-size: 13.5px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #F1F5F9;">${courseTitle}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">Batch</td>
                  <td style="font-size: 13.5px; color: #2563EB; font-weight: 700; border-bottom: 1px solid #F1F5F9;">${batchName}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #64748B; font-weight: 600;">Start Date</td>
                  <td style="font-size: 13.5px; color: #059669; font-weight: 700;">${startDate}</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0 24px;">
                <tr>
                  <td align="center">
                    <a href="https://recruitmentinstitute.in/student-login" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
                      Open Student Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #64748B; margin: 0; line-height: 1.6;">
                If you have any questions or need login assistance, reply directly to this email or reach us on WhatsApp at <a href="https://wa.me/917385204165" style="color: #2563EB; text-decoration: none; font-weight: 600;">+91 7385204165</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 16px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8; line-height: 1.5;">
              Recruitment Institute • Centre for Talent Acquisition Excellence<br>
              Pune, Maharashtra | Online Interactive Training Worldwide
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const info = await transporter.sendMail({
    from: '"Recruitment Institute" <recruitmentinstitute5@gmail.com>',
    to: recipientEmail,
    subject: subject,
    text: textBody,
    html: htmlBody,
  })

  console.log('✅ Direct Transactional Email Dispatched!')
  console.log('Message ID:', info.messageId)
  console.log('Response:', info.response)
}

testInboxDelivery().catch(console.error)
