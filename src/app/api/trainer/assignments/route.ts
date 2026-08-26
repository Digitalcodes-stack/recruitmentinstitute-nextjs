import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { assignmentSchema } from '@/lib/validations'

export async function GET() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const assignments = await prisma.assignment.findMany({
    where: { batch: { trainerId: session.userId } },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
          course: { select: { title: true } },
          _count: { select: { enrollments: true } },
        },
      },
      submissions: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
    orderBy: { dueAt: 'desc' },
  })

  const formatted = assignments.map((a) => {
    const totalEnrolled = a.batch._count.enrollments
    const totalSubmissions = a.submissions.length
    const pendingGrading = a.submissions.filter((s) => s.score === null).length
    const gradedCount = a.submissions.filter((s) => s.score !== null).length

    return {
      id: a.id,
      title: a.title,
      description: a.description,
      fileUrl: a.fileUrl,
      dueAt: a.dueAt,
      createdAt: a.createdAt,
      batchId: a.batch.id,
      batchName: a.batch.name,
      courseTitle: a.batch.course.title,
      totalEnrolled,
      totalSubmissions,
      pendingGrading,
      gradedCount,
      submissions: a.submissions.map((s) => ({
        id: s.id,
        studentId: s.student.id,
        studentName: s.student.name,
        studentEmail: s.student.email,
        fileUrl: s.fileUrl,
        note: s.note,
        submittedAt: s.submittedAt,
        score: s.score ? Number(s.score) : null,
        feedback: s.feedback,
        gradedAt: s.gradedAt,
      })),
    }
  })

  return NextResponse.json({ success: true, data: formatted })
}

export async function POST(req: NextRequest) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validated = assignmentSchema.safeParse({
      ...body,
      batchId: Number(body.batchId),
    })

    if (!validated.success) {
      return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
    }

    // Verify batch belongs to trainer
    const batch = await prisma.batch.findFirst({
      where: { id: validated.data.batchId, trainerId: session.userId },
    })

    if (!batch) {
      return NextResponse.json({ success: false, message: 'Batch not found or not assigned to you' }, { status: 404 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        batchId: validated.data.batchId,
        title: validated.data.title,
        description: validated.data.description || null,
        fileUrl: validated.data.fileUrl || null,
        dueAt: new Date(validated.data.dueAt),
      },
      include: {
        batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      },
    })

    return NextResponse.json({ success: true, data: assignment }, { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ success: false, message: 'Failed to create assignment' }, { status: 500 })
  }
}
