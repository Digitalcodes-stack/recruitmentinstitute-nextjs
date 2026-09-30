export interface ToolItem {
  id: string
  title: string
  slug: string
  category: 'Calculators' | 'Templates' | 'Practical Tools'
  format: 'Interactive Tool' | 'Excel Spreadsheet' | 'Word & Google Docs' | 'PDF Checklist' | 'Email Swipe File' | 'Legal Contract'
  shortDescription: string
  highlights: string[]
  isFeatured?: boolean
  ctaText: string
  ctaLink: string
}

export const TOOL_CATEGORIES = [
  'All Tools',
  'Calculators',
  'Templates',
  'Practical Tools'
] as const

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

/**
 * Admin-editable tools list.
 * You can add, edit, or remove tools directly in this array.
 */
export const initialToolsData: ToolItem[] = [
  {
    id: 'tool-01',
    title: 'Recruitment Fee & Commission Calculator',
    slug: 'recruitment-fee-calculator',
    category: 'Calculators',
    format: 'Interactive Tool',
    shortDescription:
      'Calculate placement invoices, 18% GST, and net recruiter commissions across standard 8.33%, 10%, 12.5%, and 15% agency fee slabs.',
    highlights: [
      'Instant placement invoice estimation',
      'Automatic 18% GST calculation',
      'Supports custom CTC & fee percentages'
    ],
    isFeatured: true,
    ctaText: 'Use Calculator Now',
    ctaLink: '#calculator'
  },
  {
    id: 'tool-02',
    title: 'Cost-Per-Hire & Sourcing ROI Calculator',
    slug: 'cost-per-hire-calculator',
    category: 'Calculators',
    format: 'Excel Spreadsheet',
    shortDescription:
      'Compare in-house recruiter salaries and job portal subscriptions against contingency staffing agency fees to calculate true cost-per-hire.',
    highlights: [
      'Breakeven analysis for HR departments',
      'Job board ROI vs agency commission comparison',
      'Includes hidden onboarding & time-to-fill costs'
    ],
    isFeatured: false,
    ctaText: 'Request Template',
    ctaLink: '/contact?tool=cost-per-hire-calculator'
  },
  {
    id: 'tool-03',
    title: 'Recruiter Incentive & Target Bonus Calculator',
    slug: 'recruiter-incentive-calculator',
    category: 'Calculators',
    format: 'Excel Spreadsheet',
    shortDescription:
      'A structured spreadsheet to calculate monthly and quarterly recruiter incentive tiers, slab multipliers, and agency margin splits.',
    highlights: [
      'Standard 5% to 15% recruiter billing splits',
      'Quarterly kicker bonuses for target overachievers',
      'Ready to share with agency recruiting teams'
    ],
    isFeatured: false,
    ctaText: 'Request Template',
    ctaLink: '/contact?tool=recruiter-incentive-calculator'
  },
  {
    id: 'tool-04',
    title: 'Master Job Description (JD) Pack (50+ Roles)',
    slug: 'master-jd-templates',
    category: 'Templates',
    format: 'Word & Google Docs',
    shortDescription:
      'Standardized job descriptions with competency requirements, key responsibilities, experience bands, and compensation benchmarks for Tech & Non-Tech roles.',
    highlights: [
      'Covers Software Engineers, DevOps, Product, HR & Sales',
      'SEO-optimized bullet points for LinkedIn & Naukri',
      '100% editable Microsoft Word and Google Docs format'
    ],
    isFeatured: true,
    ctaText: 'Download JD Pack',
    ctaLink: '/contact?tool=master-jd-templates'
  },
  {
    id: 'tool-05',
    title: 'Structured Competency Interview Scorecards & Rubrics',
    slug: 'interview-scorecards-rubrics',
    category: 'Templates',
    format: 'Excel Spreadsheet',
    shortDescription:
      'Objective 5-point evaluation scorecards mapped to communication, problem solving, culture fit, and domain skills to eliminate interviewer bias.',
    highlights: [
      'Eliminates subjective hiring manager biases',
      'Automated weighted score calculations',
      'Compliant with modern corporate HR audit standards'
    ],
    isFeatured: true,
    ctaText: 'Get Scorecard Kit',
    ctaLink: '/contact?tool=interview-scorecards'
  },
  {
    id: 'tool-06',
    title: 'Agency Master Service Agreement (MSA) & SLA Sample',
    slug: 'agency-msa-sla-contract-sample',
    category: 'Templates',
    format: 'Legal Contract',
    shortDescription:
      'Legally vetted recruitment contract draft covering 90-day candidate replacement guarantee, payment credit terms, and non-solicitation clauses for Indian staffing agencies.',
    highlights: [
      'Standard payment terms (30/45/60 days)',
      'Replacement policy & back-out clause language',
      'Drafted specifically for Indian recruitment firms'
    ],
    isFeatured: false,
    ctaText: 'Request MSA Draft',
    ctaLink: '/contact?tool=agency-msa-contract'
  },
  {
    id: 'tool-07',
    title: 'Standard Offer Letter & Candidate Pre-Joining Kit',
    slug: 'offer-letter-prejoining-kit',
    category: 'Templates',
    format: 'Word & Google Docs',
    shortDescription:
      'Formal offer letter template with CTC breakdown annexure, probation terms, confidentiality NDA clauses, and pre-joining check-in touchpoints.',
    highlights: [
      'Comprehensive CTC annexure (Basic, HRA, PF, Gratuity)',
      'Candidate drop-off prevention checklist',
      'Clean professional formatting ready for HR use'
    ],
    isFeatured: false,
    ctaText: 'Get Offer Kit',
    ctaLink: '/contact?tool=offer-letter-kit'
  },
  {
    id: 'tool-08',
    title: 'Candidate Rejection & Nurture Email Swipe File',
    slug: 'candidate-email-swipe-file',
    category: 'Templates',
    format: 'Email Swipe File',
    shortDescription:
      '8 warm, respectful email templates for rejection after resume review, post-interview feedback, offer letter negotiation, and talent pool re-engagement.',
    highlights: [
      'Protects your employer brand & Glassdoor rating',
      'Pre-written rejection with constructive feedback options',
      'Talent pool nurture sequence to reactivate past applicants'
    ],
    isFeatured: false,
    ctaText: 'Get Email Templates',
    ctaLink: '/contact?tool=candidate-email-swipe-file'
  },
  {
    id: 'tool-09',
    title: 'Boolean Search String Generator & Cheat Sheet',
    slug: 'boolean-search-cheat-sheet',
    category: 'Practical Tools',
    format: 'PDF Checklist',
    shortDescription:
      'A practical guide to Boolean operators (AND, OR, NOT, site:, filetype:) with pre-built strings for Full Stack, DevOps, Data Science, and Leadership talent.',
    highlights: [
      'Bypass LinkedIn Commercial Use Limits with Google X-Ray',
      'GitHub & Behance sourcing operators included',
      'Instant copy-paste syntax for Indian job portals'
    ],
    isFeatured: true,
    ctaText: 'Get Boolean Cheat Sheet',
    ctaLink: '/contact?tool=boolean-search-cheat-sheet'
  },
  {
    id: 'tool-10',
    title: 'Daily Recruiter Productivity & Calling Tracker',
    slug: 'recruiter-productivity-calling-tracker',
    category: 'Practical Tools',
    format: 'Excel Spreadsheet',
    shortDescription:
      'A daily activity logging template tracking outreach calls, connected interviews, CV submittals, client feedback, and joining pipeline.',
    highlights: [
      'Daily calling target tracker (50-60 calls/day benchmark)',
      'Weekly pipeline status & bottleneck visualization',
      'Pre-formatted formulas for conversion percentages'
    ],
    isFeatured: false,
    ctaText: 'Download Tracker',
    ctaLink: '/contact?tool=recruiter-calling-tracker'
  },
  {
    id: 'tool-11',
    title: 'Recruitment Agency Startup Blueprint & Checklist',
    slug: 'agency-startup-blueprint-checklist',
    category: 'Practical Tools',
    format: 'PDF Checklist',
    shortDescription:
      'A 30-day step-by-step launch roadmap for starting a staffing agency: GST, MSME registration, domain setup, job portal packages, ATS selection, and first client pitch.',
    highlights: [
      'Complete statutory and tax compliance list for India',
      'Tech stack recommendations for solo recruitment consultants',
      'First 100 client outreach script and email framework'
    ],
    isFeatured: false,
    ctaText: 'Get Startup Blueprint',
    ctaLink: '/contact?tool=agency-startup-blueprint'
  },
  {
    id: 'tool-12',
    title: 'Candidate Sourcing & Screening Funnel Tracker',
    slug: 'sourcing-screening-funnel-tracker',
    category: 'Practical Tools',
    format: 'Excel Spreadsheet',
    shortDescription:
      'Measure your hiring funnel conversion ratios: Sourced to Screened, Screened to Client Shortlist, First Interview to Offer, and Offer to Join.',
    highlights: [
      'Identify where candidate leakages happen in your process',
      'Benchmarked against top recruitment agency industry standards',
      'Visual charts to present to clients and leadership'
    ],
    isFeatured: false,
    ctaText: 'Get Funnel Tracker',
    ctaLink: '/contact?tool=sourcing-funnel-tracker'
  }
]
