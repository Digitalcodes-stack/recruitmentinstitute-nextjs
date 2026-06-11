import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminKnowledgeList from '@/components/admin/AdminKnowledgeList'
import type { KnowledgeItem } from '@/types'

export default async function AdminKnowledgePage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const items = await prisma.knowledgeItem.findMany({ orderBy: { createdAt: 'desc' } })

  return <AdminKnowledgeList items={items as KnowledgeItem[]} />
}
