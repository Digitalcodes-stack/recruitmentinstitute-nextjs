import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.SMTP_HOST || 'serenity.herosite.pro'
  const port = parseInt(process.env.SMTP_PORT || '465')
  const secure = port === 465 || process.env.SMTP_SECURE === 'true'
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
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  })
}

const getFrom = () => `"${process.env.EMAIL_FROM_NAME || 'Recruitment Institute'}" <${process.env.EMAIL_FROM || 'support@recruitmentinstitute.in'}>`
const getAdminEmail = () => process.env.ADMIN_EMAIL || 'support@recruitmentinstitute.in'
const getEmailCC = () => process.env.EMAIL_CC || 'sesasiba.es@gmail.com'

const FROM = `"${process.env.EMAIL_FROM_NAME || 'Recruitment Institute'}" <${process.env.EMAIL_FROM || 'support@recruitmentinstitute.in'}>`
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@recruitmentinstitute.in'

async function sendMail(options: nodemailer.SendMailOptions) {
  try {
    const transporter = getTransporter()
    
    // Generate text fallback from HTML if not provided to pass anti-spam checks
    let textContent = options.text
    if (!textContent && typeof options.html === 'string') {
      textContent = options.html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: options.from || getFrom(),
      replyTo: options.replyTo || 'support@recruitmentinstitute.in',
      ...options,
      text: textContent,
      headers: {
        'X-Mailer': 'RecruitmentInstitute/1.0',
        'List-Unsubscribe': '<https://recruitmentinstitute.in/unsubscribe>',
        ...(options.headers || {}),
      },
    }
    const info = await transporter.sendMail(mailOptions)
    console.log(`[EmailService] Email sent successfully to ${options.to}. MessageId: ${info.messageId}`)
    return info
  } catch (error) {
    console.error(`[EmailService] Error sending email to ${options.to}:`, error)
    throw error
  }
}


export async function sendContactEmail(data: {
  name: string
  email: string
  mobile: string
  message: string
}) {
  const formattedMessage = data.message.replace(/\n/g, '<br/>')

  // 1. Notification to Admin & CC
  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    replyTo: data.email,
    subject: `🎯 New Lead: Contact Form Submission from ${data.name}`,
    html: `
      <div style="background:#f1f5f9;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%);padding:28px 32px;color:#ffffff;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#93c5fd;margin-bottom:6px;">New Lead Enquiry</div>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;">Contact Form Submission</h1>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.6;">A new visitor has submitted an enquiry through the Recruitment Institute contact form:</p>
            <table style="width:100%;border-collapse:separate;border-spacing:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;overflow:hidden;">
              <tr>
                <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#64748b;width:30%;border-bottom:1px solid #e2e8f0;">Full Name</td>
                <td style="padding:14px 18px;font-size:14px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Email Address</td>
                <td style="padding:14px 18px;font-size:14px;color:#2563eb;border-bottom:1px solid #e2e8f0;"><a href="mailto:${data.email}" style="color:#2563eb;text-decoration:none;font-weight:600;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Mobile Number</td>
                <td style="padding:14px 18px;font-size:14px;color:#0f172a;font-weight:600;border-bottom:1px solid #e2e8f0;"><a href="tel:${data.mobile}" style="color:#0f172a;text-decoration:none;">${data.mobile}</a></td>
              </tr>
              <tr>
                <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#64748b;vertical-align:top;">Message / Query</td>
                <td style="padding:14px 18px;font-size:14px;color:#1e293b;line-height:1.6;">${formattedMessage}</td>
              </tr>
            </table>
            <div style="text-align:center;margin-top:20px;">
              <a href="mailto:${data.email}?subject=Re:%20Inquiry%20at%20Recruitment%20Institute" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Reply to Candidate</a>
            </div>
          </div>
          <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">
            Recruitment Institute Platform • Pune, Maharashtra | Global Online Training Worldwide
          </div>
        </div>
      </div>
    `,
  })

  // 2. Professional Confirmation to Candidate
  await sendMail({
    from: FROM,
    to: data.email,
    subject: `Thank you for contacting Recruitment Institute, ${data.name}!`,
    html: `
      <div style="background:#f1f5f9;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%);padding:32px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:6px 16px;border-radius:50px;background:rgba(255,255,255,0.15);color:#93c5fd;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:12px;">Inquiry Received</div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#ffffff;">Thank You, ${data.name}!</h1>
            <p style="margin:0;font-size:14px;color:#cbd5e1;">We have received your enquiry and our admissions team is already reviewing it.</p>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">Dear <strong>${data.name}</strong>,</p>
            <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">
              Thank you for reaching out to <strong>Recruitment Institute</strong> — the leading training institute for End-to-End Recruitment, HR Operations, and Talent Acquisition.
            </p>
            <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1e3a8a;">What happens next?</p>
              <ul style="margin:0;padding-left:18px;font-size:13px;color:#334155;line-height:1.7;">
                <li>Our Senior Course Advisor will get in touch with you within <strong>30 minutes</strong> (Mon–Sat 9:00 AM – 7:00 PM).</li>
                <li>We will share the comprehensive syllabus, batch schedules, and fee details tailored to your career goals.</li>
                <li>You will receive an invitation to attend a <strong>Free Live Demo Session</strong>.</li>
              </ul>
            </div>
            <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-bottom:24px;">
              <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0f172a;">Need Immediate Assistance?</h3>
              <table style="width:100%;">
                <tr>
                  <td style="padding-right:8px;width:50%;">
                    <a href="https://wa.me/917385204165?text=Hi%2C%20I%20have%20an%20enquiry%20regarding%20HR%20courses" style="display:block;background:#059669;color:#ffffff;text-align:center;padding:12px;border-radius:8px;font-weight:600;font-size:13px;text-decoration:none;">💬 WhatsApp Helpline</a>
                  </td>
                  <td style="padding-left:8px;width:50%;">
                    <a href="tel:+917385204165" style="display:block;background:#0f172a;color:#ffffff;text-align:center;padding:12px;border-radius:8px;font-weight:600;font-size:13px;text-decoration:none;">📞 Call +91 7385204165</a>
                  </td>
                </tr>
              </table>
            </div>
            <div style="background:#f8fafc;border-radius:12px;padding:16px;text-align:center;border:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0f172a;">Explore Our Industry-Ready HR Programs</p>
              <a href="https://recruitmentinstitute.in/courses" style="color:#2563eb;font-size:13px;font-weight:600;text-decoration:underline;">View All Courses &amp; Certifications →</a>
            </div>
          </div>
          <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
            <strong style="color:#64748b;">Recruitment Institute</strong><br/>
            Pune Office: Recruitment Institute, Pune, Maharashtra – 411001<br/>
            Online Training Institute: Live Interactive Sessions Worldwide<br/>
            📧 <a href="mailto:support@recruitmentinstitute.in" style="color:#64748b;">support@recruitmentinstitute.in</a> | 📞 +91 7385204165
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendCourseEnquiryEmail(data: {
  firstName: string
  lastName: string
  email: string
  contact: string
}) {
  const fullName = `${data.firstName} ${data.lastName}`.trim()

  // 1. Notification to Admin
  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `🎓 New Course Enquiry: ${fullName}`,
    html: `
      <div style="background:#f1f5f9;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%);padding:28px 32px;color:#ffffff;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#93c5fd;margin-bottom:6px;">Course Admissions</div>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;">New Course Enquiry</h1>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 20px;font-size:15px;color:#334155;">A new student enquiry has been submitted:</p>
            <table style="width:100%;border-collapse:separate;border-spacing:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;overflow:hidden;">
              <tr>
                <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#64748b;width:30%;border-bottom:1px solid #e2e8f0;">Candidate Name</td>
                <td style="padding:14px 18px;font-size:14px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Email Address</td>
                <td style="padding:14px 18px;font-size:14px;color:#2563eb;border-bottom:1px solid #e2e8f0;"><a href="mailto:${data.email}" style="color:#2563eb;text-decoration:none;font-weight:600;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#64748b;">Contact Number</td>
                <td style="padding:14px 18px;font-size:14px;color:#0f172a;font-weight:600;"><a href="tel:${data.contact}" style="color:#0f172a;text-decoration:none;">${data.contact}</a></td>
              </tr>
            </table>
            <div style="text-align:center;">
              <a href="mailto:${data.email}?subject=Course%20Information%20-%20Recruitment%20Institute" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Contact Student</a>
            </div>
          </div>
        </div>
      </div>
    `,
  })

  // 2. Confirmation to Student
  await sendMail({
    from: FROM,
    to: data.email,
    subject: `Course Enquiry Received — Recruitment Institute`,
    html: `
      <div style="background:#f1f5f9;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%);padding:32px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:6px 16px;border-radius:50px;background:rgba(255,255,255,0.15);color:#93c5fd;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:12px;">Enquiry Received</div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#ffffff;">Thank You, ${data.firstName}!</h1>
            <p style="margin:0;font-size:14px;color:#cbd5e1;">We have received your course enquiry.</p>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">Dear <strong>${data.firstName}</strong>,</p>
            <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">
              Thank you for your interest in advancing your career with <strong>Recruitment Institute</strong>. Our admissions counselor will contact you shortly with complete batch details, fee structure, and syllabus.
            </p>
            <div style="text-align:center;margin-top:24px;">
              <a href="https://wa.me/917385204165?text=Hi%2C%20I%20have%20a%20question%20about%20your%20HR%20courses" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">💬 Chat on WhatsApp (+91 7385204165)</a>
            </div>
          </div>
        </div>
      </div>
    `,
  })
}


export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await sendMail({
    from: FROM,
    to: email,
    subject: 'Password Reset "" Recruitment Institute',
    html: `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="background:#e74c3c;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  })
}

export async function sendRegistrationEmail(data: {
  name: string
  email: string
  type: 'student' | 'membership' | 'candidate'
}) {
  const subject =
    data.type === 'candidate'
      ? 'Registration Received "" Pending Approval'
      : 'Welcome to Recruitment Institute!'

  const body =
    data.type === 'candidate'
      ? `<p>Your registration is pending admin approval. You will receive an email once approved.</p>`
      : `<p>Welcome ${data.name}! Your account has been created successfully.</p>`

  await sendMail({
    from: FROM,
    to: data.email,
    subject,
    html: `<h2>${subject}</h2>${body}`,
  })
}

export async function sendBlogNotificationToSubscribers(
  subscribers: string[],
  blog: { title: string; slug: string }
) {
  const blogUrl = `https://recruitmentinstitute.in/blogs/${blog.slug}`
  for (const email of subscribers) {
    await sendMail({
      from: FROM,
      to: email,
      subject: `New Article: ${blog.title} "" Recruitment Institute`,
      html: `
        <h2>New Blog Post Published</h2>
        <h3>${blog.title}</h3>
        <a href="${blogUrl}">Read Now →</a>
        <br/><br/>
        <small><a href="https://recruitmentinstitute.in/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a></small>
      `,
    })
  }
}

const REMINDER_LABEL: Record<'24h' | '1h' | '15m', string> = {
  '24h': 'tomorrow',
  '1h': 'in 1 hour',
  '15m': 'in 15 minutes',
}

export async function sendSessionReminderEmail(data: {
  studentEmail: string
  studentName: string
  sessionTitle: string
  batchName: string
  sessionDate: string
  startTime: string
  meetLink: string | null
  lead: '24h' | '1h' | '15m'
}) {
  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `Reminder: ${data.sessionTitle} starts ${REMINDER_LABEL[data.lead]}`,
    html: `
      <h2>Upcoming Training Session</h2>
      <p>Hi ${data.studentName},</p>
      <p>Your session <strong>${data.sessionTitle}</strong> (${data.batchName}) starts ${REMINDER_LABEL[data.lead]}.</p>
      <p><strong>Date:</strong> ${data.sessionDate}<br/><strong>Time:</strong> ${data.startTime}</p>
      ${data.meetLink
        ? `<a href="${data.meetLink}" style="background:#2563eb;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Join Session</a>`
        : `<p>The trainer will add the meeting link shortly before the session starts — check your dashboard.</p>`}
      <br/>
      <p>Best regards,<br/>Recruitment Institute Team</p>
    `,
  })
}

export async function sendSessionScheduledEmail(data: {
  studentEmail: string
  studentName: string
  sessionTitle: string
  batchName: string
  courseTitle?: string
  sessionDate?: string
  startTime?: string
  endTime?: string
  meetLink: string | null
  trainerName?: string
}) {
  try {
    const meetButton = data.meetLink
      ? `<div style="margin: 24px 0;">
           <a href="${data.meetLink}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #1e40af, #2563eb); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
             🚀 Join Google Meet Room
           </a>
           <p style="margin-top: 8px; font-size: 12px; color: #64748b;">Link: <a href="${data.meetLink}" style="color: #2563eb;">${data.meetLink}</a></p>
         </div>`
      : `<p style="color: #d97706; font-size: 13px;">The meeting room link will be updated in your student dashboard before class starts.</p>`

    await sendMail({
      from: FROM,
      to: data.studentEmail,
      subject: `New Live Class Scheduled: ${data.sessionTitle} (${data.batchName})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin: 0; font-size: 20px;">📅 New Live Training Session Scheduled</h2>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Recruitment Institute — Live Virtual Classroom</p>
          </div>
          
          <p style="color: #334155; font-size: 14px;">Hi <strong>${data.studentName}</strong>,</p>
          <p style="color: #334155; font-size: 14px;">A new live class has been scheduled for your cohort in <strong>${data.batchName}</strong>${data.courseTitle ? ` (${data.courseTitle})` : ''}.</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 120px;"><strong>Topic:</strong></td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.sessionTitle}</td>
              </tr>
              ${data.sessionDate ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Date:</strong></td>
                <td style="padding: 6px 0; color: #0f172a;">${data.sessionDate}</td>
              </tr>` : ''}
              ${data.startTime ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Time:</strong></td>
                <td style="padding: 6px 0; color: #0f172a;">${data.startTime} ${data.endTime ? `— ${data.endTime}` : ''} (IST)</td>
              </tr>` : ''}
              ${data.trainerName ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Faculty:</strong></td>
                <td style="padding: 6px 0; color: #0f172a;">${data.trainerName}</td>
              </tr>` : ''}
            </table>
          </div>

          ${meetButton}

          <p style="color: #64748b; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Please ensure you have a working microphone and camera before joining. Attendance will be marked by the instructor during the class.
          </p>
          <p style="color: #334155; font-size: 13px; margin-bottom: 0;">Best regards,<br/><strong>Recruitment Institute Academic Team</strong></p>
        </div>
      `,
    })
  } catch (err: any) {
    console.error('Failed to send session scheduled email:', err.message)
  }
}

export async function sendSessionRescheduledEmail(data: {
  studentEmail: string
  studentName: string
  sessionTitle: string
  batchName: string
  meetLink: string | null
}) {
  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `Session Rescheduled: ${data.sessionTitle}`,
    html: `
      <h2>Training Session Updated</h2>
      <p>Hi ${data.studentName},</p>
      <p>Your session <strong>${data.sessionTitle}</strong> (${data.batchName}) has been rescheduled. Check your calendar invite or dashboard for the new date and time.</p>
      ${data.meetLink
        ? `<a href="${data.meetLink}" style="background:#2563eb;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Join Session</a>`
        : ''}
      <br/>
      <p>Best regards,<br/>Recruitment Institute Team</p>
    `,
  })
}

export async function sendSessionCancelledEmail(data: {
  studentEmail: string
  studentName: string
  sessionTitle: string
  batchName: string
  sessionDate: string
  startTime: string
}) {
  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `Session Cancelled: ${data.sessionTitle}`,
    html: `
      <h2>Training Session Cancelled</h2>
      <p>Hi ${data.studentName},</p>
      <p>Your session <strong>${data.sessionTitle}</strong> (${data.batchName}), originally scheduled for ${data.sessionDate} at ${data.startTime}, has been cancelled.</p>
      <p>It has also been removed from your Google Calendar.</p>
      <br/>
      <p>Best regards,<br/>Recruitment Institute Team</p>
    `,
  })
}

export async function sendPaymentConfirmationEmail(data: {
  studentEmail: string
  studentName: string
  courseTitle: string
  amount: number
  transactionId: string
  invoiceNumber: string
}) {
  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `Enrollment Confirmed: ${data.courseTitle} - Recruitment Institute`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0A1628;">
        <h2 style="color: #E63946;">Welcome to Recruitment Institute!</h2>
        <p>Hi <strong>${data.studentName}</strong>,</p>
        <p>Your payment of <strong>₹${Number(data.amount).toLocaleString('en-IN')}</strong> has been successfully processed via Razorpay.</p>
        <p><strong>Course Enrolled:</strong> ${data.courseTitle}</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
        <br/>
        <p>You can now log in to your Student Portal to access your learning schedule, study materials, and live batches:</p>
        <a href="https://recruitmentinstitute.in/student-login" style="background-color: #E63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Access Student Dashboard</a>
        <br/><br/>
        <p>If you have any questions, reply to this email or message our support team on WhatsApp at +91 7385204165.</p>
        <p>Best regards,<br/><strong>Recruitment Institute Admissions Team</strong></p>
      </div>
    `,
  })
}

export async function sendCertificateIssuedEmail(data: {
  studentEmail: string
  studentName: string
  courseTitle: string
  certificateNo: string
  finalScore: number
}) {
  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `🎓 Certificate Issued: ${data.courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0A1628;">
        <h2 style="color: #059669;">Congratulations, ${data.studentName}!</h2>
        <p>You've successfully completed <strong>${data.courseTitle}</strong> with a final score of <strong>${data.finalScore}%</strong>.</p>
        <p>Your certificate of completion has been issued.</p>
        <p><strong>Certificate No:</strong> ${data.certificateNo}</p>
        <br/>
        <a href="https://recruitmentinstitute.in/student-login" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View in Student Portal</a>
        <br/><br/>
        <p>Best regards,<br/><strong>Recruitment Institute Academic Team</strong></p>
      </div>
    `,
  })
}

export async function sendBatchStartReminderEmail(data: {
  recipientEmail: string
  recipientName: string
  role: 'student' | 'trainer'
  batchName: string
  courseTitle: string
  startDate: string
  leadLabel: string // e.g. "in 3 days" or "tomorrow"
}) {
  const isTomorrow = data.leadLabel.toLowerCase().includes('tomorrow') || data.leadLabel.includes('1d')
  const countdownText = isTomorrow ? '🚀 Starts Tomorrow' : '⏳ Starts in 3 Days'
  const countdownColor = isTomorrow ? '#DC2626' : '#2563EB'
  const countdownBg = isTomorrow ? '#FEF2F2' : '#EFF6FF'
  const countdownBorder = isTomorrow ? '#FECACA' : '#BFDBFE'

  const audienceMessage = data.role === 'trainer'
    ? `You are assigned as the master mentor for the upcoming batch <strong style="color:#0F172A;">${data.batchName}</strong>.`
    : `Your live training program for <strong style="color:#0F172A;">${data.courseTitle}</strong> is starting <strong style="color:#2563EB;">${data.leadLabel}</strong>!`

  await sendMail({
    from: FROM,
    to: data.recipientEmail,
    subject: `⏳ [Countdown Reminder] Batch Starts ${data.leadLabel.toUpperCase()}: ${data.batchName} - Recruitment Institute`,
    html: `
      <div style="background-color: #F8FAFC; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 25px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
          
          {/* Header Banner */}
          <div style="background: linear-gradient(135deg, #0A1628 0%, #1E3A8A 100%); padding: 32px 36px; color: #FFFFFF; text-align: center;">
            <div style="display: inline-block; padding: 6px 16px; border-radius: 50px; background: ${countdownBg}; border: 1px solid ${countdownBorder}; color: ${countdownColor}; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px;">
              ${countdownText}
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1.25; letter-spacing: -0.02em;">
              Batch Starting Countdown
            </h1>
            <p style="margin: 8px 0 0; font-size: 13px; color: #94A3B8; font-weight: 500;">
              Get ready for your live interactive sessions &amp; practitioner mentorship
            </p>
          </div>

          {/* Body Content */}
          <div style="padding: 36px 32px;">
            <p style="font-size: 16px; color: #0F172A; margin: 0 0 16px; line-height: 1.5;">
              Dear <strong style="color: #1E3A8A;">${data.recipientName}</strong>,
            </p>

            <p style="font-size: 14px; color: #475569; margin: 0 0 24px; line-height: 1.6;">
              ${audienceMessage} Please review your batch details below and ensure your student portal access is ready.
            </p>

            {/* Batch Info Card */}
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 22px; margin-bottom: 28px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; width: 35%;">Course Program</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 800; color: #0F172A;">${data.courseTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid #F1F5F9;">Batch Name</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 800; color: #2563EB; border-top: 1px solid #F1F5F9;">${data.batchName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid #F1F5F9;">Start Date</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 800; color: #059669; border-top: 1px solid #F1F5F9;">📅 ${data.startDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid #F1F5F9;">Class Mode</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #334155; border-top: 1px solid #F1F5F9;">Live Video Class + LMS Portal</td>
                </tr>
              </table>
            </div>

            {/* Preparation Steps */}
            <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 14px 18px; border-radius: 8px; margin-bottom: 28px;">
              <p style="margin: 0; font-size: 12px; color: #92400E; font-weight: 600; line-height: 1.5;">
                💡 <strong>Pre-session Checklist:</strong> Test your microphone/camera, log into your student dashboard to preview syllabus modules, and check the live Google Meet link prior to session kickoff.
              </p>
            </div>

            {/* Action CTA Button */}
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="https://recruitmentinstitute.in/student-login" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0A1628 0%, #1E3A8A 100%); color: #FFFFFF; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 14px rgba(10,22,40,0.25);">
                Access Student Dashboard &rarr;
              </a>
            </div>

            <p style="font-size: 13px; color: #64748B; line-height: 1.6; margin: 0;">
              Need help or have questions about your batch schedule? Reply directly to this email or connect with admissions on WhatsApp at <a href="https://wa.me/917385204165" style="color: #2563EB; font-weight: 600; text-decoration: none;">+91 7385204165</a>.
            </p>
          </div>

          {/* Footer */}
          <div style="background: #F8FAFC; padding: 20px 32px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; text-align: center; line-height: 1.6;">
            <strong>Recruitment Institute</strong> • Centre for Talent Acquisition &amp; HR Excellence<br/>
            Pune, Maharashtra | Global Online Interactive Training
          </div>
        </div>
      </div>
    `,
  })
}

export { sendMail }

