export interface EventItem {
  id: string
  title: string
  slug: string
  category: 'Workshops' | 'Masterclasses' | 'Founder Meets' | 'HR & Recruitment Events'
  status: 'Upcoming' | 'Registration Open' | 'Filling Fast' | 'Free Event'
  date: string
  time: string
  duration: string
  mode: 'Live Online (Google Meet)' | 'Hybrid (Pune Campus + Online)' | 'Offline Meetup (Mumbai)'
  speaker: {
    name: string
    title: string
    avatar?: string
  }
  shortDescription: string
  keyTakeaways: string[]
  ctaText: string
  ctaLink: string
  seatsLeft?: number
  isFeatured?: boolean
}

export const EVENT_CATEGORIES = [
  'All Events',
  'Workshops',
  'Masterclasses',
  'Founder Meets',
  'HR & Recruitment Events'
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]

/**
 * Admin-editable events data.
 * You can add, edit, or remove events directly in this array,
 * or connect this to a database table in the future.
 */
export const initialEventsData: EventItem[] = [
  {
    id: 'evt-01',
    title: 'AI in Talent Acquisition & Recruitment Automation Masterclass',
    slug: 'ai-talent-acquisition-masterclass',
    category: 'Masterclasses',
    status: 'Registration Open',
    date: 'Saturday, 17 October 2026',
    time: '11:00 AM – 1:00 PM IST',
    duration: '2 Hours Live Interactive',
    mode: 'Live Online (Google Meet)',
    speaker: {
      name: 'Brahmita Nayak & Shesha Shhiv Mohanty',
      title: 'Director Recruitment & AI Business Transformation Lead',
      avatar: '/assets/images/trainers/brahmita_mam.jpg'
    },
    shortDescription:
      'Learn how modern recruiters use Generative AI, prompt engineering, and automated candidate screening workflows to source 3x faster with higher placement conversions.',
    keyTakeaways: [
      'Real-world prompt frameworks for Boolean & candidate outreach',
      'AI-assisted resume qualification and candidate scorecards',
      'Live Q&A and practical ATS automation templates'
    ],
    ctaText: 'Register Free Seat',
    ctaLink: '/contact?event=ai-talent-acquisition-masterclass',
    seatsLeft: 18,
    isFeatured: true
  },
  {
    id: 'evt-02',
    title: 'Hands-on Boolean Search & Advanced LinkedIn Sourcing Workshop',
    slug: 'boolean-search-linkedin-sourcing-workshop',
    category: 'Workshops',
    status: 'Filling Fast',
    date: 'Saturday, 24 October 2026',
    time: '3:00 PM – 6:00 PM IST',
    duration: '3 Hours Hands-On Lab',
    mode: 'Live Online (Google Meet)',
    speaker: {
      name: 'Tukuna Kumar Lenka',
      title: 'Talent Acquisition & Corporate Sourcing Specialist',
      avatar: '/assets/images/trainers/tukuna_kumar_lenka.jpg'
    },
    shortDescription:
      'A practical drill on building complex Boolean search strings, Google X-ray operators, and uncovering hidden candidate pools across LinkedIn, GitHub, and job boards.',
    keyTakeaways: [
      'Master AND, OR, NOT, site:, and filetype: operators',
      'Bypass LinkedIn search limits using Google X-ray',
      'Downloadable Boolean search cheat-sheet included'
    ],
    ctaText: 'Reserve Your Spot',
    ctaLink: '/contact?event=boolean-search-workshop',
    seatsLeft: 9,
    isFeatured: true
  },
  {
    id: 'evt-03',
    title: 'Recruitment Agency Founders Roundtable: Scaling from Solo to 10-Member Team',
    slug: 'recruitment-agency-founders-roundtable',
    category: 'Founder Meets',
    status: 'Registration Open',
    date: 'Sunday, 1 November 2026',
    time: '5:00 PM – 7:30 PM IST',
    duration: '2.5 Hours Networking & Strategy',
    mode: 'Hybrid (Pune Campus + Online)',
    speaker: {
      name: 'Rahul Limaye',
      title: 'Business Growth & Staffing Strategy Consultant (30+ yrs exp)',
      avatar: '/uploads/trainers/1789106738888-6btfm.jfif'
    },
    shortDescription:
      'Exclusive closed-door session for staffing agency founders and independent recruitment consultants on client acquisition, contract negotiation (MSA/SLA), and recruiter incentive models.',
    keyTakeaways: [
      'B2B client acquisition frameworks for staffing firms',
      'Structuring 8.33% to 15% placement fee contracts & payment terms',
      'Peer networking with recruitment entrepreneurs across India'
    ],
    ctaText: 'Apply for Founder Seat',
    ctaLink: '/contact?event=founders-roundtable',
    seatsLeft: 12,
    isFeatured: false
  },
  {
    id: 'evt-04',
    title: 'Corporate HR Leadership Summit: Future of Talent Acquisition 2027',
    slug: 'corporate-hr-leadership-summit',
    category: 'HR & Recruitment Events',
    status: 'Upcoming',
    date: 'Saturday, 14 November 2026',
    time: '10:00 AM – 2:00 PM IST',
    duration: 'Half-Day Conference & Panel',
    mode: 'Live Online (Google Meet)',
    speaker: {
      name: 'Debabrata Pattanayak & Saurav Dey',
      title: 'Director HR & Senior Talent Acquisition Leaders',
      avatar: '/assets/images/trainers/debabrata_pattanayak.jpg'
    },
    shortDescription:
      'Panel discussions and actionable keynotes on employer branding, structured competency interviews, diversity hiring, and retaining top performers in competitive industries.',
    keyTakeaways: [
      'Overcoming candidate drop-offs and ghosting post-offer',
      'Standardizing interview rubrics across hiring managers',
      'Certificate of Attendance provided to all participants'
    ],
    ctaText: 'Register for Summit',
    ctaLink: '/contact?event=corporate-hr-leadership-summit',
    seatsLeft: 25,
    isFeatured: false
  }
]
