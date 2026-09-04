import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureSessionSyllabusPdf } from '@/lib/services/sessionSyllabusPdfGenerator'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sessionId = parseInt(id)
  if (isNaN(sessionId)) {
    return NextResponse.json({ success: false, message: 'Invalid session ID' }, { status: 400 })
  }

  // 1. Check session existence
  const classSession = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      batch: {
        include: {
          course: { select: { id: true, title: true } },
          enrollments: {
            select: {
              id: true,
              studentId: true,
              status: true,
            },
          },
        },
      },
      trainer: { select: { id: true, name: true } },
    },
  })

  if (!classSession) {
    return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 })
  }

  // 2. Authentication & Authorization checks
  const adminSession = await getAdminSession()
  const userSession = await getUserSession()

  let isAuthorized = false
  let failureReason = 'Please log in to view the session syllabus.'

  if (adminSession && adminSession.type === 'admin') {
    isAuthorized = true
  } else if (userSession) {
    if (userSession.type === 'trainer') {
      // Trainers can view any session syllabus to teach or prepare
      isAuthorized = true
    } else if (userSession.type === 'student') {
      // Must be enrolled in this batch
      const enrollment = classSession.batch.enrollments.find(
        (e) => e.studentId === userSession.userId
      )

      if (!enrollment) {
        failureReason = 'You are not enrolled in this batch.'
      } else {
        // Must be marked present in attendance
        const attendance = await prisma.attendance.findUnique({
          where: {
            enrollmentId_sessionId: {
              enrollmentId: enrollment.id,
              sessionId,
            },
          },
        })

        if (attendance && attendance.present) {
          isAuthorized = true
        } else {
          failureReason =
            'Access Locked: Session Syllabus PDF & Teaching Notes are exclusively accessible to students who attended this live session.'
        }
      }
    }
  }

  if (!isAuthorized) {
    // If request accepts HTML/browser, redirect or return friendly message
    const acceptsHtml = req.headers.get('accept')?.includes('text/html')
    if (acceptsHtml) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>Access Locked - Recruitment Institute</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
              .card { background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 40px 32px; max-width: 480px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
              .icon { font-size: 44px; margin-bottom: 16px; }
              h1 { font-size: 20px; color: #0f172a; margin: 0 0 10px; font-weight: 800; }
              p { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 24px; }
              .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13.5px; padding: 12px 24px; borderRadius: 10px; transition: background 0.2s; }
              .btn:hover { background: #1d4ed8; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">🔒</div>
              <h1>Access Locked</h1>
              <p>${failureReason}</p>
              <a href="/profile" class="btn">Return to Student Dashboard</a>
            </div>
          </body>
        </html>`,
        {
          status: 403,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      )
    }

    return NextResponse.json(
      { success: false, message: failureReason },
      { status: 403 }
    )
  }

  // 3. Ensure PDF exists and serve
  try {
    const { buffer } = await ensureSessionSyllabusPdf(sessionId)
    const download = req.nextUrl.searchParams.get('download') === '1'
    const safeTitle = classSession.title.replace(/[^a-zA-Z0-9_-]/g, '_')
    const fileName = `${safeTitle}-Syllabus.pdf`

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (err) {
    console.error(`[GET /api/sessions/${sessionId}/syllabus-pdf] Error generating PDF:`, err)
    return NextResponse.json(
      { success: false, message: 'Failed to generate session syllabus PDF' },
      { status: 500 }
    )
  }
}
