import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  lessonId: z.number().int().positive(),
  isCompleted: z.boolean(),
})

export async function POST(req: NextRequest) {
  const session = await getUserSession()
  if (!session || session.type !== 'student')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const validated = schema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { lessonId, isCompleted } = validated.data

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { topic: { select: { chapter: { select: { module: { select: { courseId: true } } } } } } },
  })
  if (!lesson) return NextResponse.json({ success: false, message: 'Lesson not found' }, { status: 404 })

  const courseId = lesson.topic.chapter.module.courseId
  const enrolled = await prisma.enrollment.findFirst({
    where: { studentId: session.userId, batch: { courseId } },
  })
  if (!enrolled)
    return NextResponse.json({ success: false, message: 'You are not enrolled in this course' }, { status: 403 })

  const progress = await prisma.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: session.userId, lessonId } },
    update: { isCompleted, completedAt: isCompleted ? new Date() : null },
    create: { studentId: session.userId, lessonId, isCompleted, completedAt: isCompleted ? new Date() : null },
  })

  return NextResponse.json({ success: true, data: progress })
}
