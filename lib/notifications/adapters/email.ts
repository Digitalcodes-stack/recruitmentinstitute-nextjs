import nodemailer from 'nodemailer'
import type { NotificationRecipient } from '@prisma/client'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = `"${process.env.EMAIL_FROM_NAME || 'Recruitment Institute'}" <${process.env.EMAIL_FROM || 'noreply@recruitmentinstitute.in'}>`

export async function sendEmailAdapter(recipient: NotificationRecipient): Promise<{ providerMessageId: string }> {
  const info = await transporter.sendMail({
    from: FROM,
    to: recipient.address,
    subject: recipient.renderedSubject || 'Notification',
    html: recipient.renderedBody,
  })
  return { providerMessageId: info.messageId }
}
