import type { Metadata } from 'next'
import TrainerLoginClient from '@/components/trainer/TrainerLoginClient'

export const metadata: Metadata = {
  title: 'Trainer Login',
  description: 'Sign in to the Recruitment Institute trainer portal.',
  robots: { index: false, follow: false },
}

export default function TrainerLoginPage() {
  return <TrainerLoginClient />
}
