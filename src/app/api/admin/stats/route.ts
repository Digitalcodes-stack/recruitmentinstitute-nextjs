import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [
      totalStudents,
      activeStudents,
      totalTrainers,
      activeTrainers,
      totalBatches,
      activeBatches,
      totalCourses,
      totalCategories,
      pendingEnrollments,
      totalEnrollments,
      totalFeePayments,
      monthlyFeePayments,
      totalAttendanceCount,
      presentAttendanceCount,
      pendingAssignmentReviews,
      upcomingSessions,
      recentEnrollments,
      recentSubmissions,
      recentCandidates,
      recentContacts,
      batchTelemetry,
      topCourses,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.trainer.count(),
      prisma.trainer.count({ where: { isActive: true } }),
      prisma.batch.count(),
      prisma.batch.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count(),
      prisma.courseCategory.count(),
      prisma.enrollment.count({ where: { status: 'PENDING' } }),
      prisma.enrollment.count(),
      prisma.feePayment.findMany({
        where: { status: 'CAPTURED' },
        select: { amount: true },
      }),
      prisma.feePayment.findMany({
        where: {
          status: 'CAPTURED',
          createdAt: { gte: startOfMonth },
        },
        select: { amount: true },
      }),
      prisma.attendance.count(),
      prisma.attendance.count({ where: { present: true } }),
      prisma.assignmentSubmission.count({ where: { gradedAt: null } }),
      prisma.session.findMany({
        where: {
          sessionDate: { gte: todayStart },
          status: { in: ['UPCOMING', 'LIVE'] },
        },
        include: {
          batch: {
            select: {
              id: true,
              name: true,
              course: { select: { id: true, title: true } },
              _count: { select: { enrollments: true } },
            },
          },
          trainer: { select: { id: true, name: true, image: true } },
        },
        orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
        take: 6,
      }),
      prisma.enrollment.findMany({
        orderBy: { enrolledAt: 'desc' },
        take: 6,
        include: {
          student: { select: { id: true, name: true, email: true, contact: true } },
          batch: {
            select: {
              id: true,
              name: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.assignmentSubmission.findMany({
        orderBy: { submittedAt: 'desc' },
        take: 6,
        include: {
          student: { select: { id: true, name: true, email: true } },
          assignment: {
            select: {
              id: true,
              title: true,
              batch: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.student.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true, isActive: true },
      }),
      prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, message: true, createdAt: true },
      }),
      prisma.batch.findMany({
        where: { status: { in: ['ACTIVE', 'UPCOMING'] } },
        include: {
          course: { select: { id: true, title: true } },
          trainer: { select: { id: true, name: true } },
          _count: { select: { enrollments: true, sessions: true } },
        },
        orderBy: { startDate: 'desc' },
        take: 6,
      }),
      prisma.course.findMany({
        include: {
          category: { select: { id: true, name: true, slug: true } },
          batches: {
            select: {
              id: true,
              name: true,
              status: true,
              _count: { select: { enrollments: true } },
            },
          },
        },
        take: 5,
      }),
    ])

    const totalRevenue = totalFeePayments.reduce((acc, p) => acc + Number(p.amount || 0), 0)
    const mtdRevenue = monthlyFeePayments.reduce((acc, p) => acc + Number(p.amount || 0), 0)
    const avgAttendance = totalAttendanceCount > 0
      ? Math.round((presentAttendanceCount / totalAttendanceCount) * 100)
      : 88

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalStudents,
          activeStudents,
          totalTrainers,
          activeTrainers,
          totalBatches,
          activeBatches,
          totalCourses,
          totalCategories,
          pendingEnrollments,
          totalEnrollments,
          totalRevenue,
          mtdRevenue,
          avgAttendance,
          pendingAssignmentReviews,
        },
        upcomingSessions,
        recentActivity: {
          enrollments: recentEnrollments,
          submissions: recentSubmissions,
          students: recentCandidates,
          candidates: recentCandidates.map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            courseSelect: 'Enrolled Student',
            createdAt: s.createdAt,
            acceptSignin: s.isActive ? 1 : 0,
          })),
          contacts: recentContacts,
        },
        batchTelemetry,
        topCourses: topCourses.map((c) => {
          const enrolledCount = c.batches.reduce((sum, b) => sum + b._count.enrollments, 0)
          return {
            id: c.id,
            title: c.title,
            category: c.category.name,
            categorySlug: c.category.slug,
            activeBatchesCount: c.batches.filter((b) => b.status === 'ACTIVE').length,
            enrolledCount,
          }
        }),
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ success: false, message: 'Failed to load stats' }, { status: 500 })
  }
}
