import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, hashPassword } from '@/lib/auth'
import { syncApprovedCandidatesToStudents } from '@/lib/sync-users'

export async function GET() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  await syncApprovedCandidatesToStudents()

  const data = await prisma.student.findMany({
    include: {
      enrollments: {
        include: {
          batch: {
            select: {
              id: true,
              name: true,
              startDate: true,
              mode: true,
              course: { select: { id: true, title: true } },
              sessions: { select: { id: true, status: true } },
            },
          },
          attendance: {
            select: {
              sessionId: true,
              present: true,
              joinedAt: true,
            },
          },
        },
      },
      assignmentSubmissions: {
        select: {
          id: true,
          score: true,
          submittedAt: true,
          gradedAt: true,
          assignment: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ success: true, data })
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  const { id, isActive } = await req.json()
  const student = await prisma.student.update({ where: { id: Number(id) }, data: { isActive: Boolean(isActive) } })
  return NextResponse.json({ success: true, data: student })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, email, contact, password } = body

    if (!name || !email) {
      return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const existing = await prisma.student.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      return NextResponse.json({ success: false, message: 'A student with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password || 'RI@Student2026')

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        contact: contact ? contact.trim() : null,
        password: hashedPassword,
        isActive: true,
      },
      include: {
        enrollments: {
          include: {
            batch: {
              select: {
                id: true,
                name: true,
                startDate: true,
                mode: true,
                course: { select: { id: true, title: true } },
                sessions: { select: { id: true, status: true } },
              },
            },
          },
        },
        assignmentSubmissions: true,
      },
    })

    return NextResponse.json({ success: true, data: student, message: 'Student created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create student' }, { status: 500 })
  }
}
