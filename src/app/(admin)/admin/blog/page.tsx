import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminBlogList from '@/components/admin/AdminBlogList'

export default async function AdminBlogPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      _count: { select: { blogFaqs: true } },
    },
  })

  return <AdminBlogList blogs={blogs} />
}
