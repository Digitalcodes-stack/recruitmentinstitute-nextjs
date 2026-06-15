import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Thank You',
  robots: { index: false, follow: false },
}

export default function ThankYouPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Thank You!</h1>
        <p className="text-gray-600 mb-8">
          Your submission has been received. Our team will contact you within 24 hours.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/courses" className="btn-outline">View Courses</Link>
        </div>
      </div>
    </div>
  )
}
