/**
 * sessionSyllabusPdfGenerator.ts
 * Premium, executive-grade Session Syllabus & Teaching Notes PDF generator
 * designed for Recruitment Institute. Follows McKinsey / Coursera enterprise training
 * visual standards with clean typography, strong visual hierarchy, and vector graphics.
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

    // Executive Corporate Palette
    const NAVY_DARK = '#0F172A'      // Deep Slate 900
    const INDIGO_PRIMARY = '#1E1B4B' // Deep Indigo
    const ACCENT_PURPLE = '#4F46E5'  // Indigo Accent
    const TEAL_ACCENT = '#0D9488'    // Subtle Teal
    const AMBER_ACCENT = '#D97706'   // Amber highlight
    const TEXT_BODY = '#1E293B'      // Slate 800
    const TEXT_MUTED = '#64748B'     // Slate 500
    const TEXT_LIGHT = '#94A3B8'     // Slate 400
    const CARD_BG = '#F8FAFC'        // Slate 50
    const CARD_BORDER = '#E2E8F0'    // Slate 200

    const contentWidth = 507
    const leftMargin = 44
    const pageBottomLimit = 780

    // Helper: Draw small vector triangle/chevron (NO unicode!)
    function drawVectorChevron(x: number, y: number, color = ACCENT_PURPLE) {
      doc.save()
      doc.polygon([x, y], [x + 4, y + 3], [x, y + 6]).fill(color)
      doc.restore()
    }

    // Helper: Draw clean vector checkmark (NO unicode!)
    function drawVectorCheck(x: number, y: number, color = TEAL_ACCENT) {
      doc.save()
      doc.moveTo(x, y + 3)
        .lineTo(x + 2.5, y + 6)
        .lineTo(x + 7.5, y + 1)
        .strokeColor(color)
        .lineWidth(1.5)
        .stroke()
      doc.restore()
    }

    // Helper: Draw bullet circle (NO unicode!)
    function drawBulletCircle(x: number, y: number, color = ACCENT_PURPLE, radius = 2) {
      doc.save()
      doc.circle(x, y, radius).fill(color)
      doc.restore()
    }

    // Running Header on Pages 2, 3, 4...
    function drawRunningHeader() {
      const currentY = 22
      doc.save()
      doc.fillColor(TEXT_LIGHT).fontSize(7.5).font('Helvetica-Bold')
      doc.text('RECRUITMENT INSTITUTE', leftMargin, currentY, { characterSpacing: 0.5 })

      const headerRight = `${data.courseTitle.toUpperCase()}  |  SESSION ${data.sessionNumber}`
      doc.font('Helvetica').fillColor(TEXT_MUTED)
      doc.text(headerRight, leftMargin, currentY, { width: contentWidth, align: 'right' })

      doc.moveTo(leftMargin, currentY + 11)
        .lineTo(leftMargin + contentWidth, currentY + 11)
        .strokeColor(CARD_BORDER)
        .lineWidth(0.5)
        .stroke()
      doc.restore()
      doc.y = 38
    }

    // Section Header Builder
    function drawSectionHeader(title: string, badgeNumber: string, subtitle?: string) {
      // If within 50pt of footer, move to next page
      if (doc.y > pageBottomLimit - 50) {
        doc.addPage()
        drawRunningHeader()
      }

      doc.moveDown(0.4)
      const currentY = doc.y

      // Number badge pill
      doc.save()
      doc.roundedRect(leftMargin, currentY, 24, 18, 5).fill(INDIGO_PRIMARY)
      doc.fillColor('#FFFFFF').fontSize(9.5).font('Helvetica-Bold')
      doc.text(badgeNumber, leftMargin, currentY + 4, { width: 24, align: 'center' })
      doc.restore()

      // Title
      doc.fillColor(NAVY_DARK).fontSize(12).font('Helvetica-Bold')
      doc.text(title, leftMargin + 32, currentY + 2.5)

      if (subtitle) {
        doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica')
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

    // ── PAGE 1: HERO, OBJECTIVES & CURRICULUM BREAKDOWN ───────────────────────
    // Top colored accent bars
    doc.rect(0, 0, 595.28, 4).fill(INDIGO_PRIMARY)
    doc.rect(0, 4, 595.28, 2).fill(ACCENT_PURPLE)

    // Header brand
    doc.y = 26
    doc.fillColor(ACCENT_PURPLE).fontSize(8).font('Helvetica-Bold')
    doc.text('RECRUITMENT INSTITUTE  •  EXECUTIVE TALENT ACQUISITION MASTERCLASS', leftMargin, doc.y, {
      characterSpacing: 0.6,
    })

    // Course Title
    doc.moveDown(0.15)
    doc.fillColor(NAVY_DARK).fontSize(15).font('Helvetica-Bold')
    doc.text(data.courseTitle, leftMargin, doc.y)

    // Hero Card Container
    doc.moveDown(0.35)
    const heroY = doc.y
    const heroHeight = 72

    doc.save()
    doc.roundedRect(leftMargin, heroY, contentWidth, heroHeight, 8).fillAndStroke(CARD_BG, CARD_BORDER)
    doc.roundedRect(leftMargin, heroY, 4, heroHeight, 2).fill(ACCENT_PURPLE)
    doc.restore()

    // Hero Badge
    const badgeText = `SESSION ${data.sessionNumber}  |  SYLLABUS & TRAINER TEACHING GUIDE`
    doc.save()
    doc.roundedRect(leftMargin + 14, heroY + 10, 240, 15, 4).fill('#EEF2FF')
    doc.fillColor(ACCENT_PURPLE).fontSize(7.5).font('Helvetica-Bold')
    doc.text(badgeText, leftMargin + 20, heroY + 13.5)
    doc.restore()

    // Session Title
    doc.fillColor(NAVY_DARK).fontSize(13.5).font('Helvetica-Bold')
    doc.text(data.sessionTitle, leftMargin + 14, heroY + 30, { width: contentWidth - 28 })

    // Meta Details
    doc.fillColor(TEXT_MUTED).fontSize(8.5).font('Helvetica')
    const metaString = `Batch: ${data.batchName}   |   Lead Trainer: ${data.trainerName}   |   ${data.sessionDateStr} (${data.sessionTimeStr})`
    doc.text(metaString, leftMargin + 14, heroY + 51, { width: contentWidth - 28 })

    doc.y = heroY + heroHeight + 6

    // ── SECTION 01: LEARNING OBJECTIVES ───────────────────────────────────────
    drawSectionHeader('Learning Objectives & Session Outcomes', '01', 'Core competencies attendees master upon completing this session')

    const objBoxY = doc.y
    const objBoxHeight = data.objectives.length * 18 + 12
    doc.save()
    doc.roundedRect(leftMargin, objBoxY, contentWidth, objBoxHeight, 6).fillAndStroke('#F0FDF4', '#BBF7D0')
    doc.restore()

    let objCursor = objBoxY + 8
    data.objectives.forEach((obj) => {
      drawVectorCheck(leftMargin + 12, objCursor, TEAL_ACCENT)
      doc.fillColor(TEXT_BODY).fontSize(8.5).font('Helvetica-Bold')
      doc.text(obj, leftMargin + 26, objCursor, { width: contentWidth - 36, lineGap: 1.5 })
      objCursor = doc.y + 4
    })

    doc.y = objBoxY + objBoxHeight + 6

    // ── SECTION 02: CURRICULUM BREAKDOWN ──────────────────────────────────────
    drawSectionHeader('Detailed Syllabus Topics & Curriculum Breakdown', '02', 'Step-by-step modular components covered in this session')

    data.topics.forEach((t) => {
      if (doc.y > pageBottomLimit - 50) {
        doc.addPage()
        drawRunningHeader()
      }

      const tHeaderY = doc.y
      doc.save()
      doc.roundedRect(leftMargin, tHeaderY, contentWidth, 19, 4).fill('#F1F5F9')
      doc.fillColor(INDIGO_PRIMARY).fontSize(9).font('Helvetica-Bold')
      doc.text(t.title, leftMargin + 10, tHeaderY + 5)
      doc.restore()

      doc.y = tHeaderY + 23

      t.subtopics.forEach((st) => {
        if (doc.y > pageBottomLimit - 25) {
          doc.addPage()
          drawRunningHeader()
        }
        drawBulletCircle(leftMargin + 14, doc.y + 4, ACCENT_PURPLE, 1.8)
        doc.fillColor(TEXT_BODY).fontSize(8.2).font('Helvetica')
        doc.text(st, leftMargin + 24, doc.y, { width: contentWidth - 32, lineGap: 1.5 })
        doc.moveDown(0.18)
      })
      doc.moveDown(0.25)
    })

    // ── PAGE 2: TRAINER TEACHING NOTES & TIMELINE ─────────────────────────────
    doc.addPage()
    drawRunningHeader()

    drawSectionHeader('Trainer Teaching Notes & Paced Talking Points', '03', 'Chronological 120-minute delivery framework with talking points')

    // Trainer Guidance Callout
    const guidanceY = doc.y
    doc.save()
    doc.roundedRect(leftMargin, guidanceY, contentWidth, 24, 4).fillAndStroke('#FFFBEB', '#FDE68A')
    doc.fillColor('#92400E').fontSize(8).font('Helvetica-Bold')
    doc.text('PEDAGOGICAL GUIDANCE FOR TRAINER:', leftMargin + 10, guidanceY + 4)
    doc.fillColor('#78350F').fontSize(7.8).font('Helvetica')
    doc.text('Follow this 4-stage pacing model. Balance conceptual clarity with live screen-sharing and student role-plays.', leftMargin + 10, guidanceY + 13)
    doc.restore()

    doc.y = guidanceY + 30

    // 4 Timeline Segments
    data.trainerTalkingPoints.forEach((tp) => {
      if (doc.y > pageBottomLimit - 70) {
        doc.addPage()
        drawRunningHeader()
      }

      const segBoxY = doc.y

      // Time Pill Badge + Theme
      doc.save()
      doc.roundedRect(leftMargin, segBoxY, 62, 15, 7.5).fill(INDIGO_PRIMARY)
      doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold')
      doc.text(`${tp.timeMinutes} MINS`, leftMargin, segBoxY + 4, { width: 62, align: 'center' })

      doc.fillColor(NAVY_DARK).fontSize(9.2).font('Helvetica-Bold')
      doc.text(tp.theme, leftMargin + 70, segBoxY + 3)
      doc.restore()

      doc.y = segBoxY + 19

      tp.talkingPoints.forEach((pt) => {
        if (doc.y > pageBottomLimit - 25) {
          doc.addPage()
          drawRunningHeader()
        }
        drawVectorChevron(leftMargin + 10, doc.y + 2, ACCENT_PURPLE)
        doc.fillColor(TEXT_BODY).fontSize(8.2).font('Helvetica')
        doc.text(pt, leftMargin + 20, doc.y, { width: contentWidth - 26, lineGap: 2 })
        doc.moveDown(0.2)
      })
      doc.moveDown(0.35)
    })

    // ── PAGE 3: CASE STUDIES, LABS & RECRUITMENT TECH STACK ───────────────────
    doc.addPage()
    drawRunningHeader()

    // SECTION 04: KEY CONCEPTS & CASE STUDIES
    drawSectionHeader('Key Concepts & Industry Case Studies', '04', 'Applied talent acquisition frameworks & corporate hiring benchmarks')

    data.keyConceptsAndCaseStudies.forEach((kc) => {
      if (doc.y > pageBottomLimit - 85) {
        doc.addPage()
        drawRunningHeader()
      }

      doc.fillColor(INDIGO_PRIMARY).fontSize(9.5).font('Helvetica-Bold')
      doc.text(kc.concept, leftMargin, doc.y)
      doc.moveDown(0.15)

      doc.fillColor(TEXT_BODY).fontSize(8.2).font('Helvetica')
      doc.text(kc.explanation, leftMargin, doc.y, { width: contentWidth, lineGap: 1.8 })
      doc.moveDown(0.25)

      // Case Study Box
      const csBoxY = doc.y
      const csBoxHeight = 34
      doc.save()
      doc.roundedRect(leftMargin, csBoxY, contentWidth, csBoxHeight, 4).fillAndStroke(CARD_BG, CARD_BORDER)
      doc.rect(leftMargin, csBoxY, 3, csBoxHeight).fill(AMBER_ACCENT)
      doc.fillColor('#B45309').fontSize(7.5).font('Helvetica-Bold')
      doc.text('CASE STUDY BENCHMARK:', leftMargin + 10, csBoxY + 4)
      doc.fillColor(TEXT_BODY).fontSize(7.8).font('Helvetica')
      doc.text(kc.realWorldExample, leftMargin + 10, csBoxY + 14, { width: contentWidth - 18, lineGap: 1.5 })
      doc.restore()

      doc.y = csBoxY + csBoxHeight + 6
    })

    // SECTION 05: PRACTICAL LABS & DELIVERABLES
    drawSectionHeader('Practical Classroom Activities & Exercises', '05', 'Direct classroom simulations and portfolio artifacts')

    data.practicalActivities.forEach((act) => {
      if (doc.y > pageBottomLimit - 60) {
        doc.addPage()
        drawRunningHeader()
      }

      const actBoxY = doc.y
      const actBoxHeight = 48
      doc.save()
      doc.roundedRect(leftMargin, actBoxY, contentWidth, actBoxHeight, 6).fillAndStroke('#F0FDF4', '#86EFAC')
      doc.fillColor(TEAL_ACCENT).fontSize(9).font('Helvetica-Bold')
      doc.text(act.title, leftMargin + 12, actBoxY + 6)

      doc.fillColor(TEXT_BODY).fontSize(8).font('Helvetica')
      doc.text(`Instructions: ${act.instructions}`, leftMargin + 12, actBoxY + 19, { width: contentWidth - 24, lineGap: 1.5 })

      doc.fillColor('#166534').fontSize(8).font('Helvetica-Bold')
      doc.text(`Deliverable: ${act.deliverable}`, leftMargin + 12, actBoxY + 33, { width: contentWidth - 24 })
      doc.restore()

      doc.y = actBoxY + actBoxHeight + 6
    })

    // SECTION 06: RECOMMENDED TECH STACK
    drawSectionHeader('Recommended Recruitment Software & Tech Stack', '06', 'Enterprise-grade recruiting tools utilized during this session')

    const toolColWidth = (contentWidth - 10) / 2
    for (let i = 0; i < data.recommendedTools.length; i += 2) {
      if (doc.y > pageBottomLimit - 44) {
        doc.addPage()
        drawRunningHeader()
      }

      const rowY = doc.y
      const t1 = data.recommendedTools[i]
      const t2 = data.recommendedTools[i + 1]

      if (t1) {
        doc.save()
        doc.roundedRect(leftMargin, rowY, toolColWidth, 38, 4).fillAndStroke(CARD_BG, CARD_BORDER)
        doc.fillColor(INDIGO_PRIMARY).fontSize(8.8).font('Helvetica-Bold')
        doc.text(t1.name, leftMargin + 8, rowY + 5)
        doc.fillColor(ACCENT_PURPLE).fontSize(7.2).font('Helvetica-Bold')
        doc.text(t1.category, leftMargin + 8, rowY + 16)
        doc.fillColor(TEXT_MUTED).fontSize(7.2).font('Helvetica')
        doc.text(t1.usage, leftMargin + 8, rowY + 26, { width: toolColWidth - 14 })
        doc.restore()
      }

      if (t2) {
        const col2X = leftMargin + toolColWidth + 10
        doc.save()
        doc.roundedRect(col2X, rowY, toolColWidth, 38, 4).fillAndStroke(CARD_BG, CARD_BORDER)
        doc.fillColor(INDIGO_PRIMARY).fontSize(8.8).font('Helvetica-Bold')
        doc.text(t2.name, col2X + 8, rowY + 5)
        doc.fillColor(ACCENT_PURPLE).fontSize(7.2).font('Helvetica-Bold')
        doc.text(t2.category, col2X + 8, rowY + 16)
        doc.fillColor(TEXT_MUTED).fontSize(7.2).font('Helvetica')
        doc.text(t2.usage, col2X + 8, rowY + 26, { width: toolColWidth - 14 })
        doc.restore()
      }

      doc.y = rowY + 44
    }

    // ── PAGE 4: VIVA ASSESSMENT, ACTION ITEMS & CLOSING ACCREDITATION ──────────
    doc.addPage()
    drawRunningHeader()

    // SECTION 07: VIVA & ASSESSMENT POINTS
    drawSectionHeader('Check-for-Understanding & Discussion Prompts', '07', 'Oral viva check and critical scenario analysis')

    data.assessmentQuestions.forEach((q, idx) => {
      if (doc.y > pageBottomLimit - 30) {
        doc.addPage()
        drawRunningHeader()
      }

      doc.fillColor(ACCENT_PURPLE).fontSize(8.5).font('Helvetica-Bold')
      doc.text(`Q${idx + 1}.`, leftMargin, doc.y)
      doc.fillColor(TEXT_BODY).fontSize(8.2).font('Helvetica')
      doc.text(q, leftMargin + 20, doc.y, { width: contentWidth - 24, lineGap: 2 })
      doc.moveDown(0.25)
    })

    // SECTION 08: SUMMARY & ACTION ITEMS
    drawSectionHeader('Session Summary & Post-Class Action Items', '08', 'Core takeaways and mandatory preparation before next session')

    data.summaryTakeaways.forEach((t) => {
      if (doc.y > pageBottomLimit - 25) {
        doc.addPage()
        drawRunningHeader()
      }

      drawVectorCheck(leftMargin + 2, doc.y + 1, TEAL_ACCENT)
      doc.fillColor(TEXT_BODY).fontSize(8.2).font('Helvetica')
      doc.text(t, leftMargin + 18, doc.y, { width: contentWidth - 22, lineGap: 2 })
      doc.moveDown(0.25)
    })

    // Institutional Closing Accreditation Card
    doc.moveDown(0.8)
    if (doc.y > pageBottomLimit - 50) {
      doc.addPage()
      drawRunningHeader()
    }

    const footCardY = doc.y
    const footCardHeight = 46
    doc.save()
    doc.roundedRect(leftMargin, footCardY, contentWidth, footCardHeight, 6).fillAndStroke(CARD_BG, CARD_BORDER)
    doc.fillColor(INDIGO_PRIMARY).fontSize(8.5).font('Helvetica-Bold')
    doc.text('RECRUITMENT INSTITUTE  •  EXCELLENCE IN RECRUITMENT EDUCATION', leftMargin + 10, footCardY + 8, { width: contentWidth - 20, align: 'center' })
    doc.fillColor(TEXT_MUTED).fontSize(7.5).font('Helvetica')
    doc.text(
      'Pune Campus & Online Live Programs  •  placement@recruitmentinstitute.in  •  recruitmentinstitute.in\nOfficial syllabus & pedagogical teaching guide. All rights reserved.',
      leftMargin + 10,
      footCardY + 22,
      { width: contentWidth - 20, align: 'center', lineGap: 2 }
    )
    doc.restore()

    // ── GLOBAL FOOTER ON ALL PAGES ────────────────────────────────────────────
    const totalPages = doc.bufferedPageRange().count
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i)
      doc.page.margins.bottom = 0 // Disable bottom margin check for footer

      const footerY = 804

      // Thin hairline rule
      doc.moveTo(leftMargin, footerY)
        .lineTo(leftMargin + contentWidth, footerY)
        .strokeColor(CARD_BORDER)
        .lineWidth(0.5)
        .stroke()

      // Left brand tag
      doc.fillColor(TEXT_LIGHT).fontSize(7.5).font('Helvetica')
      doc.text(
        `Recruitment Institute • ${data.courseTitle} • Session ${data.sessionNumber}`,
        leftMargin,
        footerY + 6,
        { lineBreak: false }
      )

      // Center confidentiality
      doc.text('Confidential - For Enrolled Training Use', leftMargin, footerY + 6, {
        width: contentWidth,
        align: 'center',
        lineBreak: false,
      })

      // Right page count
      doc.text(`Page ${i + 1} of ${totalPages}`, leftMargin, footerY + 6, {
        width: contentWidth,
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
