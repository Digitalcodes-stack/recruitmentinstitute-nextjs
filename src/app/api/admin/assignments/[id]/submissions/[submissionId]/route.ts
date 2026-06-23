import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { assignmentGradeSchema } from '@/lib/validations'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; submissionId: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id, submissionId } = await params
  const body = await req.json()
  const validated = assignmentGradeSchema.safeParse({
    ...body,
    score: Number(body.score),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const submission = await prisma.assignmentSubmission.update({
    where: { id: parseInt(submissionId), assignmentId: parseInt(id) },
    data: { ...validated.data, gradedAt: new Date() },
  })
  return NextResponse.json({ success: true, data: submission })
}
