import nodemailer from 'nodemailer'
import { renderExecutiveEmailHtml, EmailRow } from './email-templates'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  const auth = process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined

  if (process.env.SMTP_SERVICE === 'gmail' || (!process.env.SMTP_HOST && process.env.SMTP_USER?.includes('gmail'))) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth,
    })
    return transporter
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth,
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  })
}

const getFrom = () => `"${process.env.EMAIL_FROM_NAME || 'Recruitment Institute'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER || 'recruitmentinstitute5@gmail.com'}>`
const FROM = `"${process.env.EMAIL_FROM_NAME || 'Recruitment Institute'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER || 'recruitmentinstitute5@gmail.com'}>`
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sesasiba.es@gmail.com'
const getEmailCC = () => process.env.EMAIL_CC || 'sesasiba.es@gmail.com'

async function sendMail(options: nodemailer.SendMailOptions) {
  try {
    const transporter = getTransporter()
    
    // Generate clean text fallback
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
      replyTo: options.replyTo || process.env.EMAIL_FROM || process.env.SMTP_USER,
      ...options,
      text: textContent,
    }
    const info = await transporter.sendMail(mailOptions)
    console.log(`[EmailService] Email sent successfully to ${options.to}. MessageId: ${info.messageId}`)
    return info
  } catch (error) {
    console.error(`[EmailService] Error sending email to ${options.to}:`, error)
    throw error
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONTACT US FORM SUBMISSION
// ─────────────────────────────────────────────────────────────────────────────
export async function sendContactEmail(data: {
  name: string
  email: string
  mobile: string
  message: string
}) {
  const rows: EmailRow[] = [
    { label: 'Full Name', value: data.name },
    { label: 'Email Address', value: data.email, isEmail: true },
    { label: 'Mobile Number', value: data.mobile, isPhone: true },
    { label: 'Message / Query', value: data.message },
  ]

  // 1. Notification to Admin
  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    replyTo: data.email,
    subject: `🎯 New Lead: Contact Form Submission from ${data.name}`,
    html: renderExecutiveEmailHtml({
      badgeText: 'New Lead Enquiry',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      title: 'Contact Form Submission',
      subtitle: `Enquiry submitted by ${data.name}`,
      introText: 'A new visitor has submitted an enquiry through the Recruitment Institute contact form:',
      rows,
      actionButton: {
        text: 'Reply to Candidate',
        url: `mailto:${data.email}?subject=Re:%20Inquiry%20at%20Recruitment%20Institute`,
        color: '#2563eb',
      },
      footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
    }),
  })

  // 2. Professional Confirmation to Candidate
  await sendMail({
    from: FROM,
    to: data.email,
    subject: `Thank you for contacting Recruitment Institute, ${data.name}!`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Inquiry Received',
      badgeBg: '#f0fdf4',
      badgeColor: '#15803d',
      badgeBorder: '#bbf7d0',
      title: `Thank You, ${data.name}!`,
      subtitle: 'We have received your enquiry and our admissions team is reviewing it.',
      introText: 'Thank you for reaching out to <strong>Recruitment Institute</strong> — the leading training institute for End-to-End Recruitment, HR Operations, and Talent Acquisition.<br/><br/><strong>What happens next?</strong><br/>• Our Senior Course Advisor will contact you within 30 minutes.<br/>• We will share the comprehensive syllabus, batch schedules, and customized fee options.<br/>• You will receive an invitation to attend a Free Live Demo Session.',
      rows: [
        { label: 'Inquiry Reference', value: data.name },
        { label: 'Contact Phone', value: data.mobile, isPhone: true },
      ],
      actionButton: {
        text: '💬 Chat on WhatsApp Helpline',
        url: 'https://wa.me/917385204165?text=Hi%2C%20I%20have%20an%20enquiry%20regarding%20HR%20courses',
        color: '#059669',
      },
      secondaryButton: {
        text: 'Explore All Courses & Certifications →',
        url: 'https://recruitmentinstitute.in/courses',
      },
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. COURSE ENQUIRY MODAL SUBMISSION
// ─────────────────────────────────────────────────────────────────────────────
export async function sendCourseEnquiryEmail(data: {
  firstName: string
  lastName: string
  email: string
  contact: string
  courseName?: string
  visitorDate?: string
}) {
  const fullName = `${data.firstName} ${data.lastName}`.trim()
  const courseTitle = data.courseName || 'HR Training Program'
  const rows: EmailRow[] = [
    { label: 'Candidate Name', value: fullName },
    { label: 'Target Course', value: courseTitle, isHighlight: true },
    { label: 'Email Address', value: data.email, isEmail: true },
    { label: 'Contact Number', value: data.contact, isPhone: true },
    ...(data.visitorDate ? [{ label: 'Preferred Date', value: data.visitorDate }] : []),
  ]

  // 1. Notification to Admin
  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    replyTo: data.email,
    subject: `🎓 Course Enquiry: ${fullName} — ${courseTitle}`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Course Lead Alert',
      badgeBg: '#faf5ff',
      badgeColor: '#7e22ce',
      badgeBorder: '#e9d5ff',
      title: 'New Course Enquiry',
      subtitle: `Expressed interest in ${courseTitle}`,
      introText: 'A new candidate has submitted a course information request:',
      rows,
      actionButton: {
        text: 'Contact Student',
        url: `mailto:${data.email}?subject=Course%20Information%20-%20Recruitment%20Institute`,
        color: '#7c3aed',
      },
      footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
    }),
  })

  // 2. Confirmation to Candidate
  await sendMail({
    from: FROM,
    to: data.email,
    subject: `Course Information: ${courseTitle} — Recruitment Institute`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Course Enquiry Received',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      title: `Hello, ${data.firstName}!`,
      subtitle: `Thank you for your interest in ${courseTitle}`,
      introText: 'Thank you for reaching out to <strong>Recruitment Institute</strong>. Our senior counselor will contact you shortly with complete batch details, fee structure, and syllabus.',
      rows: [
        { label: 'Course', value: courseTitle, isHighlight: true },
        { label: 'Contact', value: data.contact, isPhone: true },
      ],
      actionButton: {
        text: '💬 Chat on WhatsApp (+91 7385204165)',
        url: 'https://wa.me/917385204165?text=Hi%2C%20I%20have%20a%20question%20about%20your%20HR%20courses',
        color: '#059669',
      },
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FEES ENQUIRY & EMI SUBMISSION
// ─────────────────────────────────────────────────────────────────────────────
export async function sendFeesEnquiryEmail(data: {
  firstName: string
  lastName?: string
  email: string
  contact: string
  visitorDate?: string
}) {
  const fullName = `${data.firstName} ${data.lastName || ''}`.trim()
  const rows: EmailRow[] = [
    { label: 'Candidate Name', value: fullName },
    { label: 'Email Address', value: data.email, isEmail: true },
    { label: 'Contact Number', value: data.contact, isPhone: true },
    ...(data.visitorDate ? [{ label: 'Preferred Date', value: data.visitorDate }] : []),
  ]

  // 1. Notification to Admin
  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    replyTo: data.email,
    subject: `💰 New Fees Enquiry: ${fullName}`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Fees & EMI Lead',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      badgeBorder: '#fde68a',
      title: 'New Fees Enquiry',
      subtitle: `Requested pricing & installment plan`,
      introText: 'A new candidate requested fee structure and EMI breakdown:',
      rows,
      actionButton: {
        text: 'Share Fee Structure',
        url: `mailto:${data.email}?subject=Fee%20Structure%20-%20Recruitment%20Institute`,
        color: '#d97706',
      },
      footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
    }),
  })

  // 2. Confirmation to Candidate
  await sendMail({
    from: FROM,
    to: data.email,
    subject: `Fee Structure & EMI Information — Recruitment Institute`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Fees Enquiry Received',
      badgeBg: '#f0fdf4',
      badgeColor: '#15803d',
      badgeBorder: '#bbf7d0',
      title: `Hello, ${data.firstName}!`,
      subtitle: 'Thank you for requesting fee information',
      introText: 'We have received your enquiry. Our admissions team will share the complete program pricing, scholarship concessions, and flexible EMI options with you shortly.',
      rows: [
        { label: 'Requested By', value: fullName },
        { label: 'Contact Phone', value: data.contact, isPhone: true },
      ],
      actionButton: {
        text: '💬 Chat on WhatsApp (+91 7385204165)',
        url: 'https://wa.me/917385204165?text=Hi%2C%20I%20requested%20fee%20details%20for%20HR%20courses',
        color: '#059669',
      },
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. REGISTRATION (CANDIDATE / STUDENT)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendRegistrationEmail(data: {
  name: string
  email: string
  type: 'student' | 'membership' | 'candidate'
  phone?: string
  courseSelect?: string
  city?: string
  state?: string
  address?: string
  comments?: string
}) {
  const isCandidate = data.type === 'candidate'
  const locationStr = [data.city, data.state].filter(Boolean).join(', ')

  const adminRows: EmailRow[] = [
    { label: 'Full Name', value: data.name },
    { label: 'Email Address', value: data.email, isEmail: true },
    ...(data.phone ? [{ label: 'Mobile / Phone', value: data.phone, isPhone: true }] : []),
    ...(data.courseSelect ? [{ label: 'Course Track', value: data.courseSelect, isHighlight: true }] : []),
    ...(locationStr ? [{ label: 'Location', value: locationStr }] : []),
    ...(data.address ? [{ label: 'Street Address', value: data.address }] : []),
    ...(data.comments ? [{ label: 'Comments / Goal', value: data.comments }] : []),
  ]

  // 1. ADMIN NOTIFICATION: Send registration details to sesasiba.es@gmail.com
  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    replyTo: data.email,
    subject: `👤 New ${isCandidate ? 'Candidate' : 'Student'} Registration: ${data.name}`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Portal Registration Alert',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      title: `New ${isCandidate ? 'Candidate' : 'Student'} Registered`,
      subtitle: `Account created for ${data.name}`,
      introText: 'A new user has just registered on the Recruitment Institute portal:',
      rows: adminRows,
      actionButton: {
        text: 'Review in Admin Panel →',
        url: 'https://recruitmentinstitute.in/admin/candidates',
        color: '#2563eb',
      },
      footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
    }),
  })

  // 2. CANDIDATE CONFIRMATION
  await sendMail({
    from: FROM,
    to: data.email,
    subject: `Welcome to Recruitment Institute, ${data.name}!`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Registration Received',
      badgeBg: '#f0fdf4',
      badgeColor: '#15803d',
      badgeBorder: '#bbf7d0',
      title: `Welcome, ${data.name}!`,
      subtitle: 'Your candidate enrollment registration is received',
      introText: 'Thank you for registering with <strong>Recruitment Institute</strong>. Our academic team is reviewing your profile and will activate your student access once verified.',
      rows: [
        { label: 'Full Name', value: data.name },
        { label: 'Registered Email', value: data.email, isEmail: true },
        ...(data.courseSelect ? [{ label: 'Selected Track', value: data.courseSelect, isHighlight: true }] : []),
      ],
      actionButton: {
        text: '💬 Connect with Counselor on WhatsApp',
        url: 'https://wa.me/917385204165?text=Hi%2C%20I%20just%20registered%20on%20Recruitment%20Institute',
        color: '#059669',
      },
      secondaryButton: {
        text: 'Go to Candidate Portal →',
        url: 'https://recruitmentinstitute.in/candidate-login',
      },
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ENROLLMENT & PAYMENT CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPaymentConfirmationEmail(data: {
  studentEmail: string
  studentName: string
  courseTitle: string
  amount: number
  transactionId: string
  invoiceNumber: string
  planName?: string
}) {
  const formattedAmount = `₹${data.amount.toLocaleString('en-IN')}`
  const rows: EmailRow[] = [
    { label: 'Student Name', value: data.studentName },
    { label: 'Student Email', value: data.studentEmail, isEmail: true },
    { label: 'Course Enrolled', value: data.courseTitle, isHighlight: true },
    { label: 'Amount Paid', value: formattedAmount, isHighlight: true },
    { label: 'Transaction ID', value: data.transactionId, isMonospace: true },
    { label: 'Invoice Number', value: data.invoiceNumber, isMonospace: true },
  ]

  // 1. ADMIN NOTIFICATION: Send payment alert to sesasiba.es@gmail.com
  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    subject: `💳 [PAYMENT SUCCESS] ${data.studentName} enrolled in ${data.courseTitle} (${formattedAmount})`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Payment & Enrollment Activated',
      badgeBg: '#ecfdf5',
      badgeColor: '#047857',
      badgeBorder: '#a7f3d0',
      title: 'New Enrollment Payment Received',
      subtitle: `${data.studentName} enrolled in ${data.courseTitle}`,
      introText: `A successful fee payment of <strong>${formattedAmount}</strong> has been processed via Razorpay:`,
      rows,
      actionButton: {
        text: 'Manage Student in Admin Panel →',
        url: 'https://recruitmentinstitute.in/admin/enrollments',
        color: '#059669',
      },
      footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
    }),
  })

  // 2. STUDENT CONFIRMATION
  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `Payment Successful! Welcome to ${data.courseTitle} — Recruitment Institute`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Payment Confirmed',
      badgeBg: '#ecfdf5',
      badgeColor: '#047857',
      badgeBorder: '#a7f3d0',
      title: `Welcome, ${data.studentName}!`,
      subtitle: `Your enrollment in ${data.courseTitle} is active`,
      introText: `We have received your payment of <strong>${formattedAmount}</strong>. Your official tax invoice <strong>${data.invoiceNumber}</strong> has been generated and your student dashboard is ready.`,
      rows: [
        { label: 'Course', value: data.courseTitle, isHighlight: true },
        { label: 'Amount Paid', value: formattedAmount },
        { label: 'Transaction Ref', value: data.transactionId, isMonospace: true },
        { label: 'Invoice No', value: data.invoiceNumber, isMonospace: true },
      ],
      actionButton: {
        text: 'Access Student LMS Dashboard →',
        url: 'https://recruitmentinstitute.in/student-login',
        color: '#2563eb',
      },
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. COMMUNITY FORUM ACTIVITY
// ─────────────────────────────────────────────────────────────────────────────
export async function sendCommunityQuestionAdminAlert(data: {
  userName: string
  userEmail?: string | null
  question: string
  questionId: number
}) {
  const rows: EmailRow[] = [
    { label: 'Author Name', value: data.userName },
    ...(data.userEmail ? [{ label: 'Author Email', value: data.userEmail, isEmail: true }] : []),
    { label: 'Question', value: `“${data.question}”` },
  ]

  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    subject: `💬 [Community Discussion] New Question Posted by ${data.userName}`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Community Forum Activity',
      badgeBg: '#eef2ff',
      badgeColor: '#4338ca',
      badgeBorder: '#c7d2fe',
      title: 'New Discussion Question Posted',
      subtitle: `Posted by ${data.userName}`,
      introText: 'A new question has been posted on the Recruitment Institute community discussion board:',
      rows,
      actionButton: {
        text: 'View & Answer in Forum →',
        url: `https://recruitmentinstitute.in/community/${data.questionId}`,
        color: '#4f46e5',
      },
      footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
    }),
  })
}

export async function sendCommunityAnswerAdminAlert(data: {
  authorName: string
  authorEmail?: string | null
  questionText: string
  answer: string
  questionId: number
}) {
  const rows: EmailRow[] = [
    { label: 'Reply Author', value: data.authorName },
    ...(data.authorEmail ? [{ label: 'Author Email', value: data.authorEmail, isEmail: true }] : []),
    { label: 'Original Topic', value: data.questionText },
    { label: 'Submitted Answer', value: data.answer },
  ]

  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    subject: `💬 [Community Reply] ${data.authorName} answered a question`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Community Forum Reply',
      badgeBg: '#f8fafc',
      badgeColor: '#334155',
      badgeBorder: '#cbd5e1',
      title: 'New Reply on Discussion Board',
      subtitle: `Response by ${data.authorName}`,
      introText: 'A member has contributed a reply to a discussion topic:',
      rows,
      actionButton: {
        text: 'Moderate Community Post →',
        url: `https://recruitmentinstitute.in/community/${data.questionId}`,
        color: '#0f172a',
      },
      footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. BATCH CREATION & REMINDERS
// ─────────────────────────────────────────────────────────────────────────────
export async function sendBatchCreatedAdminAlert(data: {
  batchName: string
  courseTitle: string
  startDate: string
  trainerName?: string
  maxSeats?: number
}) {
  const rows: EmailRow[] = [
    { label: 'Batch Name', value: data.batchName },
    { label: 'Course Track', value: data.courseTitle, isHighlight: true },
    { label: 'Start Date', value: data.startDate, isHighlight: true },
    ...(data.trainerName ? [{ label: 'Assigned Trainer', value: data.trainerName }] : []),
    ...(data.maxSeats ? [{ label: 'Max Capacity', value: `${data.maxSeats} Students` }] : []),
  ]

  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    subject: `🚀 [New Batch Alert] ${data.batchName} for ${data.courseTitle}`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Cohort Management',
      badgeBg: '#faf5ff',
      badgeColor: '#7e22ce',
      badgeBorder: '#e9d5ff',
      title: 'New Training Batch Created',
      subtitle: `${data.batchName} • ${data.courseTitle}`,
      introText: 'A new training cohort has been scheduled on the platform:',
      rows,
      actionButton: {
        text: 'Open Batch Management →',
        url: 'https://recruitmentinstitute.in/admin/batches',
        color: '#7c3aed',
      },
      footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
    }),
  })
}

export async function sendBatchStartReminderEmail(data: {
  recipientEmail: string
  recipientName: string
  role: 'student' | 'trainer'
  batchName: string
  courseTitle: string
  startDate: string
  leadLabel: string
}) {
  const rows: EmailRow[] = [
    { label: 'Batch Name', value: data.batchName },
    { label: 'Course Track', value: data.courseTitle, isHighlight: true },
    { label: 'Start Date', value: data.startDate },
    { label: 'Starts In', value: data.leadLabel, isHighlight: true },
  ]

  await sendMail({
    from: FROM,
    to: data.recipientEmail,
    subject: `Reminder: ${data.batchName} starts ${data.leadLabel} (${data.startDate})`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Batch Starting Soon',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      title: `Upcoming Batch: ${data.batchName}`,
      subtitle: `Your cohort starts ${data.leadLabel}`,
      introText: `Hi <strong>${data.recipientName}</strong>,<br/>This is a reminder that your training batch for <strong>${data.courseTitle}</strong> is scheduled to commence <strong>${data.leadLabel}</strong>.`,
      rows,
      actionButton: {
        text: data.role === 'trainer' ? 'Open Trainer Portal →' : 'Access Student Dashboard →',
        url: data.role === 'trainer' ? 'https://recruitmentinstitute.in/trainer-login' : 'https://recruitmentinstitute.in/student-login',
        color: '#2563eb',
      },
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. LIVE SESSIONS & ATTENDANCE REPORT
// ─────────────────────────────────────────────────────────────────────────────
export async function sendSessionAttendanceAdminReportEmail(data: {
  trainerName: string
  batchName: string
  courseTitle: string
  sessionTitle: string
  sessionDate: string
  startTime: string
  endTime?: string
  totalEnrolled: number
  presentCount: number
  absentCount: number
  presentStudentNames?: string[]
  absentStudentNames?: string[]
}) {
  const attendanceRate = data.totalEnrolled > 0
    ? Math.round((data.presentCount / data.totalEnrolled) * 100)
    : 0

  const presentList = data.presentStudentNames && data.presentStudentNames.length > 0
    ? data.presentStudentNames.join(', ')
    : 'None'

  const absentList = data.absentStudentNames && data.absentStudentNames.length > 0
    ? data.absentStudentNames.join(', ')
    : 'None'

  const rows: EmailRow[] = [
    { label: 'Session Title', value: data.sessionTitle },
    { label: 'Batch / Course', value: `${data.batchName} (${data.courseTitle})` },
    { label: 'Trainer', value: data.trainerName },
    { label: 'Date & Time', value: `${data.sessionDate} • ${data.startTime} - ${data.endTime || 'End'}` },
    { label: 'Total Enrolled', value: `${data.totalEnrolled} Students` },
    { label: 'Present Students', value: `${data.presentCount} Present (${attendanceRate}%)`, isHighlight: true },
    { label: 'Absent Students', value: `${data.absentCount} Absent` },
    { label: 'Present Names', value: presentList },
    { label: 'Absent Names', value: absentList },
  ]

  await sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    cc: getEmailCC(),
    subject: `📊 [Session Completed] ${data.sessionTitle} Attendance: ${data.presentCount}/${data.totalEnrolled} (${attendanceRate}%)`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Live Class Attendance Summary',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      title: 'Session Finalized & Attendance Report',
      subtitle: `${data.sessionTitle} • ${data.batchName}`,
      introText: `Live session has concluded and attendance has been verified by mentor <strong>${data.trainerName}</strong>:`,
      rows,
      actionButton: {
        text: 'View Sessions & LMS Logs →',
        url: 'https://recruitmentinstitute.in/admin/sessions',
        color: '#0f172a',
      },
      footerNote: `Delivered to Administrator: ${ADMIN_EMAIL}`,
    }),
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
  const rows: EmailRow[] = [
    { label: 'Session Title', value: data.sessionTitle },
    { label: 'Batch', value: data.batchName },
    ...(data.courseTitle ? [{ label: 'Course', value: data.courseTitle }] : []),
    ...(data.sessionDate ? [{ label: 'Date', value: data.sessionDate }] : []),
    ...(data.startTime ? [{ label: 'Time', value: `${data.startTime} - ${data.endTime || ''}` }] : []),
    ...(data.trainerName ? [{ label: 'Trainer', value: data.trainerName }] : []),
    ...(data.meetLink ? [{ label: 'Google Meet', value: data.meetLink, isMonospace: true }] : []),
  ]

  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `New Live Class Scheduled: ${data.sessionTitle} (${data.batchName})`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Live Class Scheduled',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      title: 'New Live Class Scheduled',
      subtitle: `${data.sessionTitle} • ${data.batchName}`,
      introText: `Hi <strong>${data.studentName}</strong>,<br/>A new live class has been scheduled for your cohort:`,
      rows,
      actionButton: data.meetLink
        ? {
            text: '🚀 Join Google Meet Room',
            url: data.meetLink,
            color: '#2563eb',
          }
        : undefined,
      secondaryButton: {
        text: 'Go to Student Dashboard →',
        url: 'https://recruitmentinstitute.in/student-login',
      },
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. CERTIFICATE & PASSWORD RESET
// ─────────────────────────────────────────────────────────────────────────────
export async function sendCertificateIssuedEmail(data: {
  studentEmail: string
  studentName: string
  courseTitle: string
  certificateNo: string
  finalScore: number
}) {
  const rows: EmailRow[] = [
    { label: 'Student Name', value: data.studentName },
    { label: 'Course Completed', value: data.courseTitle, isHighlight: true },
    { label: 'Certificate No', value: data.certificateNo, isMonospace: true },
    { label: 'Final Score', value: `${data.finalScore}%`, isHighlight: true },
  ]

  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `🎓 Certificate Issued: ${data.courseTitle}`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Official Certification',
      badgeBg: '#ecfdf5',
      badgeColor: '#047857',
      badgeBorder: '#a7f3d0',
      title: 'Congratulations on Your Certification!',
      subtitle: `Issued to ${data.studentName}`,
      introText: `Congratulations <strong>${data.studentName}</strong>! You have successfully completed all curriculum requirements and assessments for <strong>${data.courseTitle}</strong>.`,
      rows,
      actionButton: {
        text: 'Download Official Certificate (PDF) →',
        url: 'https://recruitmentinstitute.in/profile/certificate',
        color: '#059669',
      },
    }),
  })
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await sendMail({
    from: FROM,
    to: email,
    subject: 'Password Reset — Recruitment Institute',
    html: renderExecutiveEmailHtml({
      badgeText: 'Security Alert',
      badgeBg: '#fef2f2',
      badgeColor: '#b91c1c',
      badgeBorder: '#fecaca',
      title: 'Reset Your Password',
      subtitle: 'Account security notification',
      introText: 'We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.',
      rows: [
        { label: 'Account Email', value: email, isEmail: true },
        { label: 'Expiry', value: '1 Hour' },
      ],
      actionButton: {
        text: 'Reset Password Now →',
        url: resetUrl,
        color: '#dc2626',
      },
      footerNote: 'If you did not request a password reset, you can safely ignore this email.',
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. BLOG NOTIFICATIONS & SESSION LIFECYCLE ALERTS
// ─────────────────────────────────────────────────────────────────────────────
export async function sendBlogNotificationToSubscribers(subscribers: Array<string | { email: string }>, post: { title: string; excerpt?: string | null; slug: string }) {
  const postUrl = `https://recruitmentinstitute.in/blogs/${post.slug}`
  for (const sub of subscribers) {
    const email = typeof sub === 'string' ? sub : sub?.email
    if (!email) continue
    sendMail({
      from: FROM,
      to: email,
      subject: `New Article: ${post.title} — Recruitment Institute`,
      html: renderExecutiveEmailHtml({
        badgeText: 'New Article Published',
        badgeBg: '#eff6ff',
        badgeColor: '#1d4ed8',
        badgeBorder: '#bfdbfe',
        title: post.title,
        subtitle: 'HR & Recruitment Industry Insights',
        introText: post.excerpt || 'We have published a new expert guide to help elevate your talent acquisition strategies.',
        rows: [
          { label: 'Published By', value: 'Recruitment Institute Editorial' },
        ],
        actionButton: {
          text: 'Read Full Article →',
          url: postUrl,
          color: '#2563eb',
        },
      }),
    }).catch(console.error)
  }
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
  const leadLabels: Record<string, string> = {
    '24h': 'in 24 hours',
    '1h': 'in 1 hour',
    '15m': 'in 15 minutes',
  }
  const startsIn = leadLabels[data.lead] || `in ${data.lead}`

  const rows: EmailRow[] = [
    { label: 'Session Title', value: data.sessionTitle },
    { label: 'Batch', value: data.batchName },
    { label: 'Date', value: data.sessionDate },
    { label: 'Time', value: data.startTime, isHighlight: true },
    ...(data.meetLink ? [{ label: 'Google Meet', value: data.meetLink, isMonospace: true }] : []),
  ]

  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `Reminder: ${data.sessionTitle} starts ${startsIn}`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Class Starting Soon',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      badgeBorder: '#fde68a',
      title: 'Training Session Reminder',
      subtitle: `${data.sessionTitle} starts ${startsIn}`,
      introText: `Hi <strong>${data.studentName}</strong>,<br/>Your live training class for <strong>${data.batchName}</strong> is about to begin.`,
      rows,
      actionButton: data.meetLink
        ? {
            text: '🚀 Join Live Class Now',
            url: data.meetLink,
            color: '#2563eb',
          }
        : {
            text: 'Open Student Dashboard →',
            url: 'https://recruitmentinstitute.in/student-login',
            color: '#2563eb',
          },
    }),
  })
}

export async function sendSessionRescheduledEmail(data: {
  studentEmail: string
  studentName: string
  sessionTitle: string
  batchName: string
  oldDate?: string
  oldTime?: string
  newDate?: string
  newStartTime?: string
  newEndTime?: string
  meetLink: string | null
}) {
  const rows: EmailRow[] = [
    { label: 'Session Title', value: data.sessionTitle },
    { label: 'Batch', value: data.batchName },
    ...(data.newDate && data.newStartTime ? [{ label: 'New Date & Time', value: `${data.newDate} at ${data.newStartTime}`, isHighlight: true }] : []),
    ...(data.oldDate ? [{ label: 'Previous Schedule', value: `${data.oldDate} at ${data.oldTime || ''}` }] : []),
    ...(data.meetLink ? [{ label: 'Google Meet', value: data.meetLink, isMonospace: true }] : []),
  ]

  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `Schedule Update: ${data.sessionTitle} (${data.batchName})`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Schedule Updated',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      title: 'Session Rescheduled',
      subtitle: `${data.sessionTitle} has a new time`,
      introText: `Hi <strong>${data.studentName}</strong>,<br/>Please note that the timing for your upcoming live class has been updated:`,
      rows,
      actionButton: data.meetLink
        ? {
            text: '🚀 Join Live Room at New Time',
            url: data.meetLink,
            color: '#2563eb',
          }
        : undefined,
    }),
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
  const rows: EmailRow[] = [
    { label: 'Session Title', value: data.sessionTitle },
    { label: 'Batch', value: data.batchName },
    { label: 'Original Schedule', value: `${data.sessionDate} at ${data.startTime}` },
  ]

  await sendMail({
    from: FROM,
    to: data.studentEmail,
    subject: `Session Cancelled: ${data.sessionTitle}`,
    html: renderExecutiveEmailHtml({
      badgeText: 'Session Cancelled',
      badgeBg: '#fef2f2',
      badgeColor: '#b91c1c',
      badgeBorder: '#fecaca',
      title: 'Training Session Cancelled',
      subtitle: `${data.sessionTitle} (${data.batchName})`,
      introText: `Hi <strong>${data.studentName}</strong>,<br/>Your session scheduled for <strong>${data.sessionDate} at ${data.startTime}</strong> has been cancelled. Your trainer or administrator will update the revised schedule in your student dashboard.`,
      rows,
      actionButton: {
        text: 'View Updated Schedule →',
        url: 'https://recruitmentinstitute.in/student-login',
        color: '#0f172a',
      },
    }),
  })
}
