import type { Metadata } from 'next'
import PortalLoginClient from '@/components/home/PortalLoginClient'

export const metadata: Metadata = {
  title: 'Student Membership Login',
  description: 'Access your student learning portal at Recruitment Institute.',
}

export default function StudentLoginPage() {
  return (
    <PortalLoginClient
      mode="student"
      endpoint="/api/auth/student/login"
      title="Student Membership Login"
      subtitle="Access Your Learning Portal"
      helperText="Sign in to access your dashboard, course materials, and student resources."
      ctaLabel="Student"
      joinHref="/student-membership"
    />
  )
}
