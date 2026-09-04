/**
 * sessionSyllabusPdfGenerator.ts
 * World-Class Session Syllabus & Teaching Notes PDF Generator
 * Designed for Recruitment Institute according to top-tier executive training standards
 * (McKinsey Academy / Coursera Enterprise / LinkedIn Learning).
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
  const sessionTimeStr = `${startStr} - ${endStr} IST`

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
        `Welcome students and link today's session on "${moduleTitle}" to the broader recruitment lifecycle.`,
        'Poll the cohort: "How many of you have faced friction or candidate drop-offs at this stage?"',
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
    'Consistency in execution is what separates average recruiters from top 1% executive talent specialists.',
    'Always document your candidate communication trail, objection handling points, and submittal feedback in the ATS.',
    'Complete today\'s practical assignment and submit it via your student portal before the next live session.',
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
 * Builds the executive-designed PDF document stream and writes it to a file.
 */
function renderPdf(data: SessionPdfData, outputPath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 38, bottom: 42, left: 44, right: 44 },
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

    // Strict Corporate Palette
    const PRIMARY_NAVY = '#0F172A'    // Primary Deep Navy
    const ACCENT_INDIGO = '#4F46E5'   // Vibrant Indigo Accent
    const SOFT_BG = '#F8FAFC'         // Slate 50 Card Fill
    const CARD_BORDER = '#E2E8F0'     // Slate 200 Border
    const LIGHT_INDIGO = '#EEF2FF'    // Light Indigo Accent Box
    const LIGHT_GREEN = '#F0FDF4'     // Soft Green Card Fill
    const GREEN_BORDER = '#BBF7D0'    // Soft Green Border
    const TEAL_ACCENT = '#059669'     // Emerald Green Text
    const LIGHT_AMBER = '#FEF3C7'     // Soft Amber Card Fill
    const AMBER_BORDER = '#FDE68A'    // Amber Border
    const AMBER_ACCENT = '#D97706'    // Amber Text/Stripe
    const BODY_TEXT = '#1E293B'       // Slate 800 Charcoal Body Text
    const MUTED_TEXT = '#64748B'      // Slate 500 Subtitle/Muted Text
    const LIGHT_TEXT = '#94A3B8'      // Slate 400

    const contentWidth = 507
    const leftMargin = 44
    const pageBottomLimit = 785

    // Helper: Draw small vector chevron (NO unicode!)
    function drawVectorChevron(x: number, y: number, color = ACCENT_INDIGO) {
      doc.save()
      doc.polygon([x, y], [x + 4.5, y + 3.5], [x, y + 7]).fill(color)
      doc.restore()
    }

    // Helper: Draw clean vector checkmark (NO unicode!)
    function drawVectorCheck(x: number, y: number, color = TEAL_ACCENT) {
      doc.save()
      doc.moveTo(x, y + 3.5)
        .lineTo(x + 3, y + 7)
        .lineTo(x + 8.5, y + 1)
        .strokeColor(color)
        .lineWidth(1.6)
        .stroke()
      doc.restore()
    }

    // Helper: Draw bullet circle (NO unicode!)
    function drawBulletCircle(x: number, y: number, color = ACCENT_INDIGO, radius = 2.2) {
      doc.save()
      doc.circle(x, y, radius).fill(color)
      doc.restore()
    }

    // Running Header on subsequent pages
    function drawRunningHeader() {
      const currentY = 22
      doc.save()
      doc.fillColor(LIGHT_TEXT).fontSize(7.5).font('Helvetica-Bold')
      doc.text('RECRUITMENT INSTITUTE', leftMargin, currentY, { characterSpacing: 0.5 })

      const headerRight = `${data.courseTitle.toUpperCase()}  |  SESSION ${data.sessionNumber}`
      doc.font('Helvetica').fillColor(MUTED_TEXT)
      doc.text(headerRight, leftMargin, currentY, { width: contentWidth, align: 'right' })

      doc.moveTo(leftMargin, currentY + 11)
        .lineTo(leftMargin + contentWidth, currentY + 11)
        .strokeColor(CARD_BORDER)
        .lineWidth(0.5)
        .stroke()
      doc.restore()
      doc.y = 38
    }

    // Check if space needed exceeds page bottom; if so, break page cleanly
    function ensureSpace(neededHeight: number) {
      if (doc.y + neededHeight > pageBottomLimit) {
        doc.addPage()
        drawRunningHeader()
      }
    }

    // Section Header Builder with Orphan Prevention
    function drawSectionHeader(title: string, badgeNumber: string, subtitle?: string, minContentHeight = 65) {
      ensureSpace(38 + minContentHeight)

      doc.moveDown(0.3)
      const currentY = doc.y

      // Large numbered circle in indigo
      doc.save()
      doc.circle(leftMargin + 12, currentY + 11, 11).fill(ACCENT_INDIGO)
      doc.fillColor('#FFFFFF').fontSize(9.5).font('Helvetica-Bold')
      doc.text(badgeNumber, leftMargin, currentY + 5.5, { width: 24, align: 'center' })
      doc.restore()

      // Section Title
      doc.fillColor(PRIMARY_NAVY).fontSize(12).font('Helvetica-Bold')
      doc.text(title, leftMargin + 32, currentY + 2)

      if (subtitle) {
        doc.fillColor(MUTED_TEXT).fontSize(8.2).font('Helvetica')
        doc.text(subtitle, leftMargin + 32, doc.y + 1)
      }

      const lineY = doc.y + 4
      doc.moveTo(leftMargin, lineY)
        .lineTo(leftMargin + contentWidth, lineY)
        .strokeColor(CARD_BORDER)
        .lineWidth(0.75)
        .stroke()

      doc.y = lineY + 6
    }

    // ── PAGE 1: COVER HEADER & CURRICULUM BREAKDOWN ───────────────────────────
    // 1. Dark navy top bar with white text
    doc.rect(0, 0, 595.28, 40).fill(PRIMARY_NAVY)
    doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold')
    doc.text('RECRUITMENT INSTITUTE  •  PRACTICAL TALENT ACQUISITION MASTERCLASS', leftMargin, 16, {
      characterSpacing: 0.8,
    })
    doc.fillColor('#818CF8').fontSize(8).font('Helvetica-Bold')
    doc.text('EXECUTIVE TEACHING GUIDE', leftMargin, 16, { width: contentWidth, align: 'right' })

    // Course Title & Session Header
    doc.y = 52
    doc.fillColor(ACCENT_INDIGO).fontSize(8.5).font('Helvetica-Bold')
    doc.text(`COURSE PROGRAM: ${data.courseTitle.toUpperCase()}`, leftMargin, doc.y, { characterSpacing: 0.5 })

    doc.moveDown(0.2)
    doc.fillColor(PRIMARY_NAVY).fontSize(16).font('Helvetica-Bold')
    doc.text(data.sessionTitle, leftMargin, doc.y)

    // 2. Clean Info Card with Batch, Trainer, Date & Time
    doc.moveDown(0.35)
    const infoCardY = doc.y
    const infoCardHeight = 60

    doc.save()
    doc.roundedRect(leftMargin, infoCardY, contentWidth, infoCardHeight, 8).fillAndStroke(SOFT_BG, CARD_BORDER)
    // Left decorative indigo accent stripe
    doc.roundedRect(leftMargin, infoCardY, 4, infoCardHeight, 2).fill(ACCENT_INDIGO)
    doc.restore()

    // 3 Columns inside Info Card
    const colW = (contentWidth - 28) / 3
    // Col 1: Batch & Mode
    doc.fillColor(MUTED_TEXT).fontSize(7.2).font('Helvetica-Bold')
    doc.text('BATCH COHORT', leftMargin + 16, infoCardY + 10)
    doc.fillColor(BODY_TEXT).fontSize(8.2).font('Helvetica-Bold')
    doc.text(data.batchName, leftMargin + 16, infoCardY + 22, { width: colW })

    // Col 2: Trainer & Credentials
    doc.fillColor(MUTED_TEXT).fontSize(7.2).font('Helvetica-Bold')
    doc.text('LEAD INSTRUCTOR', leftMargin + 16 + colW, infoCardY + 10)
    doc.fillColor(BODY_TEXT).fontSize(8.2).font('Helvetica-Bold')
    doc.text(data.trainerName, leftMargin + 16 + colW, infoCardY + 22, { width: colW })

    // Col 3: Schedule & Meeting
    doc.fillColor(MUTED_TEXT).fontSize(7.2).font('Helvetica-Bold')
    doc.text('SCHEDULE & TIMING', leftMargin + 16 + colW * 2, infoCardY + 10)
    doc.fillColor(BODY_TEXT).fontSize(8.2).font('Helvetica-Bold')
    doc.text(`${data.sessionDateStr}`, leftMargin + 16 + colW * 2, infoCardY + 22, { width: colW })
    doc.fillColor(MUTED_TEXT).fontSize(7.8).font('Helvetica')
    doc.text(data.sessionTimeStr, leftMargin + 16 + colW * 2, infoCardY + 35, { width: colW })

    doc.y = infoCardY + infoCardHeight + 8

    // ── SECTION 01: LEARNING OBJECTIVES ───────────────────────────────────────
    drawSectionHeader('Learning Objectives & Target Capabilities', '01', 'Core competencies attendees master upon completing this session')

    // Calculate dynamic height for objectives box
    const objTextWidth = contentWidth - 42
    let calculatedObjHeight = 16
    data.objectives.forEach((obj) => {
      const h = doc.fontSize(8.5).font('Helvetica-Bold').heightOfString(obj, { width: objTextWidth, lineGap: 1.5 })
      calculatedObjHeight += h + 6
    })

    const objBoxY = doc.y
    doc.save()
    doc.roundedRect(leftMargin, objBoxY, contentWidth, calculatedObjHeight, 8).fillAndStroke(LIGHT_GREEN, GREEN_BORDER)
    doc.restore()

    let objCursor = objBoxY + 10
    data.objectives.forEach((obj) => {
      drawVectorCheck(leftMargin + 14, objCursor, TEAL_ACCENT)
      doc.fillColor(BODY_TEXT).fontSize(8.5).font('Helvetica-Bold')
      doc.text(obj, leftMargin + 28, objCursor, { width: objTextWidth, lineGap: 1.5 })
      objCursor = doc.y + 6
    })

    doc.y = objBoxY + calculatedObjHeight + 8

    // ── SECTION 02: CURRICULUM BREAKDOWN ──────────────────────────────────────
    drawSectionHeader('Detailed Syllabus Topics & Curriculum Breakdown', '02', 'Step-by-step modular components covered in this session')

    data.topics.forEach((t) => {
      ensureSpace(45)

      const tHeaderY = doc.y
      doc.save()
      doc.roundedRect(leftMargin, tHeaderY, contentWidth, 19, 5).fill('#F1F5F9')
      doc.fillColor(PRIMARY_NAVY).fontSize(9).font('Helvetica-Bold')
      doc.text(t.title, leftMargin + 12, tHeaderY + 5)
      doc.restore()

      doc.y = tHeaderY + 23

      t.subtopics.forEach((st) => {
        ensureSpace(20)
        drawBulletCircle(leftMargin + 16, doc.y + 4.5, ACCENT_INDIGO, 1.8)
        doc.fillColor(BODY_TEXT).fontSize(8.3).font('Helvetica')
        doc.text(st, leftMargin + 26, doc.y, { width: contentWidth - 34, lineGap: 1.5 })
        doc.moveDown(0.18)
      })
      doc.moveDown(0.25)
    })

    // ── SECTION 03: TRAINER TEACHING NOTES & TIMELINE ─────────────────────────
    drawSectionHeader('Trainer Teaching Notes & Paced Talking Points', '03', 'Chronological 120-minute delivery framework with talking points')

    // Trainer Guidance Callout (Soft light accent box)
    ensureSpace(34)
    const guidanceY = doc.y
    doc.save()
    doc.roundedRect(leftMargin, guidanceY, contentWidth, 26, 5).fillAndStroke(LIGHT_INDIGO, '#C7D2FE')
    doc.roundedRect(leftMargin, guidanceY, 3.5, 26, 2).fill(ACCENT_INDIGO)
    doc.fillColor('#3730A3').fontSize(8).font('Helvetica-Bold')
    doc.text('PEDAGOGICAL GUIDANCE FOR TRAINER:', leftMargin + 12, guidanceY + 4.5)
    doc.fillColor('#4338CA').fontSize(7.8).font('Helvetica')
    doc.text('Follow this 4-stage delivery timeline. Balance conceptual delivery with live screen-sharing and student interaction.', leftMargin + 12, guidanceY + 15)
    doc.restore()

    doc.y = guidanceY + 32

    // 4 Timeline Segments (Pill-style badges + light background cards)
    data.trainerTalkingPoints.forEach((tp) => {
      ensureSpace(55)

      const segBoxY = doc.y

      // Time Pill Badge + Theme Header
      doc.save()
      doc.roundedRect(leftMargin, segBoxY, 62, 15, 7).fill(ACCENT_INDIGO)
      doc.fillColor('#FFFFFF').fontSize(7.2).font('Helvetica-Bold')
      doc.text(`${tp.timeMinutes} MINS`, leftMargin, segBoxY + 4, { width: 62, align: 'center' })

      doc.fillColor(PRIMARY_NAVY).fontSize(9.2).font('Helvetica-Bold')
      doc.text(tp.theme, leftMargin + 70, segBoxY + 3)
      doc.restore()

      doc.y = segBoxY + 20

      tp.talkingPoints.forEach((pt) => {
        ensureSpace(22)
        drawVectorChevron(leftMargin + 12, doc.y + 2, ACCENT_INDIGO)
        doc.fillColor(BODY_TEXT).fontSize(8.2).font('Helvetica')
        doc.text(pt, leftMargin + 22, doc.y, { width: contentWidth - 28, lineGap: 2 })
        doc.moveDown(0.2)
      })
      doc.moveDown(0.3)
    })

    // ── SECTION 04: KEY CONCEPTS & INDUSTRY CASE STUDIES ──────────────────────
    drawSectionHeader('Key Concepts & Industry Case Studies', '04', 'Applied talent acquisition frameworks & verified corporate benchmarks', 110)

    data.keyConceptsAndCaseStudies.forEach((kc) => {
      const csWidth = contentWidth - 24
      const csDescH = doc.fontSize(7.8).font('Helvetica').heightOfString(kc.realWorldExample, { width: csWidth, lineGap: 1.4 })
      const csBoxHeight = 10 + csDescH + 10
      ensureSpace(40 + csBoxHeight)

      doc.fillColor(PRIMARY_NAVY).fontSize(9.2).font('Helvetica-Bold')
      doc.text(kc.concept, leftMargin, doc.y)
      doc.moveDown(0.14)

      doc.fillColor(BODY_TEXT).fontSize(8.2).font('Helvetica')
      doc.text(kc.explanation, leftMargin, doc.y, { width: contentWidth, lineGap: 1.5 })
      doc.moveDown(0.2)

      // Industry Example & Case Study (Soft yellow/orange callout box)
      const csBoxY = doc.y
      doc.save()
      doc.roundedRect(leftMargin, csBoxY, contentWidth, csBoxHeight, 5).fillAndStroke(LIGHT_AMBER, AMBER_BORDER)
      doc.roundedRect(leftMargin, csBoxY, 4, csBoxHeight, 2).fill(AMBER_ACCENT)
      doc.fillColor('#92400E').fontSize(7.5).font('Helvetica-Bold')
      doc.text('REAL-WORLD CASE STUDY & METRIC BENCHMARK:', leftMargin + 12, csBoxY + 4.5)
      doc.fillColor('#78350F').fontSize(7.8).font('Helvetica')
      doc.text(kc.realWorldExample, leftMargin + 12, csBoxY + 15, { width: csWidth, lineGap: 1.4 })
      doc.restore()

      doc.y = csBoxY + csBoxHeight + 6
    })

    // ── SECTION 05: PRACTICAL CLASSROOM ACTIVITIES & HANDS-ON LAB ─────────────
    drawSectionHeader('Practical Classroom Activities & Exercises', '05', 'Direct classroom simulations and portfolio artifacts', 75)

    data.practicalActivities.forEach((act) => {
      const actWidth = contentWidth - 28
      const titleH = doc.fontSize(9.2).font('Helvetica-Bold').heightOfString(act.title, { width: actWidth })
      const instrH = doc.fontSize(8.2).font('Helvetica').heightOfString(`Instructions: ${act.instructions}`, { width: actWidth, lineGap: 1.4 })
      const delivH = doc.fontSize(8.2).font('Helvetica-Bold').heightOfString(`Tangible Deliverable: ${act.deliverable}`, { width: actWidth, lineGap: 1.4 })
      const actBoxHeight = 8 + titleH + 4 + instrH + 5 + delivH + 8

      ensureSpace(actBoxHeight + 8)

      const actBoxY = doc.y
      doc.save()
      doc.roundedRect(leftMargin, actBoxY, contentWidth, actBoxHeight, 6).fillAndStroke(LIGHT_GREEN, '#86EFAC')
      doc.roundedRect(leftMargin, actBoxY, 4, actBoxHeight, 2).fill(TEAL_ACCENT)

      // Title
      let currentActCursor = actBoxY + 7
      doc.fillColor(TEAL_ACCENT).fontSize(9.2).font('Helvetica-Bold')
      doc.text(act.title, leftMargin + 14, currentActCursor, { width: actWidth })
      currentActCursor = doc.y + 3

      // Instructions
      doc.fillColor(BODY_TEXT).fontSize(8.2).font('Helvetica')
      doc.text(`Instructions: ${act.instructions}`, leftMargin + 14, currentActCursor, { width: actWidth, lineGap: 1.4 })
      currentActCursor = doc.y + 4

      // Tangible Deliverable
      doc.fillColor('#166534').fontSize(8.2).font('Helvetica-Bold')
      doc.text(`Tangible Deliverable: ${act.deliverable}`, leftMargin + 14, currentActCursor, { width: actWidth, lineGap: 1.4 })
      doc.restore()

      doc.y = actBoxY + actBoxHeight + 6
    })

    // ── SECTION 06: RECOMMENDED TOOLS & TECH STACK ────────────────────────────
    drawSectionHeader('Recommended Recruitment Software & Tech Stack', '06', 'Enterprise-grade recruiting tools utilized during this session', 50)

    const toolColWidth = (contentWidth - 10) / 2
    for (let i = 0; i < data.recommendedTools.length; i += 2) {
      ensureSpace(42)

      const rowY = doc.y
      const t1 = data.recommendedTools[i]
      const t2 = data.recommendedTools[i + 1]

      if (t1) {
        doc.save()
        doc.roundedRect(leftMargin, rowY, toolColWidth, 36, 5).fillAndStroke('#FFFFFF', CARD_BORDER)
        doc.fillColor(PRIMARY_NAVY).fontSize(8.8).font('Helvetica-Bold')
        doc.text(t1.name, leftMargin + 10, rowY + 5)

        // Pill badge for category
        doc.roundedRect(leftMargin + toolColWidth - 85, rowY + 4.5, 75, 11, 3).fill(LIGHT_INDIGO)
        doc.fillColor(ACCENT_INDIGO).fontSize(6.8).font('Helvetica-Bold')
        doc.text(t1.category, leftMargin + toolColWidth - 85, rowY + 6.5, { width: 75, align: 'center' })

        doc.fillColor(MUTED_TEXT).fontSize(7.5).font('Helvetica')
        doc.text(t1.usage, leftMargin + 10, rowY + 20, { width: toolColWidth - 20 })
        doc.restore()
      }

      if (t2) {
        const col2X = leftMargin + toolColWidth + 10
        doc.save()
        doc.roundedRect(col2X, rowY, toolColWidth, 36, 5).fillAndStroke('#FFFFFF', CARD_BORDER)
        doc.fillColor(PRIMARY_NAVY).fontSize(8.8).font('Helvetica-Bold')
        doc.text(t2.name, col2X + 10, rowY + 5)

        // Pill badge for category
        doc.roundedRect(col2X + toolColWidth - 85, rowY + 4.5, 75, 11, 3).fill(LIGHT_INDIGO)
        doc.fillColor(ACCENT_INDIGO).fontSize(6.8).font('Helvetica-Bold')
        doc.text(t2.category, col2X + toolColWidth - 85, rowY + 6.5, { width: 75, align: 'center' })

        doc.fillColor(MUTED_TEXT).fontSize(7.5).font('Helvetica')
        doc.text(t2.usage, col2X + 10, rowY + 20, { width: toolColWidth - 20 })
        doc.restore()
      }

      doc.y = rowY + 40
    }

    // ── SECTION 07: CHECK-FOR-UNDERSTANDING & DISCUSSION PROMPTS ──────────────
    drawSectionHeader('Check-for-Understanding & Discussion Prompts', '07', 'Oral viva check and critical scenario analysis', 45)

    data.assessmentQuestions.forEach((q, idx) => {
      ensureSpace(24)

      doc.save()
      doc.roundedRect(leftMargin, doc.y, 22, 13, 4).fill(LIGHT_INDIGO)
      doc.fillColor(ACCENT_INDIGO).fontSize(7.8).font('Helvetica-Bold')
      doc.text(`Q${idx + 1}`, leftMargin, doc.y + 2.5, { width: 22, align: 'center' })
      doc.restore()

      doc.fillColor(BODY_TEXT).fontSize(8.2).font('Helvetica')
      doc.text(q, leftMargin + 28, doc.y, { width: contentWidth - 32, lineGap: 1.6 })
      doc.moveDown(0.18)
    })

    // ── SECTION 08: SUMMARY & ACTION ITEMS ────────────────────────────────────
    drawSectionHeader('Session Summary & Post-Class Action Items', '08', 'Core takeaways and mandatory preparation before next session', 45)

    data.summaryTakeaways.forEach((t) => {
      ensureSpace(20)

      drawVectorCheck(leftMargin + 4, doc.y + 1, TEAL_ACCENT)
      doc.fillColor(BODY_TEXT).fontSize(8.2).font('Helvetica')
      doc.text(t, leftMargin + 22, doc.y, { width: contentWidth - 26, lineGap: 1.6 })
      doc.moveDown(0.18)
    })

    // Institutional Closing Accreditation Card
    ensureSpace(48)
    doc.moveDown(0.3)

    const footCardY = doc.y
    const footCardHeight = 42
    doc.save()
    doc.roundedRect(leftMargin, footCardY, contentWidth, footCardHeight, 6).fillAndStroke(SOFT_BG, CARD_BORDER)
    doc.fillColor(PRIMARY_NAVY).fontSize(8.2).font('Helvetica-Bold')
    doc.text('RECRUITMENT INSTITUTE  •  EXCELLENCE IN RECRUITMENT EDUCATION', leftMargin + 10, footCardY + 7, { width: contentWidth - 20, align: 'center' })
    doc.fillColor(MUTED_TEXT).fontSize(7).font('Helvetica')
    doc.text(
      'Pune Campus & Online Live Cohorts  •  placement@recruitmentinstitute.in  •  recruitmentinstitute.in\nOfficial syllabus & pedagogical teaching guide. All rights reserved.',
      leftMargin + 10,
      footCardY + 19,
      { width: contentWidth - 20, align: 'center', lineGap: 1.8 }
    )
    doc.restore()

    // ── GLOBAL FOOTER ON ALL PAGES (3 NON-OVERLAPPING ZONES) ──────────────────
    const totalPages = doc.bufferedPageRange().count
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i)
      doc.page.margins.bottom = 0 // Disable bottom margin check for footer

      const footerY = 806

      // Thin hairline rule
      doc.moveTo(leftMargin, footerY)
        .lineTo(leftMargin + contentWidth, footerY)
        .strokeColor(CARD_BORDER)
        .lineWidth(0.5)
        .stroke()

      // Zone 1: Left brand & session tag (Width 160pt)
      doc.fillColor(LIGHT_TEXT).fontSize(7.5).font('Helvetica')
      doc.text(
        `Recruitment Institute • Session ${data.sessionNumber}`,
        leftMargin,
        footerY + 6,
        { width: 160, align: 'left', lineBreak: false }
      )

      // Zone 2: Center confidentiality (Strict design rule)
      doc.fillColor(MUTED_TEXT).fontSize(7.5).font('Helvetica')
      doc.text('Recruitment Institute • Confidential – Trainer Copy', leftMargin + 160, footerY + 6, {
        width: contentWidth - 260,
        align: 'center',
        lineBreak: false,
      })

      // Zone 3: Right page count (Width 100pt)
      doc.fillColor(LIGHT_TEXT).fontSize(7.5).font('Helvetica')
      doc.text(`Page ${i + 1} of ${totalPages}`, leftMargin + contentWidth - 100, footerY + 6, {
        width: 100,
        align: 'right',
        lineBreak: false,
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
