'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle, X, Send, ChevronDown, Star,
  ArrowLeft, Clock, Zap, Users, GraduationCap, Briefcase, TrendingUp, Award,
  Bot, User,
} from 'lucide-react'
import Link from 'next/link'

/* ─── Types ──────────────────────────────────────────────────── */

type Screen = 'greeting' | 'bot' | 'need' | 'experts' | 'chat'

interface Msg {
  role: 'bot' | 'user' | 'system'
  text: string
  expertId?: string
}

interface Expert {
  id: string
  name: string
  title: string
  exp: string
  rating: number
  reviews: number
  bio: string
  avatar: string
  color: string
  bg: string
  tags: string[]
  rate: string
}

/* ─── Experts ─────────────────────────────────────────────────── */

const EXPERTS: Expert[] = [
  { id: 'jhon',  name: 'Jhon Pedrocas',   title: 'Senior Recruitment Trainer',       exp: '20+ yrs · IT & Non-IT MNCs',         rating: 4.9, reviews: 312, bio: 'Expert in full-cycle hiring, ATS tools & boolean search.', avatar: 'JP', color: '#1E40AF', bg: '#EFF6FF', tags: ['End-to-End', 'ATS & Boolean', 'Corporate'], rate: '₹299/min' },
  { id: 'riya',  name: 'Riya Pedrocas',   title: 'Recruitment Career Coach',         exp: '12+ yrs coaching new recruiters',    rating: 4.8, reviews: 228, bio: 'Specialist in fresher training, career switching & agency startup.', avatar: 'RP', color: '#7C3AED', bg: '#F5F3FF', tags: ['Freshers', 'Career Switch', 'Agency Setup'], rate: '₹249/min' },
  { id: 'arjun', name: 'Arjun Malhotra',  title: 'IT & Tech Recruitment Specialist', exp: '15+ yrs placing tech talent globally', rating: 4.8, reviews: 185, bio: 'Deep expertise sourcing developers, data scientists & product managers.', avatar: 'AM', color: '#0284C7', bg: '#F0F9FF', tags: ['Tech Hiring', 'LinkedIn', 'Niche Roles'], rate: '₹349/min' },
  { id: 'priya', name: 'Priya Nair',      title: 'Mass Hiring Expert',               exp: '14 yrs · high-volume pipelines',     rating: 4.7, reviews: 164, bio: 'Streamlined mass hiring for Fortune 500s, cutting time-to-hire by 40%.', avatar: 'PN', color: '#059669', bg: '#F0FDF4', tags: ['Bulk Hiring', 'BPO/BFSI', 'Screening'], rate: '₹279/min' },
  { id: 'sanjay',name: 'Sanjay Kulkarni', title: 'HR Entrepreneur & Agency Mentor',  exp: '18 yrs running recruitment firms',   rating: 4.9, reviews: 201, bio: 'Founded 2 agencies. Mentor to 300+ entrepreneurs across India.', avatar: 'SK', color: '#D97706', bg: '#FFFBEB', tags: ['Agency Launch', 'Client Acquisition', 'Revenue'], rate: '₹399/min' },
]

const NEED_MAP: Record<string, string[]> = {
  'course-counselling': ['jhon', 'riya', 'sanjay'],
  'career-guidance':    ['riya', 'jhon', 'arjun'],
  'become-recruiter':   ['riya', 'jhon', 'priya'],
  'start-agency':       ['sanjay', 'jhon', 'riya'],
  'corporate-training': ['jhon', 'priya', 'arjun'],
  'interview-resume':   ['riya', 'jhon', 'arjun'],
}

const NEEDS = [
  { id: 'course-counselling', label: 'Course Counselling',  icon: GraduationCap, desc: 'Which program suits me?',        color: '#1E40AF', bg: '#EFF6FF' },
  { id: 'career-guidance',    label: 'Career Guidance',     icon: TrendingUp,    desc: 'Plan my HR career path',         color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'become-recruiter',   label: 'Become a Recruiter',  icon: Users,         desc: 'Start my recruitment career',    color: '#059669', bg: '#F0FDF4' },
  { id: 'start-agency',       label: 'Start an Agency',     icon: Briefcase,     desc: 'Launch my own HR firm',          color: '#D97706', bg: '#FFFBEB' },
  { id: 'corporate-training', label: 'Corporate Training',  icon: Award,         desc: 'Train my team / organisation',  color: '#0284C7', bg: '#F0F9FF' },
  { id: 'interview-resume',   label: 'Interview & Resume',  icon: Zap,           desc: 'CV review, mock interviews',     color: '#E11D48', bg: '#FFF1F2' },
]

/* ─── General Bot ─────────────────────────────────────────────── */

const KB_PHONE = '+91 99750 48884'
const KB_EMAIL = 'support@recruitmentinstitute.in'
const BOT_QR = ['What courses do you offer?', 'Tell me about placement', 'What are the fees?', 'How do I enroll?', 'Contact details']

function botReply(msg: string): string {
  const m = msg.toLowerCase().trim()
  if (/^(hi+|hey+|hello+|hii+|hai+|namaste|good\s*(morning|afternoon|evening))/.test(m))
    return `Hello! Welcome to **Recruitment Institute** — India's #1 HR & Recruitment Training Academy.\n\nI'm your virtual assistant. Ask me anything about our courses, fees, placement, or enrollment. What would you like to know?`
  if (/(how are (you|u)|how r u|you good|doing well)/.test(m))
    return `I'm doing great, thank you! Always happy to help.\n\nWhat would you like to know — courses, fees, placement, or how to enroll?`
  if (/(bye|goodbye|see you|cya|take care)/.test(m))
    return `Thanks for connecting! Wishing you all the best. 📞 **${KB_PHONE}** | ✉️ **${KB_EMAIL}**\n\nCome back anytime!`
  if (/^(thank|thanks|thx|ty|great|awesome|perfect|ok|okay|cool|got it)/.test(m))
    return `You're welcome! Anything else I can help with — courses, fees, placement, or enrollment?`
  if (/(course|program|degree|diploma|what do you (teach|offer))/.test(m))
    return `We offer **4 specialised programs**:\n\n• **End-to-End Recruitment Training** (3 months) — Full hiring lifecycle, ATS, boolean search\n• **HR Courses for Beginners** (6 weeks) — Foundations for freshers & career switchers\n• **HR Entrepreneurship Program** (2 months) — Launch your own agency\n• **HR Corporate Training** (Flexible) — Custom team training\n\nWhich one interests you?`
  if (/(placement|placed|get a job|career support|job (after|guarantee))/.test(m))
    return `We maintain a **95% placement support rate**!\n\n• Connections with 500+ hiring companies\n• One-on-one resume building\n• Mock interview sessions\n• Career counseling & job matching\n\nCall us at **${KB_PHONE}** for details.`
  if (/(fee|fees|price|cost|how much|emi|payment)/.test(m))
    return `Fees vary by program. We offer **flexible EMI plans** and our team can help with scholarships.\n\n📞 **${KB_PHONE}**\n✉️ **${KB_EMAIL}**\n\nOur counsellors will give you an exact breakdown.`
  if (/(duration|how long|months|weeks|batch|timing|schedule)/.test(m))
    return `Course durations:\n\n• **HR Beginners** — 6 weeks\n• **End-to-End Recruitment** — 3 months\n• **Entrepreneur Program** — 2 months\n• **Corporate Training** — Flexible\n\nWeekday & weekend batches available. Call **${KB_PHONE}** for batch dates.`
  if (/(online|remote|virtual|from home|live class)/.test(m))
    return `Yes! All programs are available **fully online** with live instructor-led sessions.\n\n• Live classes (not just recordings)\n• Weekend & weekday batches\n• Industry-recognised certificate\n\nCall **${KB_PHONE}** to know more.`
  if (/(enroll|join|register|admission|apply|sign up|get started)/.test(m))
    return `Getting started is easy!\n\n1. Browse programs at **/courses**\n2. Book a **free demo session**\n3. Our team guides you through fees & enrollment\n\n📞 **${KB_PHONE}** | 💬 WhatsApp same number`
  if (/(contact|call|phone|email|reach|helpline)/.test(m))
    return `Here's how to reach us:\n\n📞 **${KB_PHONE}**\n✉️ **${KB_EMAIL}**\n🕘 Mon–Sat, 9 AM – 6 PM\n📍 Pune, Maharashtra`
  if (/(location|address|where|pune|office|campus)/.test(m))
    return `We're based in **Pune, Maharashtra**. Full online programs also available for students across India.\n\n📞 Call **${KB_PHONE}** for the exact address.`
  return `I can help with:\n\n• **Courses & programs**\n• **Fees** and payment options\n• **Placement support**\n• **Enrollment** process\n• **Contact** details\n\nOr call us at **${KB_PHONE}** — we're happy to help!`
}

/* ─── Expert persona helpers ──────────────────────────────────── */

function isGreeting(m: string) { return /^(hi+|hey+|hello+|hii+|hai+|namaste|good\s*(morning|afternoon|evening)|howdy|sup|yo+)/.test(m) }
function isThanks(m: string)   { return /^(thank|thanks|thx|ty|tq|great|awesome|perfect|ok|okay|cool|got it|sounds good|understood)/.test(m) }
function isBye(m: string)      { return /(bye|goodbye|see you|cya|take care|good night)/.test(m) }
function isHowRU(m: string)    { return /(how are (you|u)|how r u|you good|doing well|how.s it)/.test(m) }

const EXPERT_FN: Record<string, (msg: string) => string> = {
  jhon: (msg) => {
    const m = msg.toLowerCase().trim()
    if (isGreeting(m)) return `Hi there! Great to connect — I'm Jhon, 20+ years in recruitment across IT and Non-IT sectors.\n\nHow can I help today? Looking to get into recruitment, upskill, or find the right training program?`
    if (isHowRU(m))   return `Doing great, thank you! Always energised talking recruitment. What brings you here today?`
    if (isThanks(m))  return `Absolutely happy to help! Any more questions about courses, career paths, or hiring — just ask.`
    if (isBye(m))     return `Great chatting! Best of luck on your recruitment journey. Reach us at 📞 **+91 99750 48884** anytime.`
    if (/(fundamental|basic|concept|what is recruit|intro|overview|beginner|start learn|learn recruit)/.test(m))
      return `Great starting point! Here are the **core fundamentals of recruitment**:\n\n**1. Understanding the Job Requirement**\nParse the JD deeply — technical skills, soft skills, culture fit, and deal-breakers.\n\n**2. Sourcing Candidates**\nLinkedIn, Naukri, Monster, GitHub, employee referrals, job fairs.\n\n**3. Screening & Shortlisting**\nResume review → telephonic screening → structured shortlist.\n\n**4. Interview Coordination**\nSchedule, brief, gather feedback, manage candidate experience.\n\n**5. Offer & Onboarding**\nNegotiation, offer rollout, joining follow-up, Day 1 readiness.\n\nWhich of these do you want to go deeper on?`
    if (/(lifecycle|process|steps|how recruit|how hiring|hiring cycle|end.to.end|full cycle)/.test(m))
      return `The **End-to-End Recruitment Lifecycle** in 7 steps:\n\n1. **Job Analysis** — define the role clearly with the hiring manager\n2. **Job Posting** — write a compelling JD, post on right portals\n3. **Sourcing** — active (portals, LinkedIn) + passive (headhunting, referrals)\n4. **Screening** — resume review + telephonic round\n5. **Interviews** — coordinate all rounds, collect structured feedback\n6. **Offer Management** — negotiate, roll out, handle counter-offers\n7. **Onboarding** — ensure smooth Day 1 experience\n\nThis is exactly what our **End-to-End Recruitment Training** covers. Interested?`
    if (/(ats|boolean|sourcing|naukri|monster|portal|tool|x.ray|headhunt|passive candidate)/.test(m))
      return `Sourcing is where good recruiters separate themselves. Key tools:\n\n• **Boolean strings** — e.g. "Java developer" AND (Pune OR Mumbai) -fresher\n• **ATS** — Taleo, Zoho Recruit, Keka — track pipeline, automate follow-ups\n• **LinkedIn Recruiter** — InMails, talent pools, saved searches\n• **Naukri/Monster** — resdex access, mass mailers\n• **X-ray search** — site:linkedin.com/in "role" "city"\n\nWe do live sessions on all of these. Want to see a sample sourcing module?`
    if (/(linkedin)/.test(m))
      return `LinkedIn is the #1 tool for quality hiring. Here's how to use it effectively:\n\n• **Boolean search** — "Python developer" AND "Pune" AND "open to work"\n• **InMail templates** — personalised, short, role-specific\n• **Talent Pool** — save searches, get alerts on new matching profiles\n• **Job Postings** — sponsored posts get 3x more applicants\n• **X-ray** — Google: site:linkedin.com/in "data scientist" "Mumbai"\n\nIn our training, we do live LinkedIn sourcing every session. Want to know more?`
    if (/(resume|cv|screen|shortlist|filter|profile review)/.test(m))
      return `Resume screening is a critical skill. My framework:\n\n**Must-check in 30 seconds:**\n• Relevant role titles & progression\n• Company quality (brand names or fast-growth firms)\n• Tenure (red flag: 3+ jobs in 2 years without context)\n• Skills match vs JD keywords\n• Gaps — ask, don't assume\n\n**Shortlisting rule:** Create a Must-Have / Good-to-Have / Disqualifier matrix before you start screening.\n\nWant me to walk through a live example?`
    if (/(interview|question|mock|candidate experience|panel|round)/.test(m))
      return `Strong interview coordination sets you apart. Key skills:\n\n• **Brief the candidate** — what to expect, who's interviewing, format\n• **Structured questions** — use STAR (Situation, Task, Action, Result)\n• **Gather feedback fast** — within 2 hrs post-interview, before hiring manager forgets\n• **Candidate experience** — 72% of candidates share bad experiences; protect your employer brand\n\n**Common recruiter mistake:** Not following up. Set calendar reminders for every step.\n\nWant a sample interview brief template?`
    if (/(offer|negotiat|ctc|package|counter offer|joining|accept|reject)/.test(m))
      return `Offer management is where many recruiters lose candidates. My tips:\n\n• **Share offer range early** — don't waste 3 rounds to find salary mismatch\n• **Counter-offer prep** — 70% of candidates receive a counter from current employer; prepare the candidate in advance\n• **Follow-up cadence** — call within 24 hrs of offer letter, again at Day 7, again 1 week before joining\n• **Joining kit** — welcome email, buddy assignment, Day 1 plan reduces drop-offs\n\nOffer management is covered in depth in our program. Want details?`
    if (/(course|program|which|best|recommend|join|enroll|train|learn|study|certif)/.test(m))
      return `Good question! Here's the right program by stage:\n\n• **New to HR?** → HR Courses for Beginners (6 wks) — fundamentals, tools, first job\n• **Want full-cycle skills?** → End-to-End Recruitment Training (3 mo) — sourcing to onboarding\n• **Starting your own agency?** → HR Entrepreneurship Program (2 mo) — client acquisition, billing, scaling\n• **Training your team?** → Corporate Training (Flexible) — customised for your org\n\nWhich stage best describes you?`
    if (/(salary|earn|income|pay|lpa|career|growth|scope|future|demand)/.test(m))
      return `Recruitment has excellent earning potential:\n\n• **Freshers:** ₹3–5 LPA\n• **2–3 years experience:** ₹6–10 LPA\n• **Senior Recruiter:** ₹12–20+ LPA\n• **Agency owner (solo):** ₹15–40L+ annual\n• **Agency with team:** Unlimited — commission-based\n\nDemand is only growing — every company hires, always. It's one of the most recession-resistant career paths.\n\nOur placement cell connects you with 500+ companies. Want details?`
    if (/(fee|cost|price|how much|emi|payment|afford|discount|scholarship)/.test(m))
      return `Fees depend on the program you choose. We offer:\n\n• **Flexible EMI plans** — start as low as ₹999/month\n• **Early-bird discounts** on new batches\n• **Scholarship options** for eligible students\n• No hidden charges — what you see is what you pay\n\n📞 **+91 99750 48884** — our counsellor will give you the exact fee with any active offer.`
    if (/(placement|job|compan|opportunit|hired|get work|career support)/.test(m))
      return `Placement is our strongest pillar — **95% support rate**.\n\n• Resume building with a recruiter's eye\n• Mock interviews with real feedback\n• 500+ partner companies across IT, BFSI, retail, pharma\n• Dedicated placement assistance for 6 months post-course\n• LinkedIn profile makeover included\n\nWhich companies or sectors are you targeting?`
    if (/(duration|how long|batch|timing|schedule|weekend|weekday|online|offline|class)/.test(m))
      return `Program durations:\n\n• **HR Beginners** — 6 weeks\n• **End-to-End Recruitment** — 3 months\n• **Entrepreneur Program** — 2 months\n• **Corporate Training** — Flexible\n\nAll programs have **weekday and weekend batches**, fully **online** with live instructor-led sessions (not just recordings). Next batch details: 📞 **+91 99750 48884**`
    if (/(why hr|career in hr|good career|is hr good|scope of hr|hr job|recruiter job|future of hr)/.test(m))
      return `HR & Recruitment is one of the most future-proof careers:\n\n• **Every company needs recruiters** — from startups to MNCs\n• **Remote-friendly** — most sourcing and screening is online\n• **High earning potential** — especially in IT/niche hiring\n• **Entrepreneurship angle** — start your own agency from home\n• **People-first work** — you directly impact someone's career\n\nWith the right training, you can place your first candidate within 60–90 days. Want a career roadmap?`
    return `Good question! Here's what I can help with as a recruitment expert:\n\n• **Recruitment basics & lifecycle**\n• **Sourcing, ATS & Boolean**\n• **Resume screening & interviews**\n• **Offer management**\n• **Career guidance & course selection**\n\nWhat specifically would you like to explore?`
  },

  riya: (msg) => {
    const m = msg.toLowerCase().trim()
    if (isGreeting(m)) return `Hello! So lovely to meet you — I'm Riya, specialising in coaching new recruiters and career switchers.\n\nAre you exploring a career change, looking for the right course, or need interview / resume guidance?`
    if (isHowRU(m))   return `Wonderful, thank you! I love helping people find their path in HR. What brings you here today?`
    if (isThanks(m))  return `You're so welcome! Come back anytime you need guidance. You've got this!`
    if (isBye(m))     return `Best of luck! Every expert recruiter started exactly where you are. 📞 **+91 99750 48884** whenever you're ready.`
    if (/(fundamental|basic|concept|what is recruit|intro|overview|learn recruit|start)/.test(m))
      return `Let me break it down simply — recruitment has **5 core skills** every beginner needs:\n\n1. **Reading a JD** — understand must-haves vs nice-to-haves\n2. **Sourcing** — finding candidates on Naukri, LinkedIn, referrals\n3. **Screening** — spotting the right fit quickly from dozens of profiles\n4. **Communication** — calling candidates confidently, handling objections\n5. **Follow-through** — tracking every candidate from applied to joined\n\nOur **HR Beginners Course** (6 weeks) covers all of this from scratch. Want to know what week 1 looks like?`
    if (/(fresher|beginner|new|no experience|just graduated|0 year|entry level|fresh)/.test(m))
      return `You've come to the right place! Many of our best alumni started with zero HR experience.\n\nOur **HR Courses for Beginners** (6 weeks):\n• HR fundamentals & recruitment basics\n• Resume screening & shortlisting\n• Communication & cold-calling techniques\n• ATS basics and job portal usage\n• Certificate on completion\n\n**Result:** Most freshers land their first HR job within 60 days of completing. Want to hear what a typical week looks like?`
    if (/(switch|change career|from sales|non-hr|different field|background|transition|move to hr)/.test(m))
      return `Career switching into HR is absolutely possible — your previous experience is actually a strength!\n\nHere's why:\n• Sales background → great at candidate persuasion and client handling\n• Operations background → process-driven hiring\n• Teaching background → excellent at training and assessment\n\n**What we help you do:**\n• Reframe your existing skills for HR roles\n• Build technical HR knowledge (sourcing, ATS, screening)\n• Land your first HR role within 60–90 days\n\nWant to hear from someone who made a similar switch?`
    if (/(agency|own business|start firm|freelance|entrepreneur|independent)/.test(m))
      return `The entrepreneurship path is exciting and very achievable!\n\nOur **HR Entrepreneurship Program** (2 months) covers:\n• Setting up your firm legally (Proprietorship / LLP)\n• Finding and closing your first 3–5 clients\n• Pricing models: retainer vs contingency\n• Building a candidate pipeline from day one\n• Managing delivery and scaling your team\n\nMany students launch within 30 days of completing. Want to hear a success story?`
    if (/(interview|mock|practice|prepare|nervous|confident|face interview|crack interview)/.test(m))
      return `Interview prep is one of the most underrated skills! Here's what works:\n\n**For HR job interviews:**\n• Use the **STAR method** for behavioural questions\n• Prepare answers for: "Tell me about a difficult hire you made" / "How do you source passive candidates?" / "How do you handle offer drops?"\n• Know at least 2 ATS tools and 3 sourcing platforms\n• Research the company's hiring volume and recent news\n\n**3 questions you're almost certain to face:**\n1. Why do you want to be a recruiter?\n2. Describe your sourcing process\n3. How do you handle rejection from candidates?\n\nWant model answers for any of these?`
    if (/(resume|cv|profile|linkedin profile|bio|portfolio)/.test(m))
      return `Your resume needs to speak recruiter language!\n\n**Structure for an HR fresher:**\n• **Summary** — 2 lines: who you are + what you offer\n• **Skills** — sourcing, screening, ATS tools, Excel, communication\n• **Projects/Internships** — even if brief, mention roles and impact\n• **Education** — mention any HR-related coursework\n• **Certifications** — our course certificate adds strong credibility\n\n**Power tip:** Add numbers wherever possible — "screened 50+ profiles", "scheduled 20+ interviews per week" — even from training projects.\n\nShall I give you a line-by-line template?`
    if (/(salary|earn|pay|lpa|income|how much|money|ctc)/.test(m))
      return `Here's a realistic salary picture for HR roles in India:\n\n• **Fresher (0–1 yr):** ₹2.5–5 LPA\n• **Junior Recruiter (1–3 yrs):** ₹4–8 LPA\n• **Senior Recruiter (3–5 yrs):** ₹8–14 LPA\n• **Talent Acquisition Lead:** ₹14–22 LPA\n• **Freelance/Agency:** Commission-based, ₹20K–₹2L per placement\n\nLocation matters — Mumbai, Bangalore, Pune pay 20–40% more than Tier-2 cities.\n\nWith our placement support, most freshers land ₹3–4.5 LPA in their first role. Want details?`
    if (/(course|program|which|best|recommend|join|enroll|certif|train|learn)/.test(m))
      return `Here's my recommendation based on your profile:\n\n• **Just starting out?** → HR Beginners Course (6 wks) — foundations, tools, first job readiness\n• **Want full hiring skills?** → End-to-End Recruitment (3 mo) — sourcing to onboarding\n• **Want your own agency?** → HR Entrepreneurship Program (2 mo)\n• **Corporate team?** → Corporate Training (Flexible)\n\nAll courses are online, live sessions, with placement support. What's your current background so I can give a personalised recommendation?`
    if (/(placement|job|get hired|job support|career support|placed)/.test(m))
      return `Our placement support is one of the strongest in India:\n\n• **Resume building** tailored for HR roles\n• **Mock interviews** with real feedback from working recruiters\n• **Job referrals** to 500+ hiring companies\n• **LinkedIn makeover** — profiles that get noticed\n• **6-month support** after course completion\n\n95% of our students get placement support. Many land jobs within 60 days. Want to know which companies hire from us?`
    if (/(hr|human resource|talent acquisition|ta|recruitment basics|hiring process|how to hire)/.test(m))
      return `Here's the foundation of **HR & Recruitment**:\n\n**Core areas of HR:**\n• Talent Acquisition (Recruitment)\n• Learning & Development\n• HR Operations & Compliance\n• Payroll & Benefits\n• Employee Engagement\n\n**Recruitment specifically focuses on:**\nAttracting → Screening → Selecting → Onboarding the right people.\n\nOur courses focus specifically on **Talent Acquisition** — the highest-demand and highest-paying HR function. Want to know why it's the best specialisation to start with?`
    return `I'm here to help you succeed in HR! I can guide you on:\n\n• **Getting started** in recruitment (no experience needed)\n• **Career switching** into HR from any background\n• **Resume & interview prep** for HR jobs\n• **Course selection** based on your goals\n• **Salary & career growth** in recruitment\n\nWhat's your current situation — I'll give you a personalised roadmap.`
  },

  arjun: (msg) => {
    const m = msg.toLowerCase().trim()
    if (isGreeting(m)) return `Hey! Great to connect — I'm Arjun, 15 years exclusively in IT and tech recruitment.\n\nTech sourcing challenge, niche role help, or looking to get into IT recruitment yourself?`
    if (isHowRU(m))   return `All good! Just wrapped a session on Python developer sourcing. What brings you in today?`
    if (isThanks(m))  return `Happy to help! Tech recruitment rewards specialists — the learning curve is steep but the returns are fantastic.`
    if (isBye(m))     return `Great chatting! The tech hiring market is booming. 📞 **+91 99750 48884** anytime.`
    if (/(fundamental|basic|concept|intro|overview|learn|start|what is)/.test(m))
      return `IT Recruitment fundamentals — here's what you need to know:\n\n**1. Understand Tech Roles**\nKnow the difference: Frontend vs Backend vs Full Stack, DevOps vs Cloud, Data Analyst vs Data Scientist.\n\n**2. Read a JD like a developer**\nSpot must-haves (skills the team can't function without) vs nice-to-haves.\n\n**3. Source from the right places**\nLinkedIn, GitHub, Stack Overflow, Naukri, HackerEarth, referrals.\n\n**4. Screen without a tech background**\nAsk: "Walk me through a recent project" — let them talk, listen for depth.\n\n**5. Move fast**\nTop tech talent gets 5–10 InMails/week. Your response time is your competitive advantage.\n\nWant to go deeper on any of these?`
    if (/(stack|role|java|python|react|node|devops|cloud|aws|data|fullstack|frontend|backend|mobile|ios|android|.net|php|angular|vue|kotlin|swift)/.test(m))
      return `Great — here's a quick cheat sheet on **common tech roles**:\n\n• **Frontend** — React, Angular, Vue, HTML/CSS/JS\n• **Backend** — Java, Python, Node.js, .NET, PHP\n• **Full Stack** — MEAN (MongoDB+Express+Angular+Node), MERN (React instead of Angular)\n• **Data** — SQL, Python, R, Power BI, Tableau\n• **DevOps/Cloud** — AWS, Azure, GCP, Docker, Kubernetes, CI/CD\n• **Mobile** — iOS (Swift/Kotlin), Android (Kotlin/Java), React Native\n\nWhen reading a JD, focus on the **primary tech** (non-negotiable) vs adjacent tech (trainable).\n\nWhich role are you currently sourcing for?`
    if (/(boolean|source|headhunt|xray|x.ray|github|linkedin|naukri|portal|search|string|keyword)/.test(m))
      return `Boolean mastery is your #1 sourcing weapon. Here's a working example:\n\n**For a React + Node.js developer in Bangalore:**\n("React" OR "ReactJS") AND ("Node" OR "Node.js") AND ("Bangalore" OR "Bengaluru") -intern -fresher\n\n**X-ray Google search:**\nsite:linkedin.com/in "React developer" "Bengaluru" "open to work"\n\n**GitHub:**\nlocation:Bangalore language:JavaScript followers:>50\n\n**Pro tip:** Search job titles AND skill combinations, not just job titles.\n\nWant me to build a string for a specific role you're working on?`
    if (/(screen|shortlist|filter|assess|evaluat|judge|how to check|verify skill)/.test(m))
      return `Screening tech candidates without a coding background:\n\n**Resume scan (60 seconds):**\n• Look for project descriptions — good devs explain what they built\n• GitHub links / portfolio — strong signal\n• Company quality + role progression\n• Tenure — short stints in top companies are fine; short stints in unknown companies need explanation\n\n**Phone screen (10 min):**\n• "Walk me through your current tech stack"\n• "What's the most complex feature you've built recently?"\n• Gauge communication — tech teams care about this\n• Confirm notice period, location, salary range upfront\n\nWant a full tech screening scorecard template?`
    if (/(it recruit|tech recruit|career|scope|future|demand|niche|speciali)/.test(m))
      return `IT Recruitment is the highest-paying niche in HR — here's why:\n\n• **Demand never drops** — every company needs tech talent\n• **Premiums are high** — IT placement fees are 12–18% of CTC vs 8–10% for non-IT\n• **Shortage of good IT recruiters** — companies pay more for specialists\n• **Remote-friendly** — you can source globally from anywhere\n\n**Career earnings:**\n• Fresher: ₹3.5–6 LPA\n• 2–4 years: ₹8–15 LPA\n• Senior/Lead: ₹16–28 LPA\n• Agency owner: ₹50L+ annual\n\nInterested in our IT Recruitment specialisation track?`
    if (/(salary|earn|pay|lpa|income|money|ctc)/.test(m))
      return `IT recruiters earn significantly more than general HR:\n\n• **Fresher:** ₹3.5–6 LPA\n• **2–4 years:** ₹8–15 LPA\n• **Senior / Lead:** ₹16–28 LPA\n• **Tech Staffing Agency:** ₹50L+ annual is achievable\n\nBangalore, Hyderabad, Pune pay the highest for IT recruiters. Companies like Infosys, TCS, Wipro, product startups hire aggressively.\n\nOur placement cell has strong IT company connections. Want to know more?`
    if (/(course|program|enroll|join|certif|train|learn|study)/.test(m))
      return `For IT Recruitment, I recommend our **End-to-End Recruitment Training** with the IT specialisation track:\n\n• Reading tech JDs and understanding stacks\n• Boolean and X-ray sourcing for developers\n• Tech candidate screening techniques\n• LinkedIn Recruiter and GitHub sourcing\n• Offer management for tech roles (counter-offers are very common!)\n\n**Duration:** 3 months | **Mode:** Online live sessions\n\n📞 **+91 99750 48884** for batch details and fees.`
    return `IT recruitment is a specialised and high-reward field. I can help with:\n\n• **Understanding tech roles** (what each stack means)\n• **Boolean & sourcing** for developers\n• **Screening without a tech background**\n• **LinkedIn & GitHub sourcing**\n• **Career path** in IT recruitment\n\nWhat specific challenge are you facing or topic you want to explore?`
  },

  priya: (msg) => {
    const m = msg.toLowerCase().trim()
    if (isGreeting(m)) return `Hi! I'm Priya — 14 years in mass hiring and volume recruitment for BPO, BFSI, retail, and manufacturing.\n\nDealing with a high-volume challenge, or building skills in this area?`
    if (isHowRU(m))   return `Doing well! Just finalised a 500-position hiring plan. Volume hiring keeps you sharp! What can I help with?`
    if (isThanks(m))  return `Happy to help! Once you have the right processes, volume hiring becomes very manageable.`
    if (isBye(m))     return `Best of luck with your hiring goals! 📞 **+91 99750 48884** for further support.`
    if (/(fundamental|basic|concept|intro|overview|learn|start|what is recruit|how recruit)/.test(m))
      return `Let me give you the **fundamentals of volume recruitment** — it's different from normal hiring:\n\n**1. Plan before you post**\nKnow your monthly target, buffer percentage (typically 20% extra), and intake timelines.\n\n**2. Pre-build your pipeline**\nDon't wait for a role to go live — have a ready pool of pre-screened candidates.\n\n**3. Structured screening**\nUse a fixed 5-question phone screen (max 7 mins). Score every call. No exceptions.\n\n**4. Parallel processing**\nDon't wait for one batch to clear before the next round starts.\n\n**5. Offer fast, follow faster**\nSame-day offers when possible. Delay kills candidate intent.\n\nWhat's your current hiring volume or the scenario you're dealing with?`
    if (/(bulk|mass|volume|high.volume|large.scale|batch|100|200|500|1000)/.test(m))
      return `Volume hiring is a different game from 1:1 recruiting. My proven framework:\n\n**Phase 1 — Pipeline first**\nBuild a pre-qualified talent pool before roles go live. Use job fairs, walk-ins, referral drives.\n\n**Phase 2 — Structured pre-screening**\n5-minute call with a fixed 5-question scorecard. Score each candidate 1–5.\n\n**Phase 3 — Group assessments**\nFor 20+ openings: group discussions, written tests, or assessment centres.\n\n**Phase 4 — Parallel offer processing**\nDon't wait for a full batch to complete — process offers in waves.\n\nThis framework cuts time-to-join by 35–50%. What's your biggest bottleneck right now?`
    if (/(bpo|bfsi|banking|retail|manufacturing|pharma|logistics|ecomm|hospitality|sector|industry)/.test(m))
      return `Each sector has specific hiring patterns:\n\n• **BPO/Call Centre** — speed is everything; voice/non-voice fit matters; high attrition, so pipeline must be always-on\n• **BFSI/Banking** — background verification upfront; compliance documentation; AMFI/NCFM certifications matter\n• **Retail** — seasonal surges (festive season); location-based; walk-in drives work best\n• **Manufacturing** — skills testing (ITI, diploma); shift fit; attrition management\n• **Pharma/Healthcare** — regulatory compliance; licensing checks\n• **E-commerce** — fast-paced; warehouse ops hiring in bulk\n\nWhich sector are you hiring for? I'll give you a tailored approach.`
    if (/(source|sourcing|find candidate|attract|campus|job fair|walk.in|referral|portal|naukri|monster)/.test(m))
      return `For volume hiring, use a multi-channel sourcing strategy:\n\n• **Job Portals** — Naukri, Monster, Indeed (set up resume alerts)\n• **Walk-in Drives** — extremely effective for BPO, retail, manufacturing\n• **Campus Hiring** — partner with colleges near your locations\n• **Employee Referrals** — ₹2,000–₹5,000 referral bonus drives 30%+ of hires\n• **WhatsApp Groups** — local recruitment groups in target cities\n• **LinkedIn** — for slightly senior roles in volume hiring\n\n**Pro tip:** For BPO and retail, a well-run walk-in drive with good FM outreach can fill 50+ positions in a weekend.\n\nWhat channel are you currently using the most?`
    if (/(screen|shortlist|filter|assess|evaluat|score|interview|call)/.test(m))
      return `Screening at scale requires strict process. Here's my system:\n\n**5-Question Phone Screen (7 mins max):**\n1. Current role and company?\n2. Notice period / availability?\n3. Location — are they willing to commute or relocate?\n4. Salary — current and expected?\n5. One skill/experience check specific to the role\n\n**Scoring:** Rate 1–5 on each. Only move candidates scoring 20+ to next round.\n\n**At 100+ applications a day:** Set up an auto-shortlisting keyword filter on Naukri/Indeed before manual review.\n\nWant a ready-made screening scorecard template?`
    if (/(time.to.hire|reduce|fast|slow|speed|bottleneck|delay|urgent|quick|asap)/.test(m))
      return `Top 3 fixes for slow time-to-hire:\n\n1. **Stop sequential processing** — run screening, interviews, and offer in parallel waves, not one-after-another\n2. **Same-day offer rule** — for junior roles, candidate who clears interview gets offer same day (or within 4 hrs)\n3. **Pre-approved offer templates** — get HR/legal to pre-approve salary bands and offer letters so you're not waiting for sign-offs\n\n**Bonus:** Track your drop-off stage. Most companies lose 40% of candidates in the offer-to-joining gap. A simple 3-touch follow-up (Day 1, Day 7, Day -7 before joining) reduces drop-offs by 25%.\n\nWhich stage is your longest delay?`
    if (/(attrition|retain|turnover|resign|quit|leave|dropout|no show)/.test(m))
      return `High attrition is the #1 pain in volume hiring. Here's how to attack it:\n\n**Pre-joining drop-offs:**\n• Call every candidate at Day 1, Day 7, and 1 week before joining\n• Assign a buddy before Day 1\n• Send a welcome email immediately after offer acceptance\n\n**Post-joining early exits (first 90 days):**\n• Structured onboarding — not just paperwork\n• 30-day check-in call from HR\n• Buddy system in first week\n\n**Root cause check:**\n• Are you screening for role fit, or just filling seats?\n• Is the JD realistic? Misaligned expectations = early exits\n\nWhat's your current attrition rate and at which stage?`
    if (/(course|program|enroll|join|certif|train|learn|study)/.test(m))
      return `For volume and mass hiring skills, our **End-to-End Recruitment Training** is ideal:\n\n• Sourcing at scale (multi-channel)\n• Structured screening and scorecards\n• Volume interview coordination\n• Offer management and joining follow-up\n• Metrics: time-to-hire, cost-per-hire, offer-to-join ratio\n\n**Duration:** 3 months | **Mode:** Online live sessions | **Placement support:** Included\n\n📞 **+91 99750 48884** for next batch details.`
    return `To give you the most targeted advice on volume hiring:\n\n• What industry / function are you hiring for?\n• How many positions per month?\n• Biggest current pain — sourcing, speed, offer drops, or attrition?\n\nTell me the specifics and I'll share exactly what's worked in similar situations.`
  },

  sanjay: (msg) => {
    const m = msg.toLowerCase().trim()
    if (isGreeting(m)) return `Hello! Great to meet you — I'm Sanjay, built and scaled 2 agencies from scratch, now mentoring entrepreneurs.\n\nThinking of starting your own HR firm, or already running one and want to grow?`
    if (isHowRU(m))   return `Fantastic! Just had a mentee close their first ₹2L placement fee — always a great feeling. Where are you in your entrepreneurship journey?`
    if (isThanks(m))  return `It's a pleasure! Building your own recruitment business is one of the most rewarding decisions you can make. Keep going!`
    if (isBye(m))     return `All the best! Remember — the first client is the hardest. After that, referrals do the work. 📞 **+91 99750 48884** anytime.`
    if (/(fundamental|basic|concept|intro|overview|learn|what is recruit|how recruit|how hiring)/.test(m))
      return `From an entrepreneur's lens, here are the **5 fundamentals every agency owner must master**:\n\n**1. Niche Selection**\nSpecialist agencies earn 2–3x more than generalists. Pick: IT, BFSI, retail, healthcare, etc.\n\n**2. Client Acquisition**\nYour ability to sign clients = your revenue ceiling. This is a sales skill.\n\n**3. Candidate Pipeline**\nAlways-on sourcing — never start from zero when a new mandate comes in.\n\n**4. Delivery Excellence**\n3 CVs in 48 hrs, regular updates, honest feedback. This is what gets you repeat business.\n\n**5. Billing & Collections**\nCharge 10–15% of CTC. Get 50% advance on retained mandates. Never work on pure contingency for new clients.\n\nWhich of these do you want to go deeper on?`
    if (/(start|launch|setup|register|first step|how to begin|new agency|open firm|create agency)/.test(m))
      return `Here's the **Day 1 roadmap** I give every mentee:\n\n**Step 1 — Niche selection (Day 1–3)**\nGeneralist agencies struggle. Pick one: IT, BFSI, retail, healthcare.\n\n**Step 2 — Business setup (Day 4–10)**\nProprietorship (easiest to start) or LLP. GST registration. Basic NDA + service agreement template.\n\n**Step 3 — Build your candidate pool (Day 1 onwards)**\nStart sourcing in your niche before you have clients. You need a bench.\n\n**Step 4 — First client (Week 2–4)**\nWarm outreach — ex-employer, ex-colleagues, LinkedIn connections.\n\nMost of my mentees close their first client within 3 weeks. Want the exact outreach message I use?`
    if (/(client|bd|business development|find clients|get clients|sign client|approach company|win business)/.test(m))
      return `Client acquisition is the lifeblood of your agency. Here's what actually works:\n\n**Month 1 — Warm outreach:**\n• Ex-employers (they already trust you)\n• Ex-colleagues who moved to hiring roles\n• LinkedIn 1st-degree connections in HR/management\n\n**Month 2–3 — Cold outreach:**\nTarget HR heads + Business heads in your niche.\nEmail subject: "Specialist [Niche] Recruiter — 3 CVs in 48 hrs"\n\n**Month 3+ — Content inbound:**\nPost niche hiring insights on LinkedIn weekly. Inbound leads start coming.\n\n**Best opening offer:**\n*"I specialise in [role] in [sector]. Let me send you 3 CVs on a no-hire, no-fee basis."*\n\nWant the full 3-email outreach sequence?`
    if (/(money|revenue|earn|billing|commission|profit|fee|how much|income|ctc|charge|invoice|payment)/.test(m))
      return `Here's the real financial picture for a recruitment agency:\n\n**Fee structure:**\n• Contingency: 10–15% of candidate CTC (paid on joining)\n• Retained search: 30–50% upfront, balance on placement\n• RPO (embedded recruiting): ₹40K–₹1.5L per month per recruiter\n\n**Revenue milestones:**\n• Solo, 3 placements/mo: ₹1.5–2.5L/month\n• 3-person team: ₹5–8L/month\n• 10-person agency (Year 2–3): ₹1–2Cr/year\n\n**Critical rule:** Never work for 30 clients at 10% each. Work for 5 clients at 15% and deliver excellence. Referrals build from there.\n\nWant a first-year P&L projection?`
    if (/(scale|grow|expand|team|hire recruiter|second person|delegate|automate|crm|process)/.test(m))
      return `Scaling from solo to team is the hardest transition. Here's my framework:\n\n**When to hire your first recruiter:**\nWhen you're turning down mandates due to capacity, not when you feel comfortable.\n\n**First hire profile:**\nJunior sourcer — pays for itself in 90 days if well-managed.\n\n**Systems before people:**\n• CRM (Zoho Recruit / Keka) — essential before you scale\n• SOPs for every process — sourcing, screening, client updates\n• Billing tracker and collections process\n\n**Client concentration risk:**\nNever let one client = >40% of revenue. Build your base first.\n\nHow many placements are you making per month currently?`
    if (/(legal|contract|agreement|gst|register|llp|proprietor|compliance|nda|invoice)/.test(m))
      return `The legal setup for a recruitment agency is straightforward:\n\n**Business structure:**\n• **Proprietorship** — easiest to start, no separate legal entity, personal liability\n• **LLP** — limited liability, professional image, better for larger clients\n• **Pvt Ltd** — for scale; overkill at the start\n\n**GST:** Register once turnover crosses ₹20L (recommended to register from day 1 for credibility).\n\n**Essential documents:**\n• Service Agreement (outlines fee %, payment terms, guarantee clause)\n• NDA with clients\n• Offer letter / joining confirmation format\n\n**Guarantee clause:** Standard is 3-month replacement if candidate leaves. Set a 30-day cap for freshers.\n\nWant a template service agreement checklist?`
    if (/(scared|nervous|risk|stable job|should i|afraid|quit|fear|uncertain|doubt|worry)/.test(m))
      return `That fear is completely normal — and honestly a great sign you're thinking seriously.\n\n**My honest advice:**\nDon't quit your job to start. Here's the bridge approach:\n\n• **Month 1–2:** Start sourcing and building a candidate pool while employed\n• **Month 2–3:** Do warm client outreach (evenings and weekends)\n• **Month 3:** Close your first client and do your first placement\n• **Month 4+:** Once you have 2 paying clients and ₹1L+ pipeline, then transition\n\n300+ of my mentees made this transition without a career gap. The goal is to replace your salary before you leave.\n\nShall I help you map out a 90-day bridge plan?`
    if (/(course|program|enroll|join|certif|train|learn|study)/.test(m))
      return `Our **HR Entrepreneurship Program** (2 months) is built specifically for agency starters:\n\n• Niche selection and positioning\n• Business registration and legal basics\n• Client acquisition (scripts, outreach, LinkedIn)\n• Candidate pipeline building\n• Billing, invoicing, and collections\n• Scaling: when and how to hire your first recruiter\n\nIncludes: Templates, SOPs, live mentoring, alumni network of 300+ agency owners.\n\n📞 **+91 99750 48884** for next batch dates and fees.`
    return `I can help you with any stage of building your recruitment agency:\n\n• **Getting started** — setup, niche, first steps\n• **Getting clients** — outreach, BD, pitch\n• **Revenue & billing** — fee structures, invoicing\n• **Scaling your team** — when and how\n• **Legal & compliance** — contracts, GST\n• **Handling fear** — making the transition safely\n\nWhere are you right now in your journey?`
  },
}

function expertReply(id: string, msg: string): string {
  return (EXPERT_FN[id] ?? (() => `Thank you for sharing that. Can you tell me more so I can give you a more targeted response?`))(msg)
}

/* ─── Timer messages ──────────────────────────────────────────── */

const WARN_MSG  = (name: string, rate: string) =>
  `⏱️ **Heads up** — your free 2 minutes with ${name} are almost up (15 seconds left). After this, the session is chargeable at **${rate}**.\n\nBook a course for unlimited expert access.`

const EXPIRE_MSG = (name: string, rate: string) =>
  `🔒 **Your free session has ended.**\n\nTo continue with ${name}:\n\n• **Continue paid** — ${rate}\n• **Book a course** — Unlimited expert access\n• **Call free** — +91 99750 48884`

/* ─── Markdown renderer ───────────────────────────────────────── */

function renderText(text: string) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <span key={i}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
        {i < arr.length - 1 && <br />}
      </span>
    )
  })
}

/* ─── Component ───────────────────────────────────────────────── */

const FREE_SECS = 120

export default function ChatAssistant() {
  const [open,           setOpen]           = useState(false)
  const [screen,         setScreen]         = useState<Screen>('greeting')
  const [selectedNeed,   setSelectedNeed]   = useState<string | null>(null)
  const [activeExpert,   setActiveExpert]   = useState<Expert | null>(null)
  const [messages,       setMessages]       = useState<Msg[]>([])
  const [input,          setInput]          = useState('')
  const [typing,         setTyping]         = useState(false)
  const [unread,         setUnread]         = useState(1)
  const [secs,           setSecs]           = useState(0)
  const [sessionActive,  setSessionActive]  = useState(false)
  const [expired,        setExpired]        = useState(false)
  const [warnSent,       setWarnSent]       = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  useEffect(() => {
    if (open) {
      setUnread(0)
      if (screen !== 'chat' && screen !== 'bot') {
        setScreen('greeting')
        setSelectedNeed(null)
      }
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!sessionActive || expired) return
    timerRef.current = setInterval(() => {
      setSecs(s => {
        const n = s + 1
        if (n === FREE_SECS - 15 && !warnSent && activeExpert) {
          setWarnSent(true)
          setMessages(prev => [...prev, { role: 'system', text: WARN_MSG(activeExpert.name, activeExpert.rate) }])
        }
        if (n >= FREE_SECS) {
          clearInterval(timerRef.current!)
          setSessionActive(false)
          setExpired(true)
          setMessages(prev => [...prev, { role: 'system', text: EXPIRE_MSG(activeExpert?.name ?? 'the expert', activeExpert?.rate ?? '₹299/min') }])
        }
        return n
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sessionActive, expired, warnSent, activeExpert])

  const connectExpert = useCallback((expert: Expert) => {
    setActiveExpert(expert)
    setScreen('chat')
    setSecs(0); setSessionActive(false); setExpired(false); setWarnSent(false)
    setMessages([{ role: 'bot', text: `Connecting you with **${expert.name}**...\n\nYour first **2 minutes** are completely FREE. After that, chargeable at **${expert.rate}**.\n\nFeel free to start — I'm here!`, expertId: expert.id }])
    setTimeout(() => setSessionActive(true), 1000)
  }, [])

  function sendExpert(text: string) {
    if (!text.trim() || !activeExpert || expired) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput(''); setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'bot', text: expertReply(activeExpert.id, text), expertId: activeExpert.id }])
      if (!open) setUnread(n => n + 1)
    }, 800)
  }

  function sendBot(text: string) {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput(''); setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'bot', text: botReply(text) }])
      if (!open) setUnread(n => n + 1)
    }, 600)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (screen === 'bot') sendBot(input)
      else sendExpert(input)
    }
  }

  function handleSend() {
    if (screen === 'bot') sendBot(input)
    else sendExpert(input)
  }

  function openBot() {
    setScreen('bot')
    setMessages([{ role: 'bot', text: `Hello! Welcome to **Recruitment Institute** — India's #1 HR & Recruitment Training Academy.\n\nI'm your virtual assistant. Ask me anything about our courses, fees, placement, or enrollment!\n\nHow can I help you today?` }])
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 150)
  }

  function resetToHome() {
    if (timerRef.current) clearInterval(timerRef.current)
    setScreen('greeting'); setSelectedNeed(null); setActiveExpert(null)
    setMessages([]); setSecs(0); setSessionActive(false); setExpired(false); setWarnSent(false)
  }

  const filteredExperts = selectedNeed
    ? (NEED_MAP[selectedNeed] ?? []).map(id => EXPERTS.find(e => e.id === id)!).filter(Boolean)
    : EXPERTS.slice(0, 3)

  const timerPct   = Math.min((secs / FREE_SECS) * 100, 100)
  const timerColor = secs > FREE_SECS - 30 ? '#EF4444' : secs > FREE_SECS * 0.6 ? '#F59E0B' : '#10B981'

  const headerTitle = screen === 'chat' && activeExpert ? activeExpert.name
    : screen === 'bot' ? 'RI Assistant'
    : 'Recruitment Institute'
  const headerSub = screen === 'chat' && activeExpert ? activeExpert.title
    : screen === 'bot' ? 'Virtual Assistant'
    : 'How can we help you today?'

  const showBack = screen === 'need' || screen === 'experts' || screen === 'chat' || screen === 'bot'

  return (
    <>
      {/* ── Floating stack ── */}
      <div className="ec-float-stack">

        {/* WhatsApp */}
        <a
          href="https://wa.me/917385204165?text=Hello%2C%20I%20am%20interested%20in%20Recruitment%20Institute%20courses"
          target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
          className="ec-wa-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>

        {/* Main chat button */}
        <button onClick={() => setOpen(v => !v)} aria-label="Chat" className="ec-chat-btn">
          {!open && <span className="ec-pulse-ring" />}
          {open
            ? <X style={{ width: 22, height: 22 }} />
            : (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="10" r="4.2" fill="white" opacity="0.95"/>
                <path d="M5.5 23c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5" stroke="white" strokeWidth="2.1" strokeLinecap="round" opacity="0.95"/>
                <rect x="11" y="19.5" width="6" height="4" rx="1.2" fill="white" opacity="0.9"/>
                <path d="M12.5 19.5v-1a1.5 1.5 0 013 0v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.85"/>
              </svg>
            )
          }
          {!open && unread > 0 && (
            <span className="ec-unread-badge">{unread}</span>
          )}
        </button>
      </div>

      {/* ── Chat window ── */}
      {open && (
        <div className="ec-window">

          {/* Header */}
          <div className="ec-header">
            <div className="ec-header-dots" />
            <div className="ec-header-accent" />

            {showBack && (
              <button className="ec-back-btn" onClick={() => {
                if (screen === 'chat') { setScreen('experts'); if (timerRef.current) clearInterval(timerRef.current); setSessionActive(false) }
                else if (screen === 'experts') setScreen('need')
                else resetToHome()
              }}>
                <ArrowLeft style={{ width: 14, height: 14 }} />
              </button>
            )}

            {/* Avatar */}
            {screen === 'chat' && activeExpert ? (
              <div
                className="ec-avatar-ring"
                style={{ background: activeExpert.bg, border: `2px solid ${activeExpert.color}40` }}
              >
                <span style={{ fontSize: 12, fontWeight: 800, color: activeExpert.color }}>{activeExpert.avatar}</span>
                <span className="ec-avatar-online" />
              </div>
            ) : screen === 'bot' ? (
              <div className="ec-avatar-bot">
                <Bot style={{ width: 17, height: 17, color: 'white' }} />
              </div>
            ) : (
              <div className="ec-avatar-default">
                <Users style={{ width: 17, height: 17, color: 'white' }} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <p className="ec-header-title">{headerTitle}</p>
              <p className="ec-header-sub">{headerSub}</p>
            </div>

            {/* Timer ring */}
            {screen === 'chat' && sessionActive && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, position: 'relative' }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
                    <circle cx="16" cy="16" r="13" fill="none" stroke={timerColor} strokeWidth="2.5"
                      strokeDasharray={`${2 * Math.PI * 13}`}
                      strokeDashoffset={`${2 * Math.PI * 13 * (timerPct / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: timerColor }}>{FREE_SECS - secs}s</span>
                </div>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>FREE</span>
              </div>
            )}

            <button className="ec-minimize-btn" onClick={() => setOpen(false)}>
              <ChevronDown style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* ════ GREETING ════ */}
          {screen === 'greeting' && (
            <div className="ec-greeting">
              <div className="text-center">
                <div className="ec-greeting-icon-wrap">
                  <MessageCircle style={{ width: 26, height: 26, color: '#1E40AF' }} />
                </div>
                <h3 className="ec-greeting-title">How can we help you?</h3>
                <p className="ec-greeting-desc">
                  Get instant answers from our AI assistant or connect with a real recruitment expert —{' '}
                  <strong style={{ color: '#1E40AF' }}>first 2 minutes free!</strong>
                </p>
              </div>

              <div className="ec-option-grid">
                <button onClick={openBot} className="ec-option-bot">
                  <div className="ec-option-bot-icon">
                    <Bot style={{ width: 18, height: 18, color: 'white' }} />
                  </div>
                  <div className="text-center">
                    <p className="ec-option-label">AI Assistant</p>
                    <p className="ec-option-sub">Quick answers about courses, fees & enrollment</p>
                  </div>
                  <span className="ec-instant-badge">Instant</span>
                </button>

                <button onClick={() => setScreen('need')} className="ec-option-expert">
                  <div className="ec-option-expert-icon">
                    <Users style={{ width: 18, height: 18, color: 'white' }} />
                  </div>
                  <div className="text-center">
                    <p className="ec-option-label">Live Expert</p>
                    <p className="ec-option-sub">Chat with a real recruitment trainer</p>
                  </div>
                  <span className="ec-free-badge">2 min FREE</span>
                </button>
              </div>

              <div className="ec-expert-pills">
                {EXPERTS.slice(0, 3).map(e => (
                  <div
                    key={e.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 50, background: e.bg, border: `1px solid ${e.color}25`, fontSize: 10, fontWeight: 700, color: e.color }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    {e.name.split(' ')[0]}
                  </div>
                ))}
                <div className="ec-expert-pill-more">+{EXPERTS.length - 3} more</div>
              </div>

              <div className="ec-quick-links">
                <Link href="/courses" className="ec-quick-link ec-quick-link--courses">View Courses</Link>
                <a href="tel:+917385204165" className="ec-quick-link ec-quick-link--call">📞 Free Callback</a>
              </div>
            </div>
          )}

          {/* ════ BOT CHAT ════ */}
          {screen === 'bot' && (
            <>
              <div className="ec-chat-body">
                {messages.map((msg, i) => (
                  <div key={i} className={`ec-msg-row ec-msg-row--${msg.role === 'user' ? 'user' : 'bot'}`}>
                    {msg.role === 'bot' && (
                      <div className="ec-msg-avatar-bot">
                        <Bot style={{ width: 13, height: 13, color: '#1E40AF' }} />
                      </div>
                    )}
                    <div className={msg.role === 'user' ? 'ec-bubble-user' : 'ec-bubble-bot'}>
                      {renderText(msg.text)}
                    </div>
                    {msg.role === 'user' && (
                      <div className="ec-msg-avatar-user">
                        <User style={{ width: 13, height: 13, color: 'white' }} />
                      </div>
                    )}
                  </div>
                ))}
                {typing && (
                  <div className="ec-typing-wrap">
                    <div className="ec-msg-avatar-bot">
                      <Bot style={{ width: 13, height: 13, color: '#1E40AF' }} />
                    </div>
                    <div className="ec-typing-bubble">
                      {[0,1,2].map(j => (
                        <span key={j} className="ec-dot" style={{ animation: `ecDot 1.2s ease-in-out ${j * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="ec-qr-bar">
                {BOT_QR.map(qr => (
                  <button key={qr} onClick={() => sendBot(qr)} className="ec-qr-btn">{qr}</button>
                ))}
              </div>
              <div className="ec-input-bar">
                <input
                  ref={inputRef} value={input}
                  onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder="Ask me anything..."
                  className="ec-input"
                />
                <button
                  onClick={handleSend} disabled={!input.trim()}
                  className={`ec-send-btn ${input.trim() ? 'ec-send-btn--active' : 'ec-send-btn--inactive'}`}
                >
                  <Send style={{ width: 15, height: 15, color: input.trim() ? 'white' : '#CBD5E1' }} />
                </button>
              </div>
            </>
          )}

          {/* ════ NEED SELECT ════ */}
          {screen === 'need' && (
            <div className="ec-need-screen">
              <p className="ec-need-title">What brings you here today?</p>
              <p className="ec-need-sub">Select your goal — we&apos;ll match you with the right expert.</p>
              <div className="ec-need-list">
                {NEEDS.map(need => {
                  const Icon = need.icon
                  return (
                    <button
                      key={need.id}
                      onClick={() => { setSelectedNeed(need.id); setScreen('experts') }}
                      className="ec-need-btn"
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: need.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: 16, height: 16, color: need.color }} />
                      </div>
                      <div>
                        <p className="ec-need-btn-label">{need.label}</p>
                        <p className="ec-need-btn-sub">{need.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ════ EXPERTS ════ */}
          {screen === 'experts' && (
            <div className="ec-experts-screen">
              <div className="ec-experts-head">
                <p className="ec-experts-head-title">Experts available for you</p>
                <div className="flex items-center gap-1.5">
                  <span className="ec-free-dot" />
                  <p className="ec-experts-head-sub">
                    First 2 minutes with each expert are completely <strong style={{ color: '#059669' }}>FREE</strong>
                  </p>
                </div>
              </div>
              <div className="ec-experts-list">
                {filteredExperts.map(expert => (
                  <div
                    key={expert.id}
                    className="ec-expert-card"
                    style={{ border: `1.5px solid ${expert.color}22` }}
                  >
                    <div style={{ height: 3, background: `linear-gradient(90deg,${expert.color},${expert.color}70)` }} />
                    <div className="ec-expert-card-body">
                      <div className="ec-expert-card-row">
                        <div
                          className="ec-avatar-ring"
                          style={{ width: 40, height: 40, background: expert.bg, border: `2px solid ${expert.color}35` }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 800, color: expert.color }}>{expert.avatar}</span>
                          <span style={{ position: 'absolute', bottom: 1, right: 1, width: 8, height: 8, borderRadius: '50%', background: '#10B981', border: '1.5px solid white' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center gap-1.5">
                            <p className="ec-expert-info-name">{expert.name}</p>
                            <div className="ec-expert-rating">
                              <Star style={{ width: 10, height: 10, color: '#F59E0B', fill: '#F59E0B' }} />
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B' }}>{expert.rating}</span>
                            </div>
                          </div>
                          <p className="ec-expert-info-title">{expert.title}</p>
                          <p className="ec-expert-info-exp">{expert.exp}</p>
                        </div>
                      </div>
                      <div className="ec-expert-tags">
                        {expert.tags.map(t => (
                          <span
                            key={t}
                            style={{ padding: '2px 8px', borderRadius: 50, background: expert.bg, color: expert.color, fontSize: 9, fontWeight: 700, border: `1px solid ${expert.color}20` }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => connectExpert(expert)}
                        className="ec-connect-btn"
                        style={{ background: `linear-gradient(135deg,${expert.color},${expert.color}CC)`, boxShadow: `0 4px 14px ${expert.color}35` }}
                      >
                        <Clock style={{ width: 12, height: 12 }} />
                        Chat Now — First 2 Minutes FREE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ EXPERT CHAT ════ */}
          {screen === 'chat' && (
            <>
              <div className="ec-chat-body">
                {messages.map((msg, i) => {
                  if (msg.role === 'system') return (
                    <div key={i} className="ec-system-msg">
                      {renderText(msg.text)}
                      {expired && (
                        <div className="ec-expired-actions">
                          <a href="tel:+917385204165" className="ec-expired-call-link">📞 Call Free Now</a>
                          <Link href="/courses" className="ec-expired-course-link">Book a Course</Link>
                          <button onClick={resetToHome} className="ec-expired-back-btn">Back to Home</button>
                        </div>
                      )}
                    </div>
                  )
                  return (
                    <div key={i} className={`ec-msg-row ec-msg-row--${msg.role === 'user' ? 'user' : 'bot'}`}>
                      {msg.role === 'bot' && activeExpert && (
                        <div
                          style={{ width: 28, height: 28, borderRadius: '50%', background: activeExpert.bg, border: `1.5px solid ${activeExpert.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          <span style={{ fontSize: 9, fontWeight: 800, color: activeExpert.color }}>{activeExpert.avatar}</span>
                        </div>
                      )}
                      <div className={msg.role === 'user' ? 'ec-bubble-user ec-bubble-user--expert' : 'ec-bubble-bot'}>
                        {renderText(msg.text)}
                      </div>
                      {msg.role === 'user' && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1E40AF,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User style={{ width: 13, height: 13, color: 'white' }} />
                        </div>
                      )}
                    </div>
                  )
                })}
                {typing && (
                  <div className="ec-typing-wrap">
                    {activeExpert && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: activeExpert.bg, border: `1.5px solid ${activeExpert.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: activeExpert.color }}>{activeExpert.avatar}</span>
                      </div>
                    )}
                    <div className="ec-typing-bubble">
                      {[0,1,2].map(j => (
                        <span key={j} className="ec-dot" style={{ animation: `ecDot 1.2s ease-in-out ${j * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              {!expired && (
                <div className="ec-input-bar">
                  <input
                    ref={inputRef} value={input}
                    onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                    placeholder={`Ask ${activeExpert?.name.split(' ')[0] ?? 'expert'} anything...`}
                    className="ec-input"
                  />
                  <button
                    onClick={handleSend} disabled={!input.trim()}
                    className={`ec-send-btn ${input.trim() ? 'ec-send-btn--active' : 'ec-send-btn--inactive'}`}
                    style={input.trim() && activeExpert ? { background: `linear-gradient(135deg,${activeExpert.color},${activeExpert.color}CC)` } : {}}
                  >
                    <Send style={{ width: 15, height: 15, color: input.trim() ? 'white' : '#CBD5E1' }} />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      )}
    </>
  )
}
