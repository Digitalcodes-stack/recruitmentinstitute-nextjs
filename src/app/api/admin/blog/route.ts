import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { blogSchema } from '@/lib/validations'
import { sendBlogNotificationToSubscribers } from '@/lib/email'

function requireAdmin(session: Awaited<ReturnType<typeof getAdminSession>>) {
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    const authError = requireAdmin(session)
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.blog.count(),
    ])

    return NextResponse.json({ success: true, data: blogs, total })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    const authError = requireAdmin(session)
    if (authError) return authError

    const body = await req.json()

    // Auto-generate slug from title
    if (!body.slug && body.title) {
      const slugify = (await import('slugify')).default
      body.slug = slugify(body.title, { lower: true, strict: true })
    }

    const validated = blogSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
    }

    const blog = await prisma.blog.create({
      data: {
        title: validated.data.title,
        slug: body.slug,
        content: validated.data.content,
        author: validated.data.author,
        metaTitle: validated.data.metaTitle,
        metaKeywords: validated.data.metaKeywords,
        metaDescription: validated.data.metaDescription,
        canonicalUrl: validated.data.canonicalUrl,
        isPublished: validated.data.isPublished,
        featuredImage: body.featuredImage,
      },
    })

    // Email subscribers if published
    if (blog.isPublished) {
      const subscribers = await prisma.subscriber.findMany({
        where: { isActive: true },
        select: { email: true },
      })
      const emails = subscribers.map((s) => s.email)
      if (emails.length > 0) {
        sendBlogNotificationToSubscribers(emails, { title: blog.title, slug: blog.slug }).catch(console.error)
      }
    }

    return NextResponse.json({ success: true, data: blog }, { status: 201 })
  } catch (error) {
    console.error('Create blog error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
