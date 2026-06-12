import nodemailer from 'nodemailer'

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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@recruitmentinstitute.in'

export async function sendContactEmail(data: {
  name: string
  email: string
  mobile: string
  message: string
}) {
  await transporter.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <h2>New Contact Enquiry</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Mobile:</strong> ${data.mobile}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
    `,
  })

  await transporter.sendMail({
    from: FROM,
    to: data.email,
    subject: 'Thank you for contacting Recruitment Institute',
    html: `
      <h2>Thank You, ${data.name}!</h2>
      <p>We have received your message and will get back to you within 24 hours.</p>
      <p>In the meantime, feel free to explore our courses at <a href="https://recruitmentinstitute.in">recruitmentinstitute.in</a>.</p>
      <br/>
      <p>Best regards,<br/>Recruitment Institute Team<br/>📞 +91 7385204165</p>
    `,
  })
}

export async function sendCourseEnquiryEmail(data: {
  firstName: string
  lastName: string
  email: string
  contact: string
}) {
  await transporter.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Course Enquiry from ${data.firstName} ${data.lastName}`,
    html: `
      <h2>New Course Enquiry</h2>
      <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Contact:</strong> ${data.contact}</p>
    `,
  })

  await transporter.sendMail({
    from: FROM,
    to: data.email,
    subject: 'Course Enquiry Received "" Recruitment Institute',
    html: `
      <h2>Thank You for Your Interest!</h2>
      <p>Dear ${data.firstName},</p>
      <p>We have received your course enquiry. Our team will contact you shortly.</p>
      <p>📞 +91 7385204165 | âœ‰ï¸ support@recruitmentinstitute.in</p>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
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

  await transporter.sendMail({
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
    await transporter.sendMail({
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
