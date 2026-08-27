import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  console.log('Sending direct diagnostic email...')

  const transporter = nodemailer.createTransport({
    host: 'serenity.herosite.pro',
    port: 465,
    secure: true,
    auth: {
      user: 'support@recruitmentinstitute.in',
      pass: 'support@recruitmentinstitute',
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Recruitment Institute" <support@recruitmentinstitute.in>',
    to: 'patilrupalib@gmail.com',
    subject: '🔔 Important: Batch Starting in 3 Days - Recruitment Institute',
    text: 'Hi Rupali,\n\nYour batch at Recruitment Institute is starting in 3 days. Please visit https://recruitmentinstitute.in/student-login to access your learning portal.\n\nBest regards,\nRecruitment Institute Team',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1E293B; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px;">
        <div style="background: #0A1628; color: #FFFFFF; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; color: #FFFFFF;">⏳ Batch Starting Countdown</h2>
        </div>
        <div style="padding: 24px;">
          <p>Dear <strong>Rupali Patil</strong>,</p>
          <p>This is your official countdown reminder that your training batch is scheduled to start <strong>in 3 days</strong>.</p>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Program:</strong> End-to-End Recruitment Training</p>
            <p style="margin: 4px 0;"><strong>Batch:</strong> Executive Fast-Track Batch</p>
            <p style="margin: 4px 0;"><strong>Format:</strong> Live Interactive Sessions + LMS</p>
          </div>
          <p>Please ensure you can log into your student dashboard:</p>
          <p style="text-align: center;">
            <a href="https://recruitmentinstitute.in/student-login" style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log in to Student Portal</a>
          </p>
          <p style="color: #64748B; font-size: 12px; margin-top: 24px;">Recruitment Institute • Pune, India</p>
        </div>
      </div>
    `,
  }

  const info = await transporter.sendMail(mailOptions)
  console.log('Result:', {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
    envelope: info.envelope,
  })
}

main().catch(console.error)
