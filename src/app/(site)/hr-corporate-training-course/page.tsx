import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarRange,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MonitorSmartphone,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'

const BASE_URL = 'https://recruitmentinstitute.in'
const PAGE_URL = `${BASE_URL}/hr-corporate-training-course`

export const metadata: Metadata = {
  title: 'HR Corporate Training Course - Upgrade Your Recruitment Team | Pune',
  description:
    'Customized corporate HR training for companies in Pune and India. Upgrade your internal recruitment team with practical skills in sourcing, interviewing, ATS, and employer branding.',
  keywords:
    'corporate hr training pune, recruitment team training, hr consulting corporate, company HR training india',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'HR Corporate Training Course - Recruitment Institute',
    description: 'Upgrade your internal recruitment team with premium corporate training.',
    url: PAGE_URL,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/assets/images/og-corporate.jpg`,
        width: 1200,
        height: 630,
        alt: 'HR Corporate Training Course',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HR Corporate Training - Recruitment Institute Pune',
    description: 'Upgrade your recruitment team with customized corporate training.',
  },
}

const courseSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course`,
      name: 'Upgrade Your Internal Recruitment Team - Corporate Training',
      description:
        'Tailored corporate training for HR teams and organizations. Reduce time-to-hire, improve quality of hires, and build a world-class recruitment function.',
      url: PAGE_URL,
      provider: { '@type': 'Organization', name: 'Recruitment Institute', url: BASE_URL },
      educationalLevel: 'Corporate',
      inLanguage: 'en-IN',
      courseMode: ['online', 'onsite'],
      offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Courses', item: `${BASE_URL}/courses` },
        { '@type': 'ListItem', position: 3, name: 'HR Corporate Training', item: PAGE_URL },
      ],
    },
  ],
}

const learningPoints = [
  'Team Skill Assessment & Gap Analysis',
  'Advanced Sourcing & Talent Mapping',
  'Structured Interviewing Frameworks',
  'ATS Implementation & Optimization',
  'Employer Branding Strategies',
  'Recruitment Metrics & Reporting',
  'Hiring Manager Alignment',
  'Diversity & Inclusion Hiring',
  'Process Design for Scale',
  'Post-training support and toolkits',
]

const courseInfo = [
  { label: 'Duration', value: 'Flexible', icon: Clock3 },
  { label: 'Learning Mode', value: 'On-site / Online', icon: MonitorSmartphone },
  { label: 'Course Level', value: 'Corporate', icon: Target },
  { label: 'Certification', value: 'Industry Verified', icon: ShieldCheck },
  { label: 'Support', value: 'Mock Interviews & JDs', icon: Users },
]

export default function CorporateTrainingPage() {
  const ldJson = JSON.stringify(courseSchema)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson }} />

      <section className="bg-[#071124] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.28),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.20),transparent_28%),linear-gradient(135deg,#071124_0%,#081733_45%,#0b1f44_100%)]" />
        <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-10 pb-16">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_390px]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                HR Corporate Training Course
              </div>

              <h1 className="max-w-2xl text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-7xl">
                Upgrade Your Internal Recruitment Team
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Tailored corporate training for HR teams and organizations. Reduce time-to-hire,
                improve quality of hires, and build a world-class recruitment function within your
                organization.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {['Flexible Duration', 'On-site / Online Format', 'Corporate Level'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.15)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.38)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(37,99,235,0.45)]"
                >
                  Enquire Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/10"
                >
                  Request Call Back
                  <PhoneCall className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-4 pt-2 lg:pt-6">
              {[
                {
                  title: 'Industry Certificate',
                  desc: 'Verified & recognized',
                  icon: BadgeCheck,
                  tone: 'text-sky-300',
                },
                {
                  title: '5,000+ Trained',
                  desc: 'Working professionals',
                  icon: Users,
                  tone: 'text-cyan-300',
                },
                {
                  title: 'Placement Support',
                  desc: 'Resume + mock interviews',
                  icon: GraduationCap,
                  tone: 'text-orange-300',
                },
              ].map(({ title, desc, icon: Icon, tone }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/7 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.24)] backdrop-blur-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                      <Icon className={`h-6 w-6 ${tone}`} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm text-slate-300">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 h-10 bg-white [clip-path:ellipse(72%_100%_at_50%_0%)] sm:h-14" />
      </section>

      <section className="bg-[#f7faff] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Overview', active: true, icon: BookOpen },
              { label: 'Syllabus', active: false, icon: CalendarRange },
              { label: 'FAQs', active: false, icon: BadgeCheck },
            ].map(({ label, active, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className={[
                  'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition',
                  active
                    ? 'bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.28)]'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-[#08142b] to-[#0d2348] px-8 py-7 text-white">
                <p className="text-2xl font-bold tracking-[-0.03em]">What You Will Learn</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Skills and knowledge designed for modern HR teams and enterprise recruitment
                  functions.
                </p>
              </div>

              <div className="px-8 py-8">
                <div className="grid gap-4 md:grid-cols-2">
                  {learningPoints.map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-[0_8px_26px_rgba(15,23,42,0.03)]"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                      <span className="text-sm font-medium leading-6 text-slate-800">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <aside className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="bg-gradient-to-r from-[#08142b] to-[#0d2348] px-6 py-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Building2 className="h-6 w-6 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-[-0.02em]">HR Corporate Training Course</p>
                    <p className="mt-1 text-sm text-slate-300">Recruitment Institute Certification</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {courseInfo.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between gap-6 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-500">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
