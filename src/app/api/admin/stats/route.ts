import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalBlogs,
      publishedBlogs,
      totalCourses,
      totalCategories,
      totalContacts,
      totalSubscribers,
      totalCandidates,
      pendingCandidates,
      totalCommunityQuestions,
      totalKnowledgeItems,
      totalCourseLeads,
      totalStudents,
      totalMemberships,
      totalExperts,
      totalFaqs,
      totalTrainers,
      totalBatches,
      activeBatches,
      recentCandidates,
      recentContacts,
      recentCourseLeads,
      recentBlogs,
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.blog.count({ where: { isPublished: true } }),
      prisma.course.count(),
      prisma.courseCategory.count(),
      prisma.contactSubmission.count(),
      prisma.subscriber.count({ where: { isActive: true } }),
      prisma.candidate.count(),
      prisma.candidate.count({ where: { acceptSignin: 0 } }),
      prisma.question.count(),
      prisma.knowledgeItem.count(),
      prisma.courseLead.count(),
      prisma.student.count(),
      prisma.membership.count(),
      prisma.expert.count(),
      prisma.faq.count(),
      prisma.trainer.count(),
      prisma.batch.count(),
      prisma.batch.count({ where: { status: 'ACTIVE' } }),
      prisma.candidate.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, courseSelect: true, createdAt: true, acceptSignin: true },
      }),
      prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, message: true, createdAt: true },
      }),
      prisma.courseLead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, contact: true, createdAt: true },
      }),
      prisma.blog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, author: true, isPublished: true, createdAt: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        blogs: { total: totalBlogs, published: publishedBlogs },
        courses: { total: totalCourses, categories: totalCategories },
        contacts: totalContacts,
        subscribers: totalSubscribers,
        candidates: { total: totalCandidates, pending: pendingCandidates },
        community: { questions: totalCommunityQuestions },
        knowledge: totalKnowledgeItems,
        leads: { course: totalCourseLeads },
        students: totalStudents,
        memberships: totalMemberships,
        experts: totalExperts,
        faqs: totalFaqs,
        trainers: totalTrainers,
        batches: { total: totalBatches, active: activeBatches },
        recent: {
          candidates: recentCandidates,
          contacts: recentContacts,
          courseLeads: recentCourseLeads,
          blogs: recentBlogs,
        },
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
