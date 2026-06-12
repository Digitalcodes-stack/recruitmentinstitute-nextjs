// Run: node seed-community.js
const { Client } = require('pg')

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'recruitmentinstitute',
  user: 'postgres',
  password: 'postgres',
})

const seedUsers = [
  { name: 'Priya Sharma',   email: 'priya.sharma@seed.com' },
  { name: 'Ravi Kulkarni',  email: 'ravi.kulkarni@seed.com' },
  { name: 'Anita Desai',    email: 'anita.desai@seed.com' },
  { name: 'Mohit Verma',    email: 'mohit.verma@seed.com' },
  { name: 'Sneha Joshi',    email: 'sneha.joshi@seed.com' },
  { name: 'Akash Patel',    email: 'akash.patel@seed.com' },
  { name: 'Divya Nair',     email: 'divya.nair@seed.com' },
  { name: 'Suresh Rao',     email: 'suresh.rao@seed.com' },
]

const questions = [
  {
    userIdx: 0,
    question: 'What are the most effective Boolean search strings for sourcing IT recruiters on LinkedIn?',
    answers: [
      { userIdx: 1, answer: 'Use strings like: "talent acquisition" OR "technical recruiter" AND ("IT" OR "software") -job -apply. Combine with location filters and LinkedIn\'s "Open to Work" badge for better targeting.' },
      { userIdx: 2, answer: 'I add keywords like ATS, sourcing, naukri, boolean to narrow it down. Also use the X-Ray search on Google: site:linkedin.com/in "technical recruiter" "Pune"' },
    ]
  },
  {
    userIdx: 1,
    question: 'How do you handle salary negotiation when a candidate expects 40% hike but the client budget is only 20%?',
    answers: [
      { userIdx: 0, answer: 'Bridge the gap by highlighting non-monetary benefits — faster appraisal cycles, learning opportunities, brand value. Also explore if variable pay or joining bonus can make up the difference.' },
      { userIdx: 3, answer: 'Always qualify the candidate\'s "expected CTC" early. If there\'s a gap, involve the hiring manager to discuss flexibility before the offer stage — don\'t let it blow up at the end.' },
    ]
  },
  {
    userIdx: 2,
    question: 'What is the difference between talent acquisition and recruitment, and why does it matter?',
    answers: [
      { userIdx: 4, answer: 'Recruitment is transactional — filling an open role. Talent acquisition is strategic — building pipelines, employer branding, and long-term workforce planning. The distinction matters when you\'re pitching your role in an HR interview.' },
      { userIdx: 1, answer: 'TA looks at future needs too. A TA specialist builds relationships with passive candidates even when there are no open roles. Recruiter usually acts on reactive requisitions.' },
    ]
  },
  {
    userIdx: 3,
    question: 'How do you write a strong cold outreach message to a passive candidate on LinkedIn?',
    answers: [
      { userIdx: 5, answer: 'Keep it under 4 lines. Lead with what makes the role interesting for THEM, not what your company needs. Example: "Hi [Name], your background in backend scaling at [Company] caught my eye — we\'re building something similar at [Startup]. Would love to share details if you\'re open to a conversation."' },
      { userIdx: 0, answer: 'Personalisation is key. Reference their specific project, award, or post. Generic InMails get ignored. Mention a mutual connection or shared interest when possible.' },
    ]
  },
  {
    userIdx: 4,
    question: 'What ATS platforms are most commonly used by Indian companies, and which one should I learn first?',
    answers: [
      { userIdx: 2, answer: 'In India, the most common ones are Keka, Darwinbox, GreytHR, and Zoho Recruit for mid-market. For enterprise, Workday and SAP SuccessFactors are popular. I\'d recommend starting with Zoho Recruit — it has a free tier and is widely used.' },
      { userIdx: 6, answer: 'Naukri RMS (iRecruit) is also very popular among staffing firms. If you\'re targeting a specific company, check their LinkedIn job posts — they often mention the ATS in the JD.' },
    ]
  },
  {
    userIdx: 5,
    question: 'How should I prepare for my first telephonic screening call as a recruiter?',
    answers: [
      { userIdx: 3, answer: 'Have a structured script: introduce yourself and company → verify current role and notice period → check current and expected CTC → briefly pitch the role → gauge interest level → close with next steps. Practice it 10 times before your first real call.' },
      { userIdx: 7, answer: 'Always do your homework on the JD before the call. If you can\'t explain the role clearly, the candidate loses confidence. Also keep a pen and paper ready — don\'t rely only on typing during the call.' },
    ]
  },
  {
    userIdx: 6,
    question: 'What is the notice period buyout process and how do I explain it to a hiring manager?',
    answers: [
      { userIdx: 0, answer: 'Notice buyout means the new company pays the candidate\'s equivalent salary for their notice period so they can join early. Not all companies offer this — check the client\'s policy first before promising it to a candidate.' },
      { userIdx: 4, answer: 'Frame it to the hiring manager as an investment: if the role is critical, paying 1-2 months salary to get a strong candidate 60 days earlier is often worth it. Have the numbers ready when you pitch it.' },
    ]
  },
  {
    userIdx: 7,
    question: 'How do I calculate the cost-per-hire metric and why is it important for HR reporting?',
    answers: [
      { userIdx: 1, answer: 'Cost-per-hire = (Internal recruiting costs + External recruiting costs) / Total hires in a period. Include job portal fees, agency commissions, referral bonuses, recruiter salaries, and interview time. It\'s key for budget planning and showing HR ROI.' },
    ]
  },
  {
    userIdx: 0,
    question: 'What questions should I never ask during a candidate interview, and why?',
    answers: [
      { userIdx: 5, answer: 'Avoid questions about marital status, religion, caste, pregnancy plans, or age — these are discriminatory and can expose the company to legal liability. Stick to competency-based questions tied directly to the job requirements.' },
      { userIdx: 2, answer: 'Also avoid leading questions like "You\'re okay with night shifts, right?" which put the candidate in an awkward spot. Ask openly: "This role involves rotational shifts — is that something that works for you?"' },
    ]
  },
  {
    userIdx: 3,
    question: 'How do you build a talent pipeline for roles that have high attrition?',
    answers: [
      { userIdx: 6, answer: 'Keep warm leads in your ATS even after a role closes. Tag past rejected candidates by "good fit for future" and reconnect every 3-6 months. Build relationships on LinkedIn with people in that function before the vacancy opens.' },
      { userIdx: 7, answer: 'Work with the hiring manager to understand WHY attrition is high. If the role has real issues (bad manager, unrealistic targets), no pipeline will fix it. Solve the root cause or you\'re just refilling a leaky bucket.' },
    ]
  },
  {
    userIdx: 5,
    question: 'What is the STAR method and how do I use it to assess candidates in a behavioural interview?',
    answers: [
      { userIdx: 0, answer: 'STAR = Situation, Task, Action, Result. Ask: "Tell me about a time you handled a difficult stakeholder." Then probe each part: What was the situation? What was your role? What did you do? What was the result? It gives you structured, comparable data across candidates.' },
    ]
  },
  {
    userIdx: 6,
    question: 'How do I explain a gap in employment on my CV when applying for HR roles?',
    answers: [
      { userIdx: 3, answer: 'Be honest and frame it positively. If you upskilled during the gap, lead with that. Example: "I took a planned break to complete a recruitment certification and support family commitments. I\'m now fully focused and ready to contribute." Recruiters appreciate honesty far more than weak excuses.' },
      { userIdx: 1, answer: 'Keep the explanation brief in the CV — just a line. Save the detail for the interview. Most gaps of under 12 months are completely acceptable in today\'s market, especially post-2020.' },
    ]
  },
  {
    userIdx: 2,
    question: 'What is the role of an HR generalist vs an HR business partner, and which path should I choose?',
    answers: [
      { userIdx: 4, answer: 'An HR generalist handles end-to-end HR operations: hiring, payroll, compliance, L&D, exits. An HRBP is more strategic — they partner with business leaders to align people strategy with business goals. If you enjoy operations, start as a generalist. If you love strategy and consulting, aim for HRBP.' },
    ]
  },
  {
    userIdx: 7,
    question: 'How do you handle a candidate who accepts an offer but doesn\'t show up on the joining date?',
    answers: [
      { userIdx: 5, answer: 'This is called a "no-show" and it\'s every recruiter\'s nightmare. Prevent it by: staying in touch between offer and joining, sending a pre-joining engagement email, checking in on the last working day at the previous company, and having a backup candidate ready for critical roles.' },
      { userIdx: 2, answer: 'Build rapport during the notice period. A weekly WhatsApp check-in goes a long way. If you sense the candidate is wavering, loop in the hiring manager early — a call from a future manager can seal the deal better than anything you can do.' },
    ]
  },
  {
    userIdx: 4,
    question: 'What are the key differences between working in an HR consultancy vs an in-house HR team?',
    answers: [
      { userIdx: 0, answer: 'In a consultancy: fast pace, multiple clients, strong sourcing skills, performance pressure, great exposure to different industries. In-house: deeper relationships, broader HR scope (not just recruitment), more stability, slower career progression sometimes. Most experienced recruiters recommend starting in a consultancy to build speed and sourcing skills.' },
      { userIdx: 6, answer: 'I started in consultancy and moved in-house after 2 years. The consultancy experience was invaluable — I learned to manage candidates, clients, timelines, and rejections all at once. In-house feels slower but you understand the full employee lifecycle.' },
    ]
  },
]

async function seed() {
  await client.connect()
  console.log('Connected to DB')

  let insertedUsers = 0
  let insertedQuestions = 0
  let insertedAnswers = 0

  // Upsert seed users
  const userIds = []
  for (const u of seedUsers) {
    const res = await client.query(
      `INSERT INTO registers (name, email, password, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [u.name, u.email, 'seed-placeholder']
    )
    userIds.push(res.rows[0].id)
    insertedUsers++
  }
  console.log(`Upserted ${insertedUsers} seed users`)

  // Reset sequences to avoid primary key conflicts
  await client.query(`SELECT setval('questions_id_seq', (SELECT COALESCE(MAX(id),0) FROM questions) + 1, false)`)
  await client.query(`SELECT setval('answers_id_seq',   (SELECT COALESCE(MAX(id),0) FROM answers)   + 1, false)`)
  await client.query(`SELECT setval('registers_id_seq', (SELECT COALESCE(MAX(id),0) FROM registers) + 1, false)`)

  // Insert questions + answers
  for (const q of questions) {
    const userId = userIds[q.userIdx]
    const created = new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)) // random within last 60 days

    // Skip if exact question already exists
    const exists = await client.query(
      `SELECT id FROM questions WHERE question = $1 LIMIT 1`,
      [q.question]
    )
    if (exists.rows.length > 0) {
      console.log(`  Skipping existing question: "${q.question.slice(0, 60)}..."`)
      continue
    }

    const qRes = await client.query(
      `INSERT INTO questions (user_id, question, created_at) VALUES ($1, $2, $3) RETURNING id`,
      [userId, q.question, created]
    )
    const questionId = qRes.rows[0].id
    insertedQuestions++

    for (const a of q.answers) {
      const aUserId = userIds[a.userIdx]
      const aCreated = new Date(created.getTime() + Math.floor(Math.random() * 48 * 60 * 60 * 1000))
      await client.query(
        `INSERT INTO answers (question_id, user_id, answer, is_approved, created_at) VALUES ($1, $2, $3, $4, $5)`,
        [questionId, aUserId, a.answer, true, aCreated]
      )
      insertedAnswers++
    }
  }

  console.log(`Inserted ${insertedQuestions} questions, ${insertedAnswers} answers`)
  await client.end()
  console.log('Done!')
}

seed().catch(err => { console.error(err); process.exit(1) })
