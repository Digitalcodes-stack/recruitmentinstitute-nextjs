import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { communityQuestionSchema } from '@/lib/validations'
import { sendCommunityQuestionAdminAlert } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const query = searchParams.get('q') || ''

    const where = query ? { question: { contains: query, mode: 'insensitive' as const } } : {}

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          user: { select: { name: true } },
          _count: { select: { answers: true } },
        },
      }),
      prisma.question.count({ where }),
    ])

    return NextResponse.json({ success: true, data: questions, total })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession()

    // Accept both community-registered users and candidates (site members)
    if (!session || !['community', 'candidate'].includes(session.type)) {
      return NextResponse.json(
        { success: false, message: 'Please login to post a question' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = communityQuestionSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: 'Question must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Ensure a CommunityUser row exists for this session (upsert by email).
    // This bridges candidates who log in via candidate_login to the community
    // questions table which requires a foreign key into registers.
    const communityUser = await prisma.communityUser.upsert({
      where: { email: session.email },
      update: {},
      create: {
        name: session.name,
        email: session.email,
        password: '',   // placeholder – login is handled via candidate_login table
      },
    })

    const question = await prisma.question.create({
      data: { question: validated.data.question, userId: communityUser.id },
      include: { user: { select: { name: true } } },
    })

    await sendCommunityQuestionAdminAlert({
      userName: communityUser.name || session.name || 'Community Member',
      userEmail: session.email,
      question: question.question,
      questionId: question.id,
    }).catch(console.error)

    return NextResponse.json({ success: true, data: question }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
