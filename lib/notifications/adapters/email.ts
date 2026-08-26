import nodemailer from 'nodemailer'
import type { NotificationRecipient } from '@prisma/client'

function getTransporter() {
  const host = process.env.SMTP_HOST || 'serenity.herosite.pro'
  const port = parseInt(process.env.SMTP_PORT || '587')
  const secure = process.env.SMTP_SECURE === 'true'
  const user = process.env.SMTP_USER || 'support@recruitmentinstitute.in'
  const pass = process.env.SMTP_PASS || 'support@recruitmentinstitute'

  const auth = user && pass ? { user, pass } : undefined


  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  })
}

const getFrom = () => `"${process.env.EMAIL_FROM_NAME || 'Recruitment Institute'}" <${process.env.EMAIL_FROM || 'support@recruitmentinstitute.in'}>`
const getEmailCC = () => process.env.EMAIL_CC || 'sesasiba.es@gmail.com'

export async function sendEmailAdapter(recipient: NotificationRecipient): Promise<{ providerMessageId: string }> {
  const transporter = getTransporter()
  const info = await transporter.sendMail({
    from: getFrom(),
    to: recipient.address,
    cc: getEmailCC(),
    subject: recipient.renderedSubject || 'Notification',
    html: recipient.renderedBody,
  })
  console.log(`[NotificationEmail] Email sent to ${recipient.address}. MessageId: ${info.messageId}`)
  return { providerMessageId: info.messageId }
}

