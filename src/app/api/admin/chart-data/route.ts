import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Build monthly buckets for last 6 months
    const now = new Date()
    const months: { label: string; start: Date; end: Date }[] = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
      months.push({
        label: start.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
        start,
        end,
      })
    }

    const countByMonth = async (
      model: 'courseLead' | 'contactSubmission' | 'student' | 'subscriber',
      dateField = 'createdAt',
    ) => {
      return Promise.all(
        months.map(m =>
          (prisma[model] as any).count({
            where: { [dateField]: { gte: m.start, lte: m.end } },
          }),
        ),
      )
    }

    const [leads, contacts, students, subscribers] = await Promise.all([
      countByMonth('courseLead'),
      countByMonth('contactSubmission'),
      countByMonth('student'),
      countByMonth('subscriber'),
    ])

    return NextResponse.json({
      success: true,
      data: {
        labels: months.map(m => m.label),
        series: {
          candidates: students,
          leads,
          contacts,
          students,
          subscribers,
        },
      },
    })
  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
