import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { assignmentSubmissionSchema } from '@/lib/validations'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const assignmentId = parseInt(id)

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } })
  if (!assignment) return NextResponse.json({ success: false, message: 'Assignment not found' }, { status: 404 })

  const enrolled = await prisma.enrollment.findFirst({ where: { studentId: session.userId, batchId: assignment.batchId } })
  if (!enrolled)
    return NextResponse.json({ success: false, message: 'You are not enrolled in this batch' }, { status: 403 })

  const body = await req.json()
  const validated = assignmentSubmissionSchema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId: session.userId } },
    create: { assignmentId, studentId: session.userId, ...validated.data },
    update: { ...validated.data, submittedAt: new Date(), score: null, feedback: null, gradedAt: null },
  })

  return NextResponse.json({ success: true, data: submission }, { status: 201 })
}
