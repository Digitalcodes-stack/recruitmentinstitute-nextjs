import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  console.log('Sending direct diagnostic email via Gmail SMTP...')

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'recruitmentinstitute5@gmail.com',
      pass: 'ledemkmjiesdqfpk',
    },
  })

  await transporter.verify()
  console.log('✅ Google SMTP Handshake Verified Successfully!')

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Recruitment Institute" <recruitmentinstitute5@gmail.com>',
    to: 'patilrupalib@gmail.com',
    subject: '⏳ [Countdown Reminder] Batch Starts in 3 Days: Executive Fast-Track HR Batch',
    text: 'Hi Rupali,\n\nYour training batch at Recruitment Institute starts in 3 days. Please visit https://recruitmentinstitute.in/student-login to access your learning portal.\n\nBest regards,\nRecruitment Institute Admissions Team',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #0A1628 0%, #1E3A8A 100%); padding: 32px; color: #FFFFFF; text-align: center;">
          <div style="display: inline-block; padding: 4px 14px; border-radius: 50px; background: #EFF6FF; color: #2563EB; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">
            ⏳ Starts in 3 Days
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #FFFFFF;">
            Batch Starting Countdown
          </h1>
        </div>
        <div style="padding: 28px;">
          <p style="font-size: 15px; color: #0F172A; margin: 0 0 16px;">
            Dear <strong>Rupali Patil</strong>,
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
            Your live interactive training batch is starting in <strong>3 days</strong>! Please check your portal schedule and ensure your student login is active.
          </p>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <p style="margin: 4px 0; font-size: 13px;"><strong>Program:</strong> End-to-End Recruitment Training &amp; Certification</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Batch:</strong> Executive Fast-Track HR Batch</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Schedule:</strong> September 01, 2026 at 07:00 PM IST</p>
          </div>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://recruitmentinstitute.in/student-login" style="display: inline-block; padding: 12px 28px; background: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
              Access Student Dashboard &rarr;
            </a>
          </div>
          <p style="font-size: 12px; color: #64748B; margin: 0; line-height: 1.5; border-top: 1px solid #F1F5F9; padding-top: 16px;">
            Recruitment Institute • Centre for Talent Acquisition &amp; HR Excellence<br/>
            Pune, Maharashtra | Global Online Interactive Training
          </p>
        </div>
      </div>
    `,
  }

  const info = await transporter.sendMail(mailOptions)
  console.log('✅ Sent successfully via Gmail SMTP!')
  console.log('Result:', {
    messageId: info.messageId,
    accepted: info.accepted,
    response: info.response,
  })
}

main().catch(console.error)
