import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

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
