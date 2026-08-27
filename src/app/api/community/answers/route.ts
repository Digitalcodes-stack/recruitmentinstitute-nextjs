import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { communityAnswerSchema } from '@/lib/validations'
import { sendCommunityAnswerAdminAlert } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const questionId = parseInt(searchParams.get('questionId') || '0')

    if (!questionId) {
      return NextResponse.json(
        { success: false, message: 'questionId is required' },
        { status: 400 }
      )
    }

    const answers = await prisma.answer.findMany({
      where: { questionId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { name: true, email: true } } },
    })

    return NextResponse.json({ success: true, data: answers })
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
        { success: false, message: 'Please login to post an answer' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = communityAnswerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: 'Answer must be at least 5 characters' },
        { status: 400 }
      )
    }

    const { questionId, answer } = validated.data

    const question = await prisma.question.findUnique({ where: { id: questionId } })
    if (!question) {
      return NextResponse.json(
        { success: false, message: 'Question not found' },
        { status: 404 }
      )
    }

    // Ensure a CommunityUser row exists for this session (upsert by email).
    const communityUser = await prisma.communityUser.upsert({
      where: { email: session.email },
      update: {},
      create: {
        name: session.name,
        email: session.email,
        password: '',
      },
    })

    const newAnswer = await prisma.answer.create({
      data: { answer, questionId, userId: communityUser.id },
      include: { user: { select: { name: true, email: true } } },
    })

    await sendCommunityAnswerAdminAlert({
      authorName: communityUser.name || session.name || 'Community Member',
      authorEmail: session.email,
      questionText: question.question,
      answer: newAnswer.answer,
      questionId: question.id,
    }).catch(console.error)

    return NextResponse.json({ success: true, data: newAnswer }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
