import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Recruitment Institute',
  description: 'Terms of Service and conditions for Recruitment Institute courses and portals.',
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-slate-800">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: January 2026</p>

      <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the services, website, or portal of Recruitment Institute, you agree to be bound by these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Training & Certifications</h2>
          <p>
            Course materials, assignments, and certificates are provided for personal educational use. Reproduction or commercial redistribution without prior written consent is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. User Conduct & Account Security</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their portal credentials and for all activities that occur under their account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Support & Queries</h2>
          <p>
            For any queries regarding training or terms, reach us at{' '}
            <a href="mailto:support@recruitmentinstitute.in" className="text-blue-600 underline">
              support@recruitmentinstitute.in
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
