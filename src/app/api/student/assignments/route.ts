import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'

export async function GET() {
  const session = await getUserSession()
  if (!session || session.type !== 'student')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.userId },
    select: { batchId: true },
  })
  const batchIds = enrollments.map((e) => e.batchId)

  const assignments = await prisma.assignment.findMany({
    where: { batchId: { in: batchIds } },
    include: {
      batch: { select: { name: true, course: { select: { title: true } } } },
      submissions: { where: { studentId: session.userId } },
    },
    orderBy: { dueAt: 'asc' },
  })

  return NextResponse.json({ success: true, data: assignments })
}
