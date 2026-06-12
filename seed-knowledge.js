// Run: node seed-knowledge.js
const { Client } = require('pg')

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'recruitmentinstitute',
  user: 'postgres',
  password: 'postgres',
})

const knowledgeItems = [
  {
    question: 'What is Boolean search in recruitment?',
    answer: 'Boolean search uses logical operators AND, OR, and NOT to filter candidate searches on platforms like LinkedIn, Naukri, and Google. For example: ("talent acquisition" OR "HR recruiter") AND ("ATS" OR "sourcing") NOT "fresher". Mastering Boolean search dramatically improves sourcing accuracy and saves hours of manual screening.',
    addedBy: 'Sourcing & Recruitment Trainer',
  },
  {
    question: 'What is an ATS (Applicant Tracking System)?',
    answer: 'An Applicant Tracking System (ATS) is software that automates recruitment workflows — from posting jobs to job boards, parsing resumes, tracking candidate stages, scheduling interviews, and sending offer letters. Popular ATS platforms in India include Keka, Darwinbox, Zoho Recruit, and iRecruit (Naukri RMS). Learning at least one ATS is essential for any recruiter.',
    addedBy: 'HR Technology Trainer',
  },
  {
    question: 'What is the difference between a CV and a resume?',
    answer: 'A CV (Curriculum Vitae) is a comprehensive document listing your entire academic and professional history — commonly used in academia and international applications, often 3–5 pages. A resume is a concise 1–2 page summary tailored to a specific job. In India, both terms are used interchangeably, but for corporate roles a focused 2-page resume is preferred.',
    addedBy: 'Career Development Trainer',
  },
  {
    question: 'What is the STAR method in interviews?',
    answer: 'STAR stands for Situation, Task, Action, Result. It is a structured technique used in behavioural interviews to assess how candidates have handled real scenarios. As a recruiter, probe each part: What was the situation? What was your specific role? What actions did you take? What measurable result did you achieve? STAR gives you structured, comparable data across candidates.',
    addedBy: 'Interview Skills Trainer',
  },
  {
    question: 'How do you calculate time-to-hire?',
    answer: 'Time-to-hire is the number of days between a candidate entering the pipeline (applying or being sourced) and accepting the offer. Formula: Date of Offer Acceptance − Date Candidate Entered Pipeline. Industry benchmark in India is 30–45 days for corporate roles. Tracking this metric helps identify bottlenecks in your hiring process.',
    addedBy: 'HR Metrics Trainer',
  },
  {
    question: 'What is employer branding and why does it matter?',
    answer: 'Employer branding is the perception candidates and employees have of your company as a place to work. Strong employer brands attract higher-quality applicants, reduce cost-per-hire, and improve retention. Tactics include showcasing company culture on LinkedIn, publishing employee testimonials, maintaining a responsive career page, and responding to Glassdoor reviews professionally.',
    addedBy: 'Employer Branding Specialist',
  },
  {
    question: 'What is headhunting and how is it different from regular recruitment?',
    answer: 'Headhunting (executive search) involves proactively identifying and approaching senior or highly specialised candidates who are NOT actively job-seeking. Unlike standard recruitment where you wait for applications, headhunting requires deep market mapping, cold outreach skills, and discretion. It is typically used for Director-level and above positions.',
    addedBy: 'Executive Search Trainer',
  },
  {
    question: 'How do you write an effective job description?',
    answer: 'An effective JD has six parts: (1) Clear job title matching market language, (2) 3–5 bullet summary of the role, (3) Key responsibilities in plain English, (4) Must-have vs. nice-to-have qualifications, (5) Compensation range and benefits, (6) Company culture snapshot. Avoid jargon, gendered language, and laundry-list requirements that discourage strong candidates from applying.',
    addedBy: 'Talent Acquisition Trainer',
  },
  {
    question: 'What is cost-per-hire and how is it calculated?',
    answer: 'Cost-per-hire = (Internal Recruiting Costs + External Recruiting Costs) ÷ Total Hires in a Period. Internal costs include recruiter salaries, referral bonuses, and interview time. External costs include job portal subscriptions, agency fees, and background checks. This metric is essential for justifying HR budget and demonstrating recruitment ROI to leadership.',
    addedBy: 'HR Analytics Trainer',
  },
  {
    question: 'What is the difference between talent acquisition and recruitment?',
    answer: 'Recruitment is reactive — filling an open position as quickly as possible. Talent acquisition is strategic — building long-term pipelines, employer brand, workforce planning, and succession planning. A recruiter fills today\'s vacancy; a talent acquisition specialist ensures the organisation always has access to the right people even before a vacancy opens.',
    addedBy: 'Strategic HR Trainer',
  },
  {
    question: 'What is a talent pipeline and how do you build one?',
    answer: 'A talent pipeline is a pool of pre-qualified candidates you maintain for future roles. Build it by: tagging strong candidates in your ATS even after rejection, staying connected on LinkedIn, running talent communities and webinars, and re-engaging past applicants every 3–6 months. A warm pipeline reduces time-to-fill by 40–60% for recurring roles.',
    addedBy: 'Sourcing Strategy Trainer',
  },
  {
    question: 'How do you screen a candidate in a telephonic interview?',
    answer: 'Follow a structured script: (1) Introduce yourself and the company, (2) Confirm current role and notice period, (3) Check current and expected CTC, (4) Briefly pitch the role and check interest, (5) Ask 2–3 knockout questions relevant to the JD, (6) Close with next steps. Keep it under 15 minutes. Document responses immediately after the call.',
    addedBy: 'Interview Process Trainer',
  },
  {
    question: 'What is a notice period buyout and when is it used?',
    answer: 'A notice period buyout (NPB) means the new employer pays the candidate\'s equivalent salary for their notice period so they can join earlier. For example, if a candidate has a 60-day notice and the company needs them in 30 days, the company pays 30 days\' equivalent salary. NPB is used for critical roles where a delay is costlier than the buyout amount.',
    addedBy: 'Offer Management Trainer',
  },
  {
    question: 'What is a counter-offer and how should a recruiter handle it?',
    answer: 'A counter-offer is when a candidate\'s current employer offers a raise or promotion to retain them after they resign. To prevent candidate drop-out: (1) Discuss the counter-offer risk proactively before they resign, (2) Understand their primary motivation for leaving — if it\'s only money, counter-offer probability is high, (3) Keep the candidate engaged during notice period, (4) Loop in the hiring manager for a personal call if the candidate wavers.',
    addedBy: 'Candidate Management Trainer',
  },
  {
    question: 'What is the difference between an HR generalist and an HR business partner?',
    answer: 'An HR generalist manages end-to-end HR operations: hiring, payroll, compliance, L&D, and exits. An HR business partner (HRBP) is more strategic — they partner with specific business units to align people strategy with business objectives, advising leaders on workforce planning, culture, and organisational design. HRBPs typically operate at a higher level and require strong business acumen.',
    addedBy: 'HR Career Development Trainer',
  },
  {
    question: 'What are the most important HR metrics every recruiter should track?',
    answer: 'The six core recruitment metrics are: (1) Time-to-hire — speed of filling roles, (2) Cost-per-hire — total investment per hire, (3) Offer acceptance rate — quality of offers, (4) Source of hire — which channels perform best, (5) Quality of hire — 90-day performance rating of new hires, (6) Candidate Net Promoter Score (cNPS) — candidate experience feedback. Track these in a simple dashboard monthly.',
    addedBy: 'HR Analytics Trainer',
  },
  {
    question: 'How do you source candidates on LinkedIn for free?',
    answer: 'Free LinkedIn sourcing tactics: (1) X-Ray search via Google: site:linkedin.com/in "job title" "city" "skill", (2) Use LinkedIn\'s own search with Boolean filters in the search bar, (3) Engage with relevant posts and connect with commenters, (4) Join and participate in LinkedIn groups for your niche, (5) Post compelling job updates on your profile — reach is free. Save advanced InMail credits for senior roles.',
    addedBy: 'Digital Sourcing Trainer',
  },
  {
    question: 'What is the Employee Net Promoter Score (eNPS)?',
    answer: 'eNPS measures how likely employees are to recommend your organisation as a great place to work. Ask: "On a scale of 0–10, how likely are you to recommend us as an employer?" Promoters (9–10) minus Detractors (0–6) = eNPS. Scores above 20 are good; above 50 are excellent. Run eNPS quarterly and use it to identify engagement and retention risks early.',
    addedBy: 'Employee Experience Trainer',
  },
  {
    question: 'What is competency-based interviewing?',
    answer: 'Competency-based interviewing evaluates candidates against pre-defined behavioural competencies required for the role — such as "stakeholder management", "adaptability", or "data-driven decision making". Each competency has 2–3 structured questions and a scoring rubric. This approach reduces unconscious bias, improves prediction of on-the-job performance, and creates a defensible hiring record.',
    addedBy: 'Interview Design Trainer',
  },
  {
    question: 'What is the difference between induction and onboarding?',
    answer: 'Induction is the formal process of introducing a new employee to the company — policies, systems, team structure, and compliance training — typically in the first 1–3 days. Onboarding is the broader, longer-term process (typically 30–90 days) of integrating the employee into their role, culture, and team so they become productive and engaged. Best-practice onboarding significantly improves 12-month retention.',
    addedBy: 'HR Operations Trainer',
  },
  {
    question: 'How do you handle a candidate who accepts an offer but does not join?',
    answer: 'Called a "no-show" or "offer drop", this is preventable by: (1) Keeping engagement high between offer and joining — send weekly check-ins, welcome kits, and team introductions, (2) Confirming resignation from previous employer on the day they resign, (3) Checking in on the last working day at their previous company, (4) Having a backup candidate warm for critical roles. Offer drop rates above 15% indicate a deeper offer quality or experience problem.',
    addedBy: 'Candidate Retention Trainer',
  },
  {
    question: 'What is the 90-day rule in recruitment?',
    answer: 'The 90-day rule is the principle that new hires who leave within the first 90 days represent a failed hire — a failure of either sourcing, assessment, or onboarding. Many organisations track "90-day attrition" as a quality-of-hire indicator. Recruiters who consistently have high 90-day attrition need to revisit their competency assessment, candidate briefing, or expectation-setting process.',
    addedBy: 'Quality of Hire Trainer',
  },
  {
    question: 'What questions are illegal to ask in a job interview in India?',
    answer: 'Under Indian law and ethical HR practice, you must not ask about: caste, religion, marital status, pregnancy or family planning, age (unless a legal requirement), disability (unless directly relevant), sexual orientation, or financial history unrelated to the role. Stick to competency and experience-based questions directly tied to the job requirements. Discriminatory questions expose the company to legal liability and reputational damage.',
    addedBy: 'Legal Compliance Trainer',
  },
  {
    question: 'What is RPO (Recruitment Process Outsourcing)?',
    answer: 'RPO is when a company transfers all or part of its recruitment function to an external provider. The RPO provider acts as an embedded talent acquisition team — managing JDs, sourcing, screening, interview coordination, and reporting under the client\'s brand. RPO is cost-effective for high-volume hiring or companies that lack in-house TA bandwidth. India\'s RPO market is growing rapidly.',
    addedBy: 'Recruitment Business Trainer',
  },
  {
    question: 'How do you build a strong recruiter personal brand on LinkedIn?',
    answer: 'Key steps: (1) Complete your profile — professional photo, keyword-rich headline, detailed summary, (2) Post 3–4 times per week — hiring tips, candidate success stories, market insights, (3) Engage genuinely on others\' posts — comment with value, not just emojis, (4) Share your placements (with permission) and candidate transformations, (5) Build a niche — be known as the go-to recruiter for a specific function or industry. Consistency over 90 days delivers significant inbound candidate traffic.',
    addedBy: 'Personal Branding Trainer',
  },
  {
    question: 'What is the difference between working in an HR consultancy and an in-house HR team?',
    answer: 'In a consultancy: fast-paced, multiple clients, high sourcing volume, strong KPI pressure, broad industry exposure. In-house: deeper culture integration, broader HR scope (not just hiring), slower pace, more strategic work. Most experienced recruiters recommend starting in a consultancy to build speed, sourcing skills, and resilience. After 2–3 years, moving in-house gives you the full employee lifecycle perspective.',
    addedBy: 'Career Pathways Trainer',
  },
  {
    question: 'What is salary benchmarking and how is it done?',
    answer: 'Salary benchmarking is the process of comparing your organisation\'s compensation packages against market rates for equivalent roles. Steps: (1) Define the role clearly — title, responsibilities, level, (2) Gather data from salary surveys (Mercer, Aon Hewitt, Korn Ferry), job boards (LinkedIn Salary Insights, Glassdoor), and peer network conversations, (3) Map your pay bands against P25, P50, and P75 market percentiles, (4) Review annually and adjust to remain competitive.',
    addedBy: 'Compensation & Benefits Trainer',
  },
  {
    question: 'What is XRay search in recruitment sourcing?',
    answer: 'X-Ray search uses Google to search inside a specific website. Example: site:linkedin.com/in "HR manager" "Pune" "Tata" retrieves LinkedIn profiles matching those terms without a paid LinkedIn subscription. You can also X-Ray Naukri: site:naukri.com "Java developer" "Hyderabad" "6 years". X-Ray search is a powerful free sourcing tool that every recruiter should master.',
    addedBy: 'Advanced Sourcing Trainer',
  },
  {
    question: 'How do you reduce unconscious bias in the hiring process?',
    answer: 'Practical steps: (1) Use structured, competency-based interview scorecards for all candidates, (2) Blind resume screening — remove names, photos, and universities in the first round, (3) Diverse interview panels — avoid all-male or all-same-demographic panels, (4) Standardise the candidate briefing — give everyone the same information about the role, (5) Require evidence-based debrief decisions ("The data shows X") instead of "gut feel". Unconscious bias leads to homogeneous teams and higher attrition.',
    addedBy: 'DEI & Inclusion Trainer',
  },
  {
    question: 'What are the key stages of the end-to-end recruitment process?',
    answer: 'The full-cycle recruitment process has 9 stages: (1) Job requisition approval, (2) Job description creation, (3) Sourcing strategy selection (job boards, social, referrals, agencies), (4) Candidate sourcing & screening, (5) Telephonic/video pre-screening, (6) Technical/panel interviews, (7) Reference checks & background verification, (8) Offer negotiation & issuance, (9) Onboarding coordination. A recruiter who masters all 9 stages is a true 360° recruiter.',
    addedBy: 'End-to-End Recruitment Trainer',
  },
]

async function seed() {
  await client.connect()
  console.log('Connected to DB')

  // Reset sequence
  await client.query(`SELECT setval(
    pg_get_serial_sequence('knowledge_items', 'question_id'),
    (SELECT COALESCE(MAX(question_id), 0) FROM knowledge_items) + 1,
    false
  )`)

  let inserted = 0
  let skipped = 0
  const today = new Date().toISOString().slice(0, 10)

  for (const item of knowledgeItems) {
    const exists = await client.query(
      `SELECT question_id FROM knowledge_items WHERE question = $1 LIMIT 1`,
      [item.question]
    )
    if (exists.rows.length > 0) {
      console.log(`  Skipping: "${item.question.slice(0, 60)}..."`)
      skipped++
      continue
    }
    await client.query(
      `INSERT INTO knowledge_items (question, answer, date, added_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [item.question, item.answer, today, item.addedBy]
    )
    inserted++
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`)
  await client.end()
}

seed().catch(err => { console.error(err); process.exit(1) })
