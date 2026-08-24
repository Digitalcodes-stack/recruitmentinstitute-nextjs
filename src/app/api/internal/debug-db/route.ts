import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [courses, students] = await Promise.all([
      prisma.course.findMany({ select: { id: true, title: true } }),
      prisma.student.findMany({ select: { id: true, name: true, email: true } }),
    ])
    return NextResponse.json({ success: true, courses, students })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) })
  }
}
