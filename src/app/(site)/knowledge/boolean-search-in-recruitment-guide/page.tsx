import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  ArrowRight,
  Layers,
  Sparkles,
  ExternalLink,
  Users,
  Compass,
  FileCode,
  Globe,
  Share2,
  Cpu,
  Server,
  Briefcase,
  TrendingUp,
  HeartPulse,
  Database,
  Terminal,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import {
  PILLAR_PAGE_DATA,
  BOOLEAN_FAQ_PAGES,
  FAQ_CATEGORIES,
} from '@/lib/data/boolean-knowledge-data'
import CopyBooleanButton from '@/components/site/CopyBooleanButton'
import { generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE, BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: PILLAR_PAGE_DATA.metaTitle,
  description: PILLAR_PAGE_DATA.metaDescription,
  alternates: {
    canonical: PILLAR_PAGE_DATA.canonicalUrl,
  },
  openGraph: {
    title: PILLAR_PAGE_DATA.metaTitle,
    description: PILLAR_PAGE_DATA.metaDescription,
    url: PILLAR_PAGE_DATA.canonicalUrl,
    type: 'article',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Boolean Search in Recruitment: Complete Guide - Recruitment Institute',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PILLAR_PAGE_DATA.metaTitle,
    description: PILLAR_PAGE_DATA.metaDescription,
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function BooleanSearchPillarPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Knowledge Hub', url: '/knowledge' },
    { name: 'Boolean Search Guide', url: '/knowledge/boolean-search-in-recruitment-guide' },
  ])

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: PILLAR_PAGE_DATA.title,
    description: PILLAR_PAGE_DATA.metaDescription,
    url: PILLAR_PAGE_DATA.canonicalUrl,
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': PILLAR_PAGE_DATA.canonicalUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'Recruitment Institute',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Recruitment Institute',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
      },
    },
    datePublished: '2026-01-15T00:00:00Z',
    dateModified: '2026-10-07T00:00:00Z',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white pt-16 pb-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(124,58,237,0.15),transparent_50%)] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/knowledge" className="hover:text-blue-400 transition-colors">Knowledge Hub</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-blue-400">Boolean Search Guide</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Canonical Sourcing Authority &bull; {PILLAR_PAGE_DATA.lastUpdated}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white mb-6">
            Boolean Search in Recruitment:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">
              The Complete Master Guide
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mb-10 font-normal">
            The definitive masterclass for talent acquisition specialists, agency headhunters, and executive sourcers. Master core Boolean operators, mathematical order of precedence, Google X-Ray sourcing, ATS candidate mining, and copy-paste production strings across 5 enterprise domains.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold">{BOOLEAN_FAQ_PAGES.length} Dedicated Playbook Guides</span>
            </div>
            <span>&bull;</span>
            <span>{PILLAR_PAGE_DATA.readTime}</span>
            <span>&bull;</span>
            <span>Author: Principal Talent Acquisition Practice, Recruitment Institute</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Quick Navigation Sidebar */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" /> Guide Chapters
                </h3>
                <nav className="space-y-1.5 text-xs font-semibold text-slate-600">
                  <a href="#definition" className="block p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition">1. What is Boolean Search?</a>
                  <a href="#core-operators" className="block p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition">2. Core Operators &amp; Syntax</a>
                  <a href="#order-precedence" className="block p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition">3. Order of Precedence &amp; Logic</a>
                  <a href="#syntax-errors" className="block p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition">4. Common Syntax Errors</a>
                  <a href="#channel-playbooks" className="block p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition">5. Channel-Specific Playbooks</a>
                  <a href="#production-strings" className="block p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition">6. 5 Core Domain Strings</a>
                  <a href="#sourcing-workflow" className="block p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition">7. 4-Stage Sourcing Funnel</a>
                  <a href="#faq-directory" className="block p-2 rounded-lg bg-blue-50/80 text-blue-800 font-bold hover:bg-blue-100 transition mt-2">
                    &rarr; All {BOOLEAN_FAQ_PAGES.length} FAQ Playbooks
                  </a>
                </nav>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-3 font-medium">Elevate your hiring team with certified training:</p>
                  <Link
                    href="/courses"
                    className="block text-center py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    View TA Certifications
                  </Link>
                </div>
              </div>
            </aside>

            {/* Guide Body */}
            <article className="lg:col-span-3 order-1 lg:order-2 space-y-16 text-slate-800 leading-relaxed font-normal">
              
              {/* Chapter 1: Definition */}
              <section id="definition" className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Chapter 1</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6">
                  What Is Boolean Search in Recruitment?
                </h2>
                <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed">
                  <strong>Boolean search in recruitment</strong> is an information retrieval framework governed by symbolic logic, originally formulated by 19th-century British mathematician George Boole. In modern talent acquisition, Boolean logic empowers recruiters to combine keywords, job titles, technical competencies, company names, and locations using mathematical operators (<strong>AND</strong>, <strong>OR</strong>, <strong>NOT</strong>) and syntax modifiers (<strong>quotation marks</strong>, <strong>parentheses</strong>, <strong>proximity commands</strong>).
                </p>
                <p className="text-slate-600 mb-6">
                  When a recruiter types conversational terms into a search engine—such as <em>Senior React Developer Bangalore</em>—they surrender pipeline quality to algorithmic guesswork. Algorithms often return profiles where &ldquo;React&rdquo; was a 3-week tutorial from 2018 or &ldquo;Developer&rdquo; was part of a real estate sales job. Boolean search replaces algorithmic bias with <strong>deterministic precision</strong>:
                </p>

                <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 mb-6 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 border-b border-slate-800 pb-2">
                    <span className="font-mono font-bold text-sky-400">Deterministic Boolean Search Architecture</span>
                    <CopyBooleanButton textToCopy='("Senior React Developer" OR "Lead Frontend Engineer") AND ("React.js" OR "ReactJS" OR "Next.js") AND ("TypeScript" OR "Redux") AND ("Bangalore" OR "Bengaluru") AND NOT ("Intern" OR "Fresher" OR "Trainee")' />
                  </div>
                  <pre className="font-mono text-xs sm:text-sm text-sky-300 whitespace-pre-wrap break-words">
{`("Senior React Developer" OR "Lead Frontend Engineer") AND ("React.js" OR "ReactJS" OR "Next.js") AND ("TypeScript" OR "Redux") AND ("Bangalore" OR "Bengaluru") AND NOT ("Intern" OR "Fresher" OR "Trainee")`}
                  </pre>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60">
                    <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" /> Bypasses Algorithmic Paywalls
                    </h4>
                    <p className="text-xs text-slate-600">
                      Surfaces passive candidates directly based on indexed skills without paying for sponsored applicant ads or promoted InMails.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                    <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Universal ATS &amp; Portal Portability
                    </h4>
                    <p className="text-xs text-slate-600">
                      The exact same logic structure operates inside LinkedIn Recruiter, Google X-Ray, Greenhouse, Zoho Recruit, and Naukri Resdex.
                    </p>
                  </div>
                </div>
              </section>

              {/* Chapter 2: Core Operators & Syntax Logic */}
              <section id="core-operators" className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Chapter 2</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6">
                  Core Boolean Operators and Syntax Logic
                </h2>
                <p className="text-slate-600 mb-6">
                  Every Boolean search query is constructed from foundational logical operators and syntax modifiers. Understanding their mathematical set theory behavior is essential for controlling candidate pool size and relevance:
                </p>
                
                <div className="overflow-x-auto my-6">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200 text-slate-900 font-bold bg-slate-50/80">
                        <th className="py-3 px-3">Operator / Syntax</th>
                        <th className="py-3 px-3">Set Theory Function</th>
                        <th className="py-3 px-3">Pool Impact</th>
                        <th className="py-3 px-3">Production Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                      <tr>
                        <td className="py-3.5 px-3 font-mono font-black text-blue-700">AND</td>
                        <td className="py-3.5 px-3">Intersection: All linked terms must exist in candidate record</td>
                        <td className="py-3.5 px-3 font-bold text-rose-600">Narrows Pool</td>
                        <td className="py-3.5 px-3 font-mono text-xs">"Python" AND "FastAPI"</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 font-mono font-black text-indigo-700">OR</td>
                        <td className="py-3.5 px-3">Union: At least one term must exist; captures synonyms &amp; variations</td>
                        <td className="py-3.5 px-3 font-bold text-emerald-600">Expands Pool</td>
                        <td className="py-3.5 px-3 font-mono text-xs">"React" OR "ReactJS" OR "React.js"</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 font-mono font-black text-rose-700">NOT / -</td>
                        <td className="py-3.5 px-3">Exclusion: Discards any record containing the keyword</td>
                        <td className="py-3.5 px-3 font-bold text-amber-600">Filters Noise</td>
                        <td className="py-3.5 px-3 font-mono text-xs">NOT ("Intern" OR "Fresher")</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 font-mono font-black text-violet-700">&ldquo;&rdquo; (Quotes)</td>
                        <td className="py-3.5 px-3">Phrase Locking: Enforces exact sequence of words without splitting</td>
                        <td className="py-3.5 px-3 font-bold text-slate-800">Precision Lock</td>
                        <td className="py-3.5 px-3 font-mono text-xs">"Engineering Manager"</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 font-mono font-black text-sky-700">() (Parentheses)</td>
                        <td className="py-3.5 px-3">Grouping: Enforces order of operations across logic clusters</td>
                        <td className="py-3.5 px-3 font-bold text-slate-800">Logic Enforcer</td>
                        <td className="py-3.5 px-3 font-mono text-xs">(Role Cluster) AND (Skill Cluster)</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 font-mono font-black text-teal-700">NEAR / AROUND(n)</td>
                        <td className="py-3.5 px-3">Proximity: Terms must appear within n words of each other</td>
                        <td className="py-3.5 px-3 font-bold text-teal-800">Contextual Link</td>
                        <td className="py-3.5 px-3 font-mono text-xs">"Architect" AROUND(4) "Microservices"</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                    <strong className="text-slate-900">How Proximity Sourcing Works:</strong> While <code className="text-blue-700 font-bold">AND</code> confirms both words appear somewhere across an entire 5-page CV, proximity operators (<code className="text-teal-700 font-bold">NEAR</code> in Monster/CareerBuilder, or <code className="text-teal-700 font-bold">AROUND(n)</code> in Google) enforce semantic cohesion. For instance, searching <code className="font-mono text-slate-800">"Java" AROUND(5) "Architect"</code> ensures the candidate was genuinely an architect of Java systems rather than a developer who worked at a company with an enterprise architect.
                  </div>
                </div>
              </section>

              {/* Chapter 3: Order of Precedence & Nested Logic */}
              <section id="order-precedence" className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Chapter 3</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6">
                  Operator Order of Precedence &amp; Nested Logic Rules
                </h2>
                <p className="text-slate-600 mb-6">
                  Just like mathematical operations follow BODMAS / PEMDAS (Parentheses first, Multiplication before Addition), search engines evaluate Boolean queries according to a strict <strong>algebraic hierarchy</strong>. Without explicit parentheses, search engines evaluate <code className="text-blue-700 font-bold">AND</code> before <code className="text-indigo-700 font-bold">OR</code> by default in standard boolean parsers, which completely corrupts candidate results.
                </p>

                <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 mb-6">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> The Fatal Precedence Catastrophe (Unparenthesized Query)
                  </h4>
                  <p className="text-xs sm:text-sm text-rose-900 font-mono mb-2">
                    Java OR Python AND Docker AND AWS
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Because <code className="font-bold text-blue-800">AND</code> binds tighter than <code className="font-bold text-indigo-800">OR</code>, the parser evaluates this as: <code className="font-bold text-slate-900">Java OR (Python AND Docker AND AWS)</code>. The engine will happily return any candidate in the world who has the single word &ldquo;Java&rdquo; anywhere on their profile, completely ignoring Docker and AWS requirements!
                  </p>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3">The Universal 4-Pillar Nested Architecture:</h3>
                <p className="text-sm text-slate-600 mb-4">
                  To ensure mathematical accuracy across every search engine and database, always wrap your synonym clusters inside parenthetical blocks connected by external <code className="font-bold text-blue-700">AND</code> operators:
                </p>

                <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 mb-6 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 border-b border-slate-800 pb-2">
                    <span className="font-mono text-emerald-400 font-bold">Golden Rule: Group Clusters, Connect With AND</span>
                    <CopyBooleanButton textToCopy='("Job Title 1" OR "Job Title 2") AND ("Mandatory Skill A" OR "Skill Synonym B") AND ("Target City A" OR "City Variation B") AND NOT ("Exclusion A" OR "Exclusion B")' />
                  </div>
                  <pre className="font-mono text-xs sm:text-sm text-emerald-300 whitespace-pre-wrap break-words">
{`("Job Title 1" OR "Job Title 2") 
AND ("Mandatory Skill A" OR "Skill Synonym B") 
AND ("Target City A" OR "City Variation B") 
AND NOT ("Exclusion A" OR "Exclusion B")`}
                  </pre>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <span><strong>Rule 1: Enclose Every OR Cluster:</strong> Every group of synonyms or alternative titles must be bounded by open and closed parentheses.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <span><strong>Rule 2: Keep AND External:</strong> Place AND strictly outside the brackets to enforce mandatory intersection between requirement categories.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <span><strong>Rule 3: Consolidate Exclusions at the End:</strong> Chain all NOT terms into a single parenthetical block at the very tail of the query.</span>
                  </div>
                </div>
              </section>

              {/* Chapter 4: Common Syntax Errors */}
              <section id="syntax-errors" className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Chapter 4</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6">
                  Common Syntax Errors &amp; Debugging Protocol
                </h2>
                <p className="text-slate-600 mb-6">
                  Over 85% of failed candidate searches stem from micro-formatting defects. Search engines are unforgiving text parsers. If a single character violates syntax rules, your query will either return zero results or crash:
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 text-sm">1. Lowercase Operators (<code className="text-rose-600">and</code>, <code className="text-rose-600">or</code>, <code className="text-rose-600">not</code>):</strong>
                      <p className="text-xs text-slate-600 mt-1">
                        Most platforms (LinkedIn, Google, ATS systems) treat lowercase operators as ordinary search words. Searching <code className="font-mono">React and Node</code> tells the search engine to find candidates whose resumes contain the word &ldquo;and&rdquo;. Always type operators in <strong>UPPERCASE: AND, OR, NOT</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 text-sm">2. Smart / Typographic Quotes (<code className="text-amber-700">&ldquo; &rdquo;</code>):</strong>
                      <p className="text-xs text-slate-600 mt-1">
                        When drafting queries in Microsoft Word, Google Docs, Slack, or Apple Notes, text engines automatically convert straight ASCII quotes (<code className="font-mono">&quot;</code>) into slanted typographic quotes (<code className="font-mono">&ldquo; &rdquo;</code>). Database engines do not recognize curved quotes as syntax modifiers and throw zero-result errors. Always compose queries in plain-text editors like Notepad or VS Code.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 text-sm">3. Unbalanced Parentheses (Bracket Mismatch):</strong>
                      <p className="text-xs text-slate-600 mt-1">
                        If a query has 4 open parentheses <code className="font-mono">(</code>, it must have exactly 4 closed parentheses <code className="font-mono">)</code>. A missing closing bracket will cause search parsers in Ceipal, Greenhouse, or Naukri to break and deliver erratic matches.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 text-sm">4. Rogue Spaces After Colons in Field Tags:</strong>
                      <p className="text-xs text-slate-600 mt-1">
                        In Google X-Ray and field search, operators require zero whitespace after the colon: <code className="font-mono text-emerald-700 font-bold">site:linkedin.com/in</code>. Adding a space—such as <code className="font-mono text-rose-600">site: linkedin.com/in</code>—instructs Google to search for the literal word &ldquo;site:&rdquo; across the open web.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Chapter 5: Channel-Specific Sourcing Playbooks */}
              <section id="channel-playbooks" className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Chapter 5</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6">
                  Channel-Specific Sourcing Playbooks
                </h2>
                <p className="text-slate-600 mb-6">
                  Boolean syntax is not universal across all software. Different platforms enforce distinct field tags, character limits, and parsing rules. Here is how to conquer each recruitment channel:
                </p>

                {/* Sub-section A: LinkedIn Recruiter & Free LinkedIn */}
                <div className="mb-8 p-6 rounded-2xl bg-blue-50/50 border border-blue-200/80">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">1. LinkedIn Recruiter &amp; Free LinkedIn Field Tags</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4">
                    While free LinkedIn truncates complex queries and imposes a strict monthly Commercial Use Limit on candidate profile views, LinkedIn Recruiter supports structured field tags and deep index mining:
                  </p>
                  <ul className="text-xs sm:text-sm text-slate-700 space-y-2 mb-4 font-mono">
                    <li><strong className="text-blue-900 font-sans">title:</strong> Targets current or past job designations: <code className="text-blue-700">title:("DevOps Engineer" OR "SRE")</code></li>
                    <li><strong className="text-blue-900 font-sans">company:</strong> Isolates current employers: <code className="text-blue-700">company:("Google" OR "Amazon" OR "Microsoft")</code></li>
                    <li><strong className="text-blue-900 font-sans">skill:</strong> Matches endorsed and tagged skills in the LinkedIn skills taxonomy.</li>
                    <li><strong className="text-blue-900 font-sans">location:</strong> Enforces geographic metro zones.</li>
                  </ul>
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold text-sky-400">LinkedIn Recruiter Field Tag Query</span>
                      <CopyBooleanButton textToCopy='title:("Staff Software Engineer" OR "Principal Architect") AND skill:("Kubernetes") AND company:("Stripe" OR "Razorpay" OR "Swiggy" OR "PhonePe")' />
                    </div>
                    <pre className="font-mono text-xs text-sky-300 whitespace-pre-wrap break-words">
{`title:("Staff Software Engineer" OR "Principal Architect") AND skill:("Kubernetes") AND company:("Stripe" OR "Razorpay" OR "Swiggy" OR "PhonePe")`}
                    </pre>
                  </div>
                </div>

                {/* Sub-section B: Google X-Ray Search */}
                <div className="mb-8 p-6 rounded-2xl bg-indigo-50/50 border border-indigo-200/80">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-900">2. Google X-Ray Search Playbook</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4">
                    Google X-Ray uses Google&apos;s public web crawler to inspect target websites, bypassing LinkedIn network limits, 3rd-degree connection obscurities, and commercial paywalls:
                  </p>
                  <ul className="text-xs sm:text-sm text-slate-700 space-y-2 mb-4">
                    <li><code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-indigo-700">site:linkedin.com/in/</code> &mdash; Restricts search results strictly to personal public member profiles.</li>
                    <li><code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-indigo-700">-intitle:jobs -intitle:profiles -intitle:dir</code> &mdash; Strips out job openings and directory index hubs.</li>
                    <li><code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-indigo-700">filetype:pdf OR filetype:docx</code> &mdash; Unearths unlisted resume files uploaded to AWS S3 buckets or personal domains.</li>
                  </ul>
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold text-sky-400">Google X-Ray LinkedIn Profile String</span>
                      <CopyBooleanButton textToCopy='site:linkedin.com/in/ ("Engineering Manager" OR "Director of Engineering") AND ("Golang" OR "Distributed Systems") AND ("Bengaluru" OR "Bangalore") -intitle:jobs -intitle:companies' />
                    </div>
                    <pre className="font-mono text-xs text-sky-300 whitespace-pre-wrap break-words">
{`site:linkedin.com/in/ ("Engineering Manager" OR "Director of Engineering") AND ("Golang" OR "Distributed Systems") AND ("Bengaluru" OR "Bangalore") -intitle:jobs -intitle:companies`}
                    </pre>
                  </div>
                </div>

                {/* Sub-section C: ATS & Job Board Mining (Zoho, Greenhouse, Ceipal, Naukri) */}
                <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <h3 className="text-lg font-bold text-slate-900">3. ATS &amp; Candidate Database Mining (Zoho, Greenhouse, Ceipal, Naukri)</h3>
                  </div>
                  <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                    <p>
                      <strong>Zoho Recruit &amp; Greenhouse:</strong> Most corporate ATS systems contain thousands of archived past applicants who were silver medalists. In Zoho Recruit and Greenhouse, search within candidate resume attachments using quotation marks and exclude current active employees: <code className="font-mono text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">&quot;Senior Backend&quot; AND (&quot;Microservices&quot;)</code>.
                    </p>
                    <p>
                      <strong>Ceipal:</strong> Widely used in US/Global IT staffing. Ensure boolean parser is set to &ldquo;All Words&rdquo; or &ldquo;Boolean&rdquo; rather than &ldquo;Any Word&rdquo;, which silently defaults your string to an OR search.
                    </p>
                    <p>
                      <strong>Naukri Resdex (Indian Tech Metro Context):</strong> Naukri Resdex enforces specific indexing quirks. To avoid candidate leakage, you must always include dual Indian city spellings (<code className="font-mono text-slate-800">&quot;Bangalore&quot; OR &quot;Bengaluru&quot;</code>, <code className="font-mono text-slate-800">&quot;Gurgaon&quot; OR &quot;Gurugram&quot;</code>) and include notice period filters:
                    </p>
                  </div>
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold text-emerald-400">Naukri Resdex High-Availability Query</span>
                      <CopyBooleanButton textToCopy='("Java" OR "Spring Boot") AND ("Kafka" OR "Microservices") AND ("Bengaluru" OR "Bangalore") AND ("Serving Notice Period" OR "Immediate Joiner" OR "15 Days or less")' />
                    </div>
                    <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap break-words">
{`("Java" OR "Spring Boot") AND ("Kafka" OR "Microservices") AND ("Bengaluru" OR "Bangalore") AND ("Serving Notice Period" OR "Immediate Joiner" OR "15 Days or less")`}
                    </pre>
                  </div>
                </div>
              </section>

              {/* Chapter 6: Production-Ready Role Strings for 5 Core Domains */}
              <section id="production-strings" className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Chapter 6</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6">
                  Production-Ready Role Strings for 5 Core Domains
                </h2>
                <p className="text-slate-600 mb-6">
                  Copy and paste these industry-tested Boolean search strings directly into LinkedIn Recruiter, Google X-Ray, or your ATS database to source qualified talent immediately:
                </p>

                <div className="space-y-6">
                  {/* Domain 1: IT / Tech Full Stack */}
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-sky-400" />
                        <span className="font-bold text-sky-400 text-sm">1. IT / Tech: Senior Full Stack Engineer (React + Node/Python + Cloud)</span>
                      </div>
                      <CopyBooleanButton textToCopy='("Full Stack Engineer" OR "Full Stack Developer" OR "Senior Software Engineer") AND ("React" OR "React.js" OR "Next.js") AND ("Node.js" OR "NodeJS" OR "Python" OR "FastAPI") AND ("AWS" OR "Amazon Web Services" OR "GCP") AND ("Docker" OR "Kubernetes") AND NOT ("Intern" OR "Trainee" OR "Fresher" OR "Junior")' />
                    </div>
                    <pre className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
{`("Full Stack Engineer" OR "Full Stack Developer" OR "Senior Software Engineer") 
AND ("React" OR "React.js" OR "Next.js") 
AND ("Node.js" OR "NodeJS" OR "Python" OR "FastAPI") 
AND ("AWS" OR "Amazon Web Services" OR "GCP") 
AND ("Docker" OR "Kubernetes") 
AND NOT ("Intern" OR "Trainee" OR "Fresher" OR "Junior")`}
                    </pre>
                    <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                      <strong>Recruiter Note:</strong> Combines frontend modern SPA frameworks with backend runtime engines, cloud providers, and containerization while eliminating early-career noise.
                    </p>
                  </div>

                  {/* Domain 2: DevOps / Cloud Infrastructure */}
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-indigo-400 text-sm">2. DevOps / Cloud &amp; Site Reliability Engineer (SRE)</span>
                      </div>
                      <CopyBooleanButton textToCopy='("DevOps Engineer" OR "Site Reliability Engineer" OR "SRE" OR "Cloud Architect") AND ("Kubernetes" OR "K8s" OR "EKS" OR "GKE") AND ("Terraform" OR "Ansible" OR "CloudFormation" OR "IaC") AND ("CI/CD" OR "GitHub Actions" OR "GitLab CI" OR "Jenkins") AND ("Prometheus" OR "Grafana" OR "Datadog")' />
                    </div>
                    <pre className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
{`("DevOps Engineer" OR "Site Reliability Engineer" OR "SRE" OR "Cloud Architect") 
AND ("Kubernetes" OR "K8s" OR "EKS" OR "GKE") 
AND ("Terraform" OR "Ansible" OR "CloudFormation" OR "IaC") 
AND ("CI/CD" OR "GitHub Actions" OR "GitLab CI" OR "Jenkins") 
AND ("Prometheus" OR "Grafana" OR "Datadog")`}
                    </pre>
                    <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                      <strong>Recruiter Note:</strong> Enforces container orchestration, Infrastructure-as-Code (IaC), continuous deployment pipelines, and observability monitoring stacks.
                    </p>
                  </div>

                  {/* Domain 3: Executive Leadership */}
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-emerald-400 text-sm">3. Executive Leadership: VP of Engineering / CTO / Tech Director</span>
                      </div>
                      <CopyBooleanButton textToCopy='("VP of Engineering" OR "Vice President of Engineering" OR "Chief Technology Officer" OR "CTO" OR "Head of Engineering") AND ("Headcount" OR "P&L" OR "Organization Scaling" OR "Engineering Strategy") AND ("Enterprise SaaS" OR "Product Engineering") AND NOT ("Consultant" OR "Advisor" OR "Acting")' />
                    </div>
                    <pre className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
{`("VP of Engineering" OR "Vice President of Engineering" OR "Chief Technology Officer" OR "CTO" OR "Head of Engineering") 
AND ("Headcount" OR "P&L" OR "Organization Scaling" OR "Engineering Strategy") 
AND ("Enterprise SaaS" OR "Product Engineering") 
AND NOT ("Consultant" OR "Advisor" OR "Acting")`}
                    </pre>
                    <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                      <strong>Recruiter Note:</strong> Targets leaders with real budgetary, organizational scaling, and executive responsibility while excluding part-time board advisors.
                    </p>
                  </div>

                  {/* Domain 4: Sales & Business Development */}
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-amber-400 text-sm">4. Sales &amp; BD: Enterprise B2B SaaS Account Executive</span>
                      </div>
                      <CopyBooleanButton textToCopy={'("Enterprise Account Executive" OR "Strategic Account Executive" OR "Sales Director" OR "VP of Sales") AND ("B2B SaaS" OR "Software as a Service") AND ("ARR" OR "Quota Attainment" OR "Presidents Club" OR "New Logo Acquisition") AND ("Salesforce" OR "HubSpot")'} />
                    </div>
                    <pre className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
{`("Enterprise Account Executive" OR "Strategic Account Executive" OR "Sales Director" OR "VP of Sales") 
AND ("B2B SaaS" OR "Software as a Service") 
AND ("ARR" OR "Quota Attainment" OR "President's Club" OR "New Logo Acquisition") 
AND ("Salesforce" OR "HubSpot")`}
                    </pre>
                    <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                      <strong>Recruiter Note:</strong> Filters for genuine enterprise deal closers with quantifiable revenue metrics (ARR, quota, President&apos;s Club) rather than relationship account managers.
                    </p>
                  </div>

                  {/* Domain 5: Healthcare & Clinical Operations */}
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-rose-400" />
                        <span className="font-bold text-rose-400 text-sm">5. Healthcare: Clinical Research Associate &amp; Regulatory Specialist</span>
                      </div>
                      <CopyBooleanButton textToCopy='("Clinical Research Associate" OR "CRA" OR "Clinical Trial Manager" OR "Regulatory Affairs Specialist") AND ("GCP" OR "Good Clinical Practice" OR "ICH-GCP") AND ("Phase I" OR "Phase II" OR "Phase III" OR "Clinical Protocols") AND ("FDA" OR "CDSCO" OR "EMA")' />
                    </div>
                    <pre className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
{`("Clinical Research Associate" OR "CRA" OR "Clinical Trial Manager" OR "Regulatory Affairs Specialist") 
AND ("GCP" OR "Good Clinical Practice" OR "ICH-GCP") 
AND ("Phase I" OR "Phase II" OR "Phase III" OR "Clinical Protocols") 
AND ("FDA" OR "CDSCO" OR "EMA")`}
                    </pre>
                    <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                      <strong>Recruiter Note:</strong> Isolates certified clinical trial monitors adhering to international regulatory bodies (FDA, CDSCO, EMA) and trial phases.
                    </p>
                  </div>
                </div>
              </section>

              {/* Chapter 7: 4-Stage Sourcing Funnel */}
              <section id="sourcing-workflow" className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Chapter 7</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6">
                  The 4-Stage Sourcing Funnel Workflow
                </h2>
                <p className="text-slate-600 mb-6">
                  Top 1% sourcers never construct a static query and stop. They execute an iterative calibration workflow that balances precision (relevance) against recall (pool breadth):
                </p>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700">Stage 1</span>
                    <h4 className="font-bold text-slate-900 text-base mb-1">Requisition Deconstruction &amp; Keyword Taxonomy</h4>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Dissect the hiring manager&apos;s intake sheet into 4 non-negotiables: Must-have Job Titles, Core Technical Capabilities, Secondary Tools, and Geographic Constraints.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-700">Stage 2</span>
                    <h4 className="font-bold text-slate-900 text-base mb-1">Synonym Expansion via OR Logic</h4>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Map every potential synonym, abbreviation, and adjacent tech stack. For instance, pairing <code className="font-mono text-slate-900">&quot;Golang&quot; OR &quot;Go Developer&quot; OR &quot;Go Engineer&quot;</code> ensures zero candidate leakage.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200">
                    <span className="text-xs font-black uppercase tracking-wider text-teal-700">Stage 3</span>
                    <h4 className="font-bold text-slate-900 text-base mb-1">Test Run &amp; Pool Calibration</h4>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Deploy the query on your primary channel. If results exceed 300 candidates, tighten with mandatory framework requirements. If results drop below 15, loosen secondary skill filters.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Stage 4</span>
                    <h4 className="font-bold text-slate-900 text-base mb-1">Multi-Channel Deployment &amp; Archival Mining</h4>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Deploy the validated string across LinkedIn Recruiter, Google X-Ray public indexes, GitHub repositories, and your internal ATS candidate vault.
                    </p>
                  </div>
                </div>
              </section>

              {/* Chapter 8: Comprehensive FAQ Directory Section (All 92 FAQs!) */}
              <section id="faq-directory" className="bg-white rounded-3xl p-8 sm:p-10 border border-blue-200/80 shadow-md">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold w-fit mb-3">
                  <Layers className="w-3.5 h-3.5" /> Complete Knowledge Directory
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                  All {BOOLEAN_FAQ_PAGES.length} Dedicated FAQ Playbooks
                </h2>
                <p className="text-sm text-slate-600 mb-8">
                  Every individual question below is hosted on its own standalone, SEO-optimized page featuring comprehensive expert breakdowns, copy-paste search strings or templates, mathematical formulas, and recruiter pro-tips:
                </p>

                <div className="space-y-10">
                  {FAQ_CATEGORIES.map((category) => {
                    const categoryFaqs = BOOLEAN_FAQ_PAGES.filter((f) => f.category === category)
                    return (
                      <div key={category} className="border-t border-slate-100 pt-6">
                        <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center justify-between">
                          <span>{category}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                            {categoryFaqs.length} {categoryFaqs.length === 1 ? 'Playbook' : 'Playbooks'}
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryFaqs.map((faq) => (
                            <Link
                              key={faq.slug}
                              href={`/knowledge/${faq.slug}`}
                              className="group p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-200 transition flex items-start justify-between gap-3"
                            >
                              <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-700 leading-snug">
                                  {faq.question}
                                </h4>
                                <span className="inline-block mt-1.5 text-[11px] text-slate-400 group-hover:text-blue-500 font-medium">
                                  Read dedicated playbook &rarr;
                                </span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-transform group-hover:translate-x-1" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

            </article>
          </div>
        </div>
      </section>
    </>
  )
}
