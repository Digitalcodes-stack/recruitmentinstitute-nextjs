import type { Metadata } from 'next'
import CandidateLoginClient from '@/components/home/CandidateLoginClient'

export const metadata: Metadata = {
  title: 'Login / Register',
  description: 'Login or register as a candidate at Recruitment Institute.',
}

export default function CandidateLoginPage() {
  return <CandidateLoginClient />
}
