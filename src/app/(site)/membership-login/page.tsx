import type { Metadata } from 'next'
import PortalLoginClient from '@/components/home/PortalLoginClient'

export const metadata: Metadata = {
  title: 'Membership Login',
  description: 'Access exclusive membership benefits at Recruitment Institute.',
  robots: { index: false, follow: false },
}

export default function MembershipLoginPage() {
  return (
    <PortalLoginClient
      mode="membership"
      endpoint="/api/auth/membership/login"
      title="Membership Login"
      subtitle="Access Exclusive Benefits"
      helperText="Sign in to member-only resources, community access, and exclusive learning content."
      ctaLabel="Membership"
      joinHref="/student-membership"
    />
  )
}
