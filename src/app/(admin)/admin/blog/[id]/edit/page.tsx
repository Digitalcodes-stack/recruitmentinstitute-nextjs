import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminBlogForm from '@/components/admin/AdminBlogForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBlogPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } })
  if (!blog) notFound()

  return <AdminBlogForm blog={blog as any} />
}
