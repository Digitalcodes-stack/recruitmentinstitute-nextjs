import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Recruitment Institute',
  description: 'Privacy Policy and data protection terms for Recruitment Institute.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-slate-800">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: January 2026</p>

      <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when registering for training programs, contacting us, or using our portals (e.g., name, email address, phone number, and educational background).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
          <p>
            We use the collected information to deliver courses, communicate session updates, issue certificates, and provide placement assistance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to safeguard your personal data against unauthorized access, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy, contact us at{' '}
            <a href="mailto:support@recruitmentinstitute.in" className="text-blue-600 underline">
              support@recruitmentinstitute.in
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
