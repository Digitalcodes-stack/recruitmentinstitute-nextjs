/**
 * sessionSyllabusPdfGenerator.ts
 * Generates an executive, professional Session Syllabus & Teaching Notes PDF
 * ready for the trainer to teach from and for attended students to study.
 */

import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
import { prisma } from '@/lib/prisma'
import { COURSE_BROCHURES } from '@/lib/data/course-brochures'

const PDF_DIR = path.join(process.cwd(), 'public', 'uploads', 'session-syllabuses')

function ensureDirExists() {
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true })
  }
}

export interface SessionPdfData {
  sessionId: number
  sessionNumber: number
  sessionTitle: string
  courseTitle: string
  batchName: string
  trainerName: string
  sessionDateStr: string
  sessionTimeStr: string
  meetLink?: string | null
  moduleTitle: string
  moduleDescription?: string | null
  objectives: string[]
  topics: {
    title: string
    subtopics: string[]
  }[]
  trainerTalkingPoints: {
    timeMinutes: number
    theme: string
    talkingPoints: string[]
  }[]
  keyConceptsAndCaseStudies: {
    concept: string
    explanation: string
    realWorldExample: string
  }[]
  practicalActivities: {
    title: string
    instructions: string
    deliverable: string
  }[]
  recommendedTools: {
    name: string
    category: string
    usage: string
  }[]
  assessmentQuestions: string[]
  summaryTakeaways: string[]
}

/**
 * Derives rich, structured syllabus content for a session using DB models
 * and COURSE_BROCHURES data as available.
 */
async function assembleSessionContent(sessionId: number): Promise<SessionPdfData> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      batch: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  chapters: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                      topics: {
                        orderBy: { sortOrder: 'asc' },
                        include: { lessons: { orderBy: { sortOrder: 'asc' } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      trainer: { select: { id: true, name: true, email: true } },
      syllabusModule: {
        include: {
          chapters: {
            orderBy: { sortOrder: 'asc' },
            include: {
              topics: {
                orderBy: { sortOrder: 'asc' },
                include: { lessons: { orderBy: { sortOrder: 'asc' } } },
              },
            },
          },
        },
      },
    },
  })

  if (!session) {
    throw new Error(`Session with ID ${sessionId} not found`)
  }

  const course = session.batch.course
  const moduleIndex = course.modules.findIndex((m) => m.id === session.syllabusModuleId)
  const sessionNumber = moduleIndex >= 0 ? moduleIndex + 1 : 1

  const moduleTitle = session.syllabusModule?.title || session.moduleNameSnapshot || session.title
  const moduleDesc = session.syllabusModule?.description || session.description

  // Format date and time
  const sessionDateStr = new Date(session.sessionDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  const startStr = new Date(session.startTime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
  const endStr = new Date(session.endTime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
  const sessionTimeStr = `${startStr} – ${endStr} IST`

  // Look for course brochure
  const brochure = COURSE_BROCHURES.find(
    (b) =>
      b.title.toLowerCase().includes(course.title.toLowerCase()) ||
      course.title.toLowerCase().includes(b.title.toLowerCase()) ||
      b.slug === course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  )

  const brochureModule = brochure?.modules.find(
    (m) =>
      m.moduleNumber === sessionNumber ||
      m.title.toLowerCase().includes(moduleTitle.toLowerCase()) ||
      moduleTitle.toLowerCase().includes(m.title.toLowerCase())
  )

  // 1. Objectives
  const objectives: string[] = []
  if (brochureModule?.objective) {
    objectives.push(brochureModule.objective)
  }
  objectives.push(
    `Master practical, industry-standard execution of ${moduleTitle}.`,
    `Apply hands-on recruitment workflows from sourcing, screening to candidate closing.`,
    `Identify common recruitment bottlenecks and optimize hiring turnaround times (TAT).`
  )

  // 2. Topics & Subtopics
  const topics: { title: string; subtopics: string[] }[] = []
  if (session.syllabusModule?.chapters && session.syllabusModule.chapters.length > 0) {
    for (const ch of session.syllabusModule.chapters) {
      topics.push({
        title: ch.title,
        subtopics: ch.topics.flatMap((t) => [t.title, ...t.lessons.map((l) => l.title)]),
      })
    }
  } else if (session.topicsJson && Array.isArray(session.topicsJson)) {
    topics.push({
      title: 'Core Syllabus Focus Areas',
      subtopics: session.topicsJson as string[],
    })
  } else if (brochureModule?.topics && brochureModule.topics.length > 0) {
    topics.push({
      title: 'Core Syllabus Topics',
      subtopics: brochureModule.topics,
    })
  } else {
    topics.push({
      title: moduleTitle,
      subtopics: [
        'Foundational principles & operational workflows',
        'Advanced talent search, qualification & conversion tactics',
        'Industry benchmarking, quality metrics & documentation',
      ],
    })
  }

  // 3. Trainer Talking Points & Pacing
  const trainerTalkingPoints = [
    {
      timeMinutes: 15,
      theme: 'Opening & Context Setting',
      talkingPoints: [
        `Welcome students and link today\'s session on "${moduleTitle}" to the broader recruitment lifecycle.`,
        'Poll the cohort: "How many of you have faced friction or drops at this specific hiring stage?"',
        'State the concrete business outcome: how mastering this makes a recruiter 3x more productive and hire-ready.',
      ],
    },
    {
      timeMinutes: 45,
      theme: 'Deep-Dive Concept Delivery & Frameworks',
      talkingPoints: [
        `Walk through the step-by-step workflow for ${topics[0]?.title || moduleTitle}.`,
        'Demonstrate real-time screen sharing: live Boolean strings, intake forms, or ATS pipeline configuration.',
        'Contrast junior vs. senior recruiter methods: highlight how high-performers avoid time-wasting traps.',
      ],
    },
    {
      timeMinutes: 35,
      theme: 'Live Demonstration & Student Walkthrough',
      talkingPoints: [
        'Execute a live mock demonstration using real candidate profiles or job descriptions.',
        'Call on 2-3 students to suggest search parameters or candidate objection responses in real time.',
        'Emphasize compliance, candidate experience, and metric tracking (Submittal-to-Interview ratio).',
      ],
    },
    {
      timeMinutes: 25,
      theme: 'Hands-on Activity, Q&A & Wrap-Up',
      talkingPoints: [
        'Assign the practical exercise below; give students 15 minutes of structured practice.',
        'Review 2 volunteer submissions and provide immediate tactical critique.',
        'Announce the attendance-gated assignment/assessment and key action items before next class.',
      ],
    },
  ]

  // 4. Key Concepts & Case Studies
  const keyConceptsAndCaseStudies = [
    {
      concept: 'High-Impact Candidate Conversion & Intake Calibration',
      explanation:
        'Recruiting speed is determined in the first 48 hours. Calibrating the exact must-haves versus good-to-haves with hiring managers prevents weeks of futile sourcing.',
      realWorldExample:
        'Case Study: A fast-growing tech startup reduced their Time-to-Fill from 42 days to 16 days by implementing 15-minute calibration intake sheets and 3 benchmark profiles before starting active outreach.',
    },
    {
      concept: 'Predictive Screening & Eliminating Offer Dropouts',
      explanation:
        'Assessing intent, compensation expectations, and competing offers during early stages ensures only high-probability candidates reach the offer table.',
      realWorldExample:
        'Case Study: Enterprise IT services firm increased joining ratio from 68% to 89% by embedding counter-offer risk audits and transparent notice period buy-out protocols during initial screening calls.',
    },
  ]

  // 5. Practical Activities
  const practicalOutcome = brochureModule?.practicalOutcome || 'Completed industry deliverable ready for portfolio.'
  const practicalActivities = [
    {
      title: `Hands-on Lab: ${moduleTitle} Live Execution`,
      instructions: `Using the provided job specification / scenario, build the complete deliverable: ${topics[0]?.subtopics.slice(0, 3).join(', ') || 'strategy template'}.`,
      deliverable: practicalOutcome,
    },
  ]

  // 6. Recommended Tools
  const toolsCovered = brochure?.toolsCovered || [
    { name: 'LinkedIn Recruiter', category: 'Sourcing & Boolean', usage: 'Talent mapping & InMail outreach' },
    { name: 'Naukri Resdex', category: 'Job Portal Database', usage: 'Keyword filtering & active candidate search' },
    { name: 'ChatGPT & Claude', category: 'GenAI Prompting', usage: 'JD enhancement, outreach copy & boolean builder' },
    { name: 'Applicant Tracking Systems (ATS)', category: 'Pipeline Management', usage: 'Candidate tracking & submittal notes' },
  ]

  const recommendedTools = toolsCovered.slice(0, 4).map((t) => ({
    name: t.name,
    category: t.category,
    usage: ('usage' in t && typeof (t as any).usage === 'string') ? (t as any).usage : 'Daily recruiter operations & efficiency',
  }))

  // 7. Assessment & Discussion Points
  const assessmentQuestions = [
    `What are the top 3 failure points when recruiters execute "${moduleTitle}", and how do you mitigate them?`,
    'How do you adjust your recruitment strategy when candidate response rate drops below 15%?',
    'Explain how to measure Return on Effort (ROE) between active outbound sourcing vs. inbound portal applicants.',
    'Role-play question: How would you handle a hiring manager who insists on unrealistic candidate criteria for an urgent requisition?',
  ]

  // 8. Summary & Key Takeaways
  const summaryTakeaways = [
    `Consistency in execution is what separates average recruiters from top 1% executive talent specialists.`,
    `Always document your candidate communication trail, objection handling points, and submittal feedback in the ATS.`,
    `Complete today\'s practical assignment and submit it via your student portal before the next live session.`,
  ]

  return {
    sessionId: session.id,
    sessionNumber,
    sessionTitle: session.title,
    courseTitle: course.title,
    batchName: session.batch.name,
    trainerName: session.trainer.name,
    sessionDateStr,
    sessionTimeStr,
    meetLink: session.meetLink,
    moduleTitle,
    moduleDescription: moduleDesc,
    objectives,
    topics,
    trainerTalkingPoints,
    keyConceptsAndCaseStudies,
    practicalActivities,
    recommendedTools,
    assessmentQuestions,
    summaryTakeaways,
  }
}

/**
 * Builds the PDF document stream and writes it to a file.
 */
function renderPdf(data: SessionPdfData, outputPath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 50, left: 45, right: 45 },
      bufferPages: true,
      info: {
        Title: `${data.sessionTitle} - Syllabus & Teaching Notes`,
        Author: 'Recruitment Institute (recruitmentinstitute.in)',
        Subject: `Teaching Syllabus for ${data.courseTitle}`,
        Keywords: 'Recruitment, Training, Syllabus, Session Notes',
      },
    })

    const buffers: Buffer[] = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers)
      fs.writeFileSync(outputPath, pdfBuffer)
      resolve(pdfBuffer)
    })
    doc.on('error', reject)

    const fileStream = fs.createWriteStream(outputPath)
    doc.pipe(fileStream)

    // Palette
    const PRIMARY = '#1E3A8A'    // Deep Blue
    const SECONDARY = '#2563EB'  // Vibrant Blue
    const DARK = '#0F172A'       // Dark Slate
    const MUTED = '#64748B'      // Slate Gray
    const ACCENT = '#D97706'     // Amber
    const LIGHT_BG = '#F8FAFC'   // Card background
    const BORDER = '#E2E8F0'     // Border gray
    const SUCCESS = '#059669'    // Emerald Green

    const contentWidth = 505

    // Helper: draw section banner
    function drawSectionHeader(title: string, iconNumber: string) {
      if (doc.y > 680) doc.addPage()
      doc.moveDown(0.8)
      const currentY = doc.y

      // Background pill for section number
      doc.roundedRect(45, currentY, 26, 22, 5).fill(SECONDARY)
      doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold')
      doc.text(iconNumber, 45, currentY + 5, { width: 26, align: 'center' })

      // Section title
      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold')
      doc.text(title, 80, currentY + 3)

      doc.moveDown(0.6)
      doc.moveTo(45, doc.y).lineTo(550, doc.y).strokeColor(BORDER).lineWidth(1).stroke()
      doc.moveDown(0.6)
    }

    // ── HEADER (Page 1) ────────────────────────────────────────────────────────
    // Header banner bar
    doc.rect(0, 0, 595.28, 12).fill(PRIMARY)

    doc.moveDown(0.5)
    // RI Brand & Badge
    doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold')
    doc.text('RECRUITMENT INSTITUTE • PRACTICAL TALENT ACQUISITION MASTERCLASS', 45, 26, {
      characterSpacing: 0.8,
    })

    // Course Title
    doc.fillColor(DARK).fontSize(18).font('Helvetica-Bold')
    doc.text(data.courseTitle, 45, 42)

    // Session Title Banner Card
    doc.moveDown(0.5)
    const bannerY = doc.y
    doc.roundedRect(45, bannerY, contentWidth, 72, 8).fillAndStroke('#EFF6FF', '#BFDBFE')

    doc.fillColor(SECONDARY).fontSize(10).font('Helvetica-Bold')
    doc.text(`SESSION ${data.sessionNumber} SYLLABUS & TRAINER TEACHING GUIDE`, 58, bannerY + 12)

    doc.fillColor(DARK).fontSize(15).font('Helvetica-Bold')
    doc.text(data.sessionTitle, 58, bannerY + 28, { width: contentWidth - 26 })

    // Session Meta Badges inside banner
    doc.fillColor(MUTED).fontSize(9.5).font('Helvetica')
    const metaText = `Batch: ${data.batchName}   |   Lead Trainer: ${data.trainerName}   |   Schedule: ${data.sessionDateStr} (${data.sessionTimeStr})`
    doc.text(metaText, 58, bannerY + 50, { width: contentWidth - 26 })

    doc.y = bannerY + 84

    // ── SECTION 1: LEARNING OBJECTIVES ─────────────────────────────────────────
    drawSectionHeader('Learning Objectives & Session Outcomes', '01')
    doc.fillColor(MUTED).fontSize(9.5).font('Helvetica')
    doc.text(
      'By the end of this session, attendees will have mastered the following practical capabilities and industry frameworks:',
      45,
      doc.y,
      { width: contentWidth, lineGap: 3 }
    )
    doc.moveDown(0.5)

    data.objectives.forEach((obj) => {
      const objY = doc.y
      doc.circle(55, objY + 5, 3).fill(SUCCESS)
      doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
      doc.text(obj, 66, objY, { width: contentWidth - 21, lineGap: 3 })
      doc.moveDown(0.3)
    })

    // ── SECTION 2: DETAILED TOPICS & SUBTOPICS ────────────────────────────────
    drawSectionHeader('Detailed Syllabus Topics & Curriculum Breakdown', '02')
    data.topics.forEach((t) => {
      if (doc.y > 700) doc.addPage()
      doc.fillColor(PRIMARY).fontSize(11).font('Helvetica-Bold')
      doc.text(`• ${t.title}`, 45, doc.y)
      doc.moveDown(0.2)

      t.subtopics.forEach((st) => {
        if (doc.y > 720) doc.addPage()
        doc.fillColor(DARK).fontSize(9.5).font('Helvetica')
        doc.text(`   - ${st}`, 55, doc.y, { width: contentWidth - 20, lineGap: 2.5 })
        doc.moveDown(0.2)
      })
      doc.moveDown(0.4)
    })

    // ── SECTION 3: TEACHING NOTES / TALKING POINTS ───────────────────────────
    drawSectionHeader('Trainer Teaching Notes & Paced Talking Points', '03')
    doc.fillColor(MUTED).fontSize(9.5).font('Helvetica-Oblique')
    doc.text(
      'Trainer Guidance: Follow this structured 2-hour pacing model to balance conceptual clarity with practical hands-on application.',
      45,
      doc.y,
      { width: contentWidth, lineGap: 3 }
    )
    doc.moveDown(0.6)

    data.trainerTalkingPoints.forEach((tp) => {
      if (doc.y > 670) doc.addPage()
      const boxY = doc.y
      doc.roundedRect(45, boxY, contentWidth, 24, 4).fill('#F1F5F9')

      doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
      doc.text(`Segment [${tp.timeMinutes} Mins]: ${tp.theme}`, 55, boxY + 6)
      doc.y = boxY + 30

      tp.talkingPoints.forEach((pt) => {
        if (doc.y > 720) doc.addPage()
        doc.fillColor(MUTED).fontSize(9.5).font('Helvetica')
        doc.text(`▶`, 55, doc.y)
        doc.fillColor(DARK).fontSize(9.5).font('Helvetica')
        doc.text(pt, 68, doc.y, { width: contentWidth - 25, lineGap: 3 })
        doc.moveDown(0.3)
      })
      doc.moveDown(0.5)
    })

    // ── SECTION 4: KEY CONCEPTS & CASE STUDIES ───────────────────────────────
    drawSectionHeader('Key Concepts, Case Studies & Real-World Scenarios', '04')
    data.keyConceptsAndCaseStudies.forEach((kc) => {
      if (doc.y > 640) doc.addPage()
      const cardY = doc.y

      doc.fillColor(PRIMARY).fontSize(11).font('Helvetica-Bold')
      doc.text(kc.concept, 45, cardY)
      doc.moveDown(0.3)

      doc.fillColor(DARK).fontSize(9.5).font('Helvetica')
      doc.text(kc.explanation, 45, doc.y, { width: contentWidth, lineGap: 3 })
      doc.moveDown(0.4)

      // Example quote box
      const exY = doc.y
      doc.rect(45, exY, 4, 38).fill(ACCENT)
      doc.rect(49, exY, contentWidth - 4, 38).fill('#FFFBEB')
      doc.fillColor('#92400E').fontSize(9).font('Helvetica-Bold')
      doc.text('INDUSTRY EXAMPLE & CASE STUDY:', 58, exY + 5)
      doc.fillColor('#78350F').fontSize(8.5).font('Helvetica')
      doc.text(kc.realWorldExample, 58, exY + 17, { width: contentWidth - 24, lineGap: 2 })
      doc.y = exY + 46
      doc.moveDown(0.4)
    })

    // ── SECTION 5: PRACTICAL ACTIVITIES & EXERCISES ──────────────────────────
    drawSectionHeader('Practical Classroom Activities & Exercises', '05')
    data.practicalActivities.forEach((act) => {
      if (doc.y > 670) doc.addPage()
      const actY = doc.y
      doc.roundedRect(45, actY, contentWidth, 58, 6).fillAndStroke('#F0FDF4', '#BBF7D0')

      doc.fillColor(SUCCESS).fontSize(10.5).font('Helvetica-Bold')
      doc.text(`⚡ ${act.title}`, 56, actY + 8)

      doc.fillColor(DARK).fontSize(9).font('Helvetica')
      doc.text(`Instructions: ${act.instructions}`, 56, actY + 23, { width: contentWidth - 22, lineGap: 2 })

      doc.fillColor('#15803D').fontSize(8.5).font('Helvetica-Bold')
      doc.text(`Deliverable: ${act.deliverable}`, 56, actY + 42, { width: contentWidth - 22 })

      doc.y = actY + 68
    })

    // ── SECTION 6: RECOMMENDED TOOLS & PLATFORMS ─────────────────────────────
    drawSectionHeader('Recommended Recruitment Tools & Software', '06')
    const toolCardWidth = (contentWidth - 10) / 2
    for (let i = 0; i < data.recommendedTools.length; i += 2) {
      if (doc.y > 680) doc.addPage()
      const rowY = doc.y
      const t1 = data.recommendedTools[i]
      const t2 = data.recommendedTools[i + 1]

      // Col 1
      if (t1) {
        doc.roundedRect(45, rowY, toolCardWidth, 44, 5).fillAndStroke('#F8FAFC', BORDER)
        doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold')
        doc.text(t1.name, 54, rowY + 7)
        doc.fillColor(MUTED).fontSize(8.5).font('Helvetica-Bold')
        doc.text(t1.category, 54, rowY + 19)
        doc.fillColor(DARK).fontSize(8).font('Helvetica')
        doc.text(t1.usage, 54, rowY + 29, { width: toolCardWidth - 16 })
      }

      // Col 2
      if (t2) {
        doc.roundedRect(45 + toolCardWidth + 10, rowY, toolCardWidth, 44, 5).fillAndStroke('#F8FAFC', BORDER)
        doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold')
        doc.text(t2.name, 55 + toolCardWidth + 10, rowY + 7)
        doc.fillColor(MUTED).fontSize(8.5).font('Helvetica-Bold')
        doc.text(t2.category, 55 + toolCardWidth + 10, rowY + 19)
        doc.fillColor(DARK).fontSize(8).font('Helvetica')
        doc.text(t2.usage, 55 + toolCardWidth + 10, rowY + 29, { width: toolCardWidth - 16 })
      }

      doc.y = rowY + 52
    }

    // ── SECTION 7: ASSESSMENT & DISCUSSION POINTS ────────────────────────────
    drawSectionHeader('Check-for-Understanding & Discussion Prompts', '07')
    data.assessmentQuestions.forEach((q, idx) => {
      if (doc.y > 710) doc.addPage()
      doc.fillColor(SECONDARY).fontSize(9.5).font('Helvetica-Bold')
      doc.text(`Q${idx + 1}.`, 45, doc.y)
      doc.fillColor(DARK).fontSize(9.5).font('Helvetica')
      doc.text(q, 64, doc.y, { width: contentWidth - 20, lineGap: 3 })
      doc.moveDown(0.35)
    })

    // ── SECTION 8: SUMMARY & KEY TAKEAWAYS ───────────────────────────────────
    drawSectionHeader('Session Summary & Post-Class Action Items', '08')
    data.summaryTakeaways.forEach((t) => {
      if (doc.y > 710) doc.addPage()
      doc.fillColor(SUCCESS).fontSize(9.5).font('Helvetica-Bold')
      doc.text(`✓`, 45, doc.y)
      doc.fillColor(DARK).fontSize(9.5).font('Helvetica')
      doc.text(t, 60, doc.y, { width: contentWidth - 16, lineGap: 3 })
      doc.moveDown(0.3)
    })

    // Final Footer / Contact Notice
    doc.moveDown(1)
    if (doc.y > 700) doc.addPage()
    const footCardY = doc.y
    doc.roundedRect(45, footCardY, contentWidth, 34, 6).fill('#F1F5F9')
    doc.fillColor(MUTED).fontSize(8.5).font('Helvetica')
    doc.text(
      'Recruitment Institute • Empowering Next-Gen Recruiters & HR Leaders • support@recruitmentinstitute.in • recruitmentinstitute.in',
      45,
      footCardY + 12,
      { width: contentWidth, align: 'center' }
    )

    // ── GLOBAL FOOTER & PAGE NUMBERS ──────────────────────────────────────────
    const totalPages = doc.bufferedPageRange().count
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i)
      // Bottom thin line
      doc.moveTo(45, 800).lineTo(550, 800).strokeColor(BORDER).lineWidth(0.75).stroke()

      // Left copyright
      doc.fillColor(MUTED).fontSize(8).font('Helvetica')
      doc.text(
        `Recruitment Institute © ${new Date().getFullYear()} • ${data.courseTitle} • Session ${data.sessionNumber}`,
        45,
        806
      )

      // Right page number
      doc.text(`Page ${i + 1} of ${totalPages}`, 45, 806, {
        width: contentWidth,
        align: 'right',
      })
    }

    doc.end()
  })
}

/**
 * Ensures that the syllabus PDF for a session is generated and saved.
 * Returns the public URL, file path, and buffer.
 */
export async function ensureSessionSyllabusPdf(
  sessionId: number,
  forceRegenerate = false
): Promise<{ pdfUrl: string; filePath: string; buffer: Buffer }> {
  ensureDirExists()
  const fileName = `session-${sessionId}-syllabus.pdf`
  const filePath = path.join(PDF_DIR, fileName)
  const publicPdfUrl = `/api/sessions/${sessionId}/syllabus-pdf`

  if (!forceRegenerate && fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath)
    // Make sure DB has the URL
    await prisma.session.update({
      where: { id: sessionId },
      data: { syllabusPdfUrl: publicPdfUrl },
    }).catch(() => null)

    return { pdfUrl: publicPdfUrl, filePath, buffer }
  }

  const content = await assembleSessionContent(sessionId)
  const buffer = await renderPdf(content, filePath)

  // Persist URL in DB
  await prisma.session.update({
    where: { id: sessionId },
    data: { syllabusPdfUrl: publicPdfUrl },
  }).catch((err) => {
    console.error(`[ensureSessionSyllabusPdf] Failed to update DB for session ${sessionId}:`, err)
  })

  return { pdfUrl: publicPdfUrl, filePath, buffer }
}
