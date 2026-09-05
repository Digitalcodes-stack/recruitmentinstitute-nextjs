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

  try {
    const body = await req.json()
    const { id, name, email, contact, isActive, password } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'Student ID is required' }, { status: 400 })
    }

    const currentStudent = await prisma.student.findUnique({ where: { id: Number(id) } })
    if (!currentStudent) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 })
    }

    const updateData: any = {}

    if (name !== undefined) {
      if (!name.trim()) return NextResponse.json({ success: false, message: 'Name cannot be empty' }, { status: 400 })
      updateData.name = name.trim()
    }

    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail.includes('@')) {
        return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 })
      }
      if (cleanEmail !== currentStudent.email.toLowerCase()) {
        const existing = await prisma.student.findUnique({ where: { email: cleanEmail } })
        if (existing && existing.id !== Number(id)) {
          return NextResponse.json({ success: false, message: 'A student with this email already exists' }, { status: 409 })
        }
      }
      updateData.email = cleanEmail
    }

    if (contact !== undefined) {
      updateData.contact = contact ? contact.trim() : null
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive)
    }

    let hashedPassword: string | undefined = undefined
    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 })
      }
      hashedPassword = await hashPassword(password.trim())
      updateData.password = hashedPassword
    }

    const updatedStudent = await prisma.student.update({
      where: { id: Number(id) },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updatedStudent, message: 'Student updated successfully' })
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update student' }, { status: 500 })
  }
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
