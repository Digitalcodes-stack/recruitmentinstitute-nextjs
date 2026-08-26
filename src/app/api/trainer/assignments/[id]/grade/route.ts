import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { assignmentGradeSchema } from '@/lib/validations'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const assignmentId = parseInt(id)
  if (isNaN(assignmentId)) {
    return NextResponse.json({ success: false, message: 'Invalid assignment ID' }, { status: 400 })
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { batch: { select: { trainerId: true } } },
  })

  if (!assignment) {
    return NextResponse.json({ success: false, message: 'Assignment not found' }, { status: 404 })
  }

  if (assignment.batch.trainerId !== session.userId) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { submissionId, score, feedback } = body

    if (!submissionId) {
      return NextResponse.json({ success: false, message: 'submissionId is required' }, { status: 400 })
    }

    const validated = assignmentGradeSchema.safeParse({
      score: Number(score),
      feedback: feedback || undefined,
    })

    if (!validated.success) {
      return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
    }

    const submission = await prisma.assignmentSubmission.update({
      where: { id: Number(submissionId), assignmentId },
      data: {
        score: validated.data.score,
        feedback: validated.data.feedback || null,
        gradedAt: new Date(),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ success: true, data: submission, message: 'Submission graded successfully' })
  } catch (error) {
    console.error('Error grading submission:', error)
    return NextResponse.json({ success: false, message: 'Failed to grade submission' }, { status: 500 })
  }
}
