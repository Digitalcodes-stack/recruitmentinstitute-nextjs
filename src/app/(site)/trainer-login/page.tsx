import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import TrainerLoginClient from '@/components/trainer/TrainerLoginClient'

export const metadata: Metadata = {
  title: 'Trainer Login | Recruitment Institute',
  description: 'Sign in to the Recruitment Institute trainer portal.',
  robots: { index: false, follow: false },
}

export default async function TrainerLoginPage() {
  const session = await getUserSession()
  if (session && session.type === 'trainer') {
    redirect('/trainer/dashboard')
  }

  return <TrainerLoginClient />
}
