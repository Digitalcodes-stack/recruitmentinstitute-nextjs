import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const courseId = parseInt(id)

  const enrolled = await prisma.enrollment.findFirst({ where: { studentId: session.userId, batch: { courseId } } })
  if (!enrolled)
    return NextResponse.json({ success: false, message: 'You are not enrolled in this course' }, { status: 403 })

  const [course, modules, progress] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, select: { id: true, title: true } }),
    prisma.module.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
          include: {
            topics: {
              orderBy: { sortOrder: 'asc' },
              include: { lessons: { orderBy: { sortOrder: 'asc' }, include: { resources: true } } },
            },
          },
        },
      },
    }),
    prisma.lessonProgress.findMany({
      where: { studentId: session.userId, isCompleted: true },
      select: { lessonId: true },
    }),
  ])

  if (!course) return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })

  return NextResponse.json({
    success: true,
    data: { course, modules, completedLessonIds: progress.map((p) => p.lessonId) },
  })
}
