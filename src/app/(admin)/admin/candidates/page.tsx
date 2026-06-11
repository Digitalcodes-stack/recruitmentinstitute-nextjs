import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminCandidates from '@/components/admin/AdminCandidates'

type CandidateRow = {
  id: number
  name: string
  email: string
  mobile: string | null
  phone: string | null
  courseSelect: string | null
  acceptSignin: number
  createdAt: Date
  city: string | null
  gender: string | null
}

export default async function AdminCandidatesPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, name: true, email: true, mobile: true, courseSelect: true,
      acceptSignin: true, createdAt: true, city: true, gender: true, phone: true,
    },
  })

  return <AdminCandidates candidates={candidates as CandidateRow[]} />
}
