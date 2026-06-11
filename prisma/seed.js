/**
 * Recruitment Institute — Database Seed
 * Run: node prisma/seed.js
 */
const { Client } = require('pg')
const bcrypt = require('bcryptjs')

const DB = 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute'

async function run() {
  const client = new Client({ connectionString: DB })
  await client.connect()
  console.log('🌱  Connected. Seeding database…\n')

  const now = new Date().toISOString()
  const hash = (p) => bcrypt.hash(p, 10)

  // helper: try-insert each row, skip on duplicate/FK conflict, report real errors
  async function ins(table, cols, rows) {
    let inserted = 0
    for (const row of rows) {
      const vals = cols.map((c) => row[c] !== undefined ? row[c] : null)
      const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ')
      const colList = cols.map((c) => `"${c}"`).join(', ')
      try {
        await client.query(
          `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          vals
        )
        inserted++
      } catch (e) {
        console.warn(`   ⚠  ${table}: ${e.message.split('\n')[0]}`)
      }
    }
    return inserted
  }

  // ── 1. STUDENTS ───────────────────────────────────────────────────────────
  const sp = await hash('Student@123')
  let n = await ins('login_student', ['name','contact','email','password','status','updated_at'], [
    { name:'Priya Sharma',  contact:'9876543210', email:'priya.sharma@gmail.com',  password:sp, status:true,  updated_at:now },
    { name:'Rahul Verma',   contact:'9876543211', email:'rahul.verma@gmail.com',   password:sp, status:true,  updated_at:now },
    { name:'Anjali Singh',  contact:'9876543212', email:'anjali.singh@gmail.com',  password:sp, status:true,  updated_at:now },
    { name:'Rohan Gupta',   contact:'9876543213', email:'rohan.gupta@gmail.com',   password:sp, status:false, updated_at:now },
    { name:'Sneha Patel',   contact:'9876543214', email:'sneha.patel@gmail.com',   password:sp, status:true,  updated_at:now },
    { name:'Amit Joshi',    contact:'9876543215', email:'amit.joshi@gmail.com',    password:sp, status:true,  updated_at:now },
    { name:'Kavita Nair',   contact:'9876543216', email:'kavita.nair@gmail.com',   password:sp, status:true,  updated_at:now },
    { name:'Deepak Mehta',  contact:'9876543217', email:'deepak.mehta@gmail.com',  password:sp, status:false, updated_at:now },
  ])
  console.log(`✅  Students:       ${n} inserted`)

  // ── 2. MEMBERSHIPS ────────────────────────────────────────────────────────
  const mp = await hash('Member@123')
  n = await ins('login_membership', ['name','contact','email','password','status','updated_at'], [
    { name:'Vijay Reddy',   contact:'9811111101', email:'vijay.reddy@gmail.com',   password:mp, status:true,  updated_at:now },
    { name:'Neha Kapoor',   contact:'9811111102', email:'neha.kapoor@gmail.com',   password:mp, status:true,  updated_at:now },
    { name:'Sanjay Mishra', contact:'9811111103', email:'sanjay.mishra@gmail.com', password:mp, status:true,  updated_at:now },
    { name:'Pooja Tiwari',  contact:'9811111104', email:'pooja.tiwari@gmail.com',  password:mp, status:false, updated_at:now },
    { name:'Arjun Bose',    contact:'9811111105', email:'arjun.bose@gmail.com',    password:mp, status:true,  updated_at:now },
  ])
  console.log(`✅  Memberships:    ${n} inserted`)

  // ── 3. CANDIDATES (extra records) ────────────────────────────────────────
  const cp = await hash('Cand@123')
  n = await ins('candidate_login', ['name','mobile','email','password','gender','city','state','course_select','accept_signin','updated_at'], [
    { name:'Ravi Kumar',  mobile:'9900000001', email:'ravi.kumar@gmail.com',  password:cp, gender:'Male',   city:'Mumbai', state:'Maharashtra', course_select:'Degree',        accept_signin:1, updated_at:now },
    { name:'Meena Rao',   mobile:'9900000002', email:'meena.rao@gmail.com',   password:cp, gender:'Female', city:'Pune',   state:'Maharashtra', course_select:'Certification', accept_signin:0, updated_at:now },
    { name:'Kiran Desai', mobile:'9900000003', email:'kiran.desai@gmail.com', password:cp, gender:'Male',   city:'Delhi',  state:'Delhi',       course_select:'Corporate',     accept_signin:1, updated_at:now },
    { name:'Swati More',  mobile:'9900000004', email:'swati.more@gmail.com',  password:cp, gender:'Female', city:'Nagpur', state:'Maharashtra', course_select:'Entrepreneur',  accept_signin:1, updated_at:now },
    { name:'Ajay Patil',  mobile:'9900000005', email:'ajay.patil@gmail.com',  password:cp, gender:'Male',   city:'Nashik', state:'Maharashtra', course_select:'Degree',        accept_signin:0, updated_at:now },
  ])
  console.log(`✅  Candidates:     ${n} inserted`)

  // ── 4. EXPERTS ───────────────────────────────────────────────────────────
  n = await ins('expert', ['title','prof','course_category_id'], [
    { title:'Dr. Anand Kulkarni',   prof:'Senior HR Consultant',        course_category_id:1 },
    { title:'Ms. Rekha Iyer',       prof:'Talent Acquisition Expert',   course_category_id:1 },
    { title:'Mr. Suresh Bansal',    prof:'Certified Recruiter Trainer', course_category_id:2 },
    { title:'Ms. Priti Shah',       prof:'L&D Specialist',              course_category_id:2 },
    { title:'Mr. Rohit Malhotra',   prof:'Startup Mentor & Coach',      course_category_id:3 },
    { title:'Ms. Divya Nambiar',    prof:'Entrepreneur & HR Leader',    course_category_id:3 },
    { title:'Mr. Vivek Srivastava', prof:'Corporate Trainer',           course_category_id:4 },
    { title:'Ms. Snehal Joshi',     prof:'Organizational Psychologist', course_category_id:4 },
  ])
  console.log(`✅  Experts:        ${n} inserted`)

  // ── 5. COURSE FEES ────────────────────────────────────────────────────────
  n = await ins('fees', ['course','course_category_id','fees','discount','subtotal','final_total','coupon_code'], [
    { course:'MBA in Human Resource Management',       course_category_id:1, fees:95000, discount:10000, subtotal:85000, final_total:85000, coupon_code:'DEGREE10' },
    { course:'BBA in Recruitment & HR',               course_category_id:1, fees:65000, discount:5000,  subtotal:60000, final_total:60000, coupon_code:null },
    { course:'PGDM Human Resources',                  course_category_id:1, fees:75000, discount:7500,  subtotal:67500, final_total:67500, coupon_code:'PGDM10'  },
    { course:'Professional Recruitment Certification',course_category_id:2, fees:18000, discount:2000,  subtotal:16000, final_total:16000, coupon_code:'CERT10'  },
    { course:'HR Analytics Certification',            course_category_id:2, fees:12000, discount:1500,  subtotal:10500, final_total:10500, coupon_code:null       },
    { course:'Talent Acquisition Certification',      course_category_id:2, fees:15000, discount:0,     subtotal:15000, final_total:15000, coupon_code:null       },
    { course:'Entrepreneurship & HR Bootcamp',        course_category_id:3, fees:25000, discount:3000,  subtotal:22000, final_total:22000, coupon_code:'ENTRO15' },
    { course:'Business Leadership Program',           course_category_id:3, fees:30000, discount:5000,  subtotal:25000, final_total:25000, coupon_code:null       },
    { course:'Corporate Recruitment Training',        course_category_id:4, fees:20000, discount:2500,  subtotal:17500, final_total:17500, coupon_code:'CORP10'  },
    { course:'Mass Hiring & Bulk Recruitment',        course_category_id:4, fees:22000, discount:2000,  subtotal:20000, final_total:20000, coupon_code:null       },
  ])
  console.log(`✅  Course Fees:    ${n} inserted`)

  // ── 6. COURSE REVIEWS ─────────────────────────────────────────────────────
  n = await ins('reviews', ['title','description','rating','review','course_category_id'], [
    { title:'Excellent HR curriculum',        description:'Very in-depth degree program',       rating:5, review:'Best investment for my HR career',             course_category_id:1 },
    { title:'Practical & industry relevant',  description:'Loved the real-world case studies',  rating:4, review:'Highly recommend for HR roles',               course_category_id:1 },
    { title:'Fast-track certification',       description:'Completed in just 3 months',         rating:5, review:'Got placed within a week of completing',       course_category_id:2 },
    { title:'Good content, could be shorter', description:'Some modules felt repetitive',       rating:3, review:'Overall good value for the fee',              course_category_id:2 },
    { title:'Changed my career path',         description:'From employee to founder!',          rating:5, review:'The mentorship was outstanding',              course_category_id:3 },
    { title:'Great networking opportunities', description:'Met great peers and mentors',        rating:4, review:'Would attend again',                          course_category_id:3 },
    { title:'Perfect for corporate teams',    description:'Enrolled 5 employees together',      rating:5, review:'All of them upskilled significantly',         course_category_id:4 },
    { title:'Trainer was very knowledgeable', description:'Interactive sessions all through',   rating:5, review:'Vivek sir made learning fun',                 course_category_id:4 },
  ])
  console.log(`✅  Reviews:        ${n} inserted`)

  // ── 7. FAQs ───────────────────────────────────────────────────────────────
  n = await ins('faq', ['question','answer','course_category_id'], [
    { question:'What is the duration of the Degree program?',           answer:'The degree program is 2–3 years depending on the selected course.',                course_category_id:1    },
    { question:'Is the Degree program recognized by UGC?',              answer:'Yes, our programs are offered with UGC-recognized universities.',                  course_category_id:1    },
    { question:'How do I enroll in a Certification course?',            answer:'Enroll online via our website or by visiting our nearest centre.',                 course_category_id:2    },
    { question:'What certificate do I receive after completion?',       answer:'You receive an industry-recognised certificate signed by our expert panel.',       course_category_id:2    },
    { question:'Do I need work experience for the Entrepreneur track?', answer:'No, this track is open to freshers and professionals alike.',                      course_category_id:3    },
    { question:'Will I get startup mentoring?',                         answer:'Yes, every student gets 1-on-1 sessions with a startup veteran.',                  course_category_id:3    },
    { question:'Can companies enroll multiple employees?',              answer:'Yes. We offer corporate batch pricing with dedicated trainers.',                    course_category_id:4    },
    { question:'Is there a corporate package discount?',                answer:'Yes, groups of 5+ get up to 20% off on the standard fee.',                        course_category_id:4    },
    { question:'Are classes online or offline?',                        answer:'We offer both — online live sessions and in-person classroom training.',           course_category_id:null },
    { question:'What is the refund policy?',                            answer:'Full refund within 7 days. 50% refund up to 15 days. No refund thereafter.',      course_category_id:null },
  ])
  console.log(`✅  FAQs:           ${n} inserted`)

  // ── 8. FAQ CATEGORIES ─────────────────────────────────────────────────────
  n = await ins('faq_category', ['title'], [
    { title:'Admissions' }, { title:'Fees & Payments' }, { title:'Courses' },
    { title:'Placements' }, { title:'Certifications' },
  ])
  console.log(`✅  FAQ Categories: ${n} inserted`)

  // ── 9. KNOWLEDGE BASE ─────────────────────────────────────────────────────
  n = await ins('knowledge_items', ['question','answer','added_by','date','updated_at'], [
    { question:'What is Boolean Search in recruitment?',         answer:'Boolean search uses AND, OR, NOT operators to refine candidate searches on LinkedIn and job portals.',                                     added_by:'Admin', date:'2024-01-10', updated_at:now },
    { question:'What is an ATS (Applicant Tracking System)?',   answer:'ATS automates hiring — parsing resumes, scheduling interviews, and tracking candidates through the pipeline.',                             added_by:'Admin', date:'2024-01-15', updated_at:now },
    { question:'How do you calculate time-to-hire?',            answer:'Time-to-hire = days from job opening to offer accepted. Industry average is 23–38 days.',                                                  added_by:'Admin', date:'2024-02-01', updated_at:now },
    { question:'What is the STAR interview method?',            answer:'STAR = Situation, Task, Action, Result. It structures behavioral questions for consistent candidate evaluation.',                           added_by:'Admin', date:'2024-02-10', updated_at:now },
    { question:'What is employer branding?',                    answer:'How a company markets itself to potential employees — culture, benefits, values, and reputation.',                                          added_by:'Admin', date:'2024-03-01', updated_at:now },
    { question:'What is the difference between CV and resume?', answer:'A CV is a comprehensive career document (2+ pages). A resume is a concise 1-page summary tailored to a specific role.',                   added_by:'Admin', date:'2024-03-15', updated_at:now },
    { question:'What is headhunting?',                          answer:'Proactively identifying and approaching high-calibre passive candidates who are not actively job-hunting.',                                 added_by:'Admin', date:'2024-04-01', updated_at:now },
    { question:'How to write an effective job description?',    answer:'Include: job title, responsibilities, required qualifications, skills, compensation range, and company culture details.',                  added_by:'Admin', date:'2024-04-15', updated_at:now },
  ])
  console.log(`✅  Knowledge Base: ${n} inserted`)

  // ── 10. Q&A ANSWERS ───────────────────────────────────────────────────────
  const qRes = await client.query('SELECT id FROM questions ORDER BY id')
  const uRes = await client.query('SELECT id FROM registers ORDER BY id LIMIT 3')
  if (qRes.rows.length && uRes.rows.length >= 2) {
    const uid1 = uRes.rows[0].id
    const uid2 = uRes.rows[1].id
    const qids = qRes.rows.map((r) => r.id)
    n = await ins('answers', ['question_id','user_id','answer'], [
      { question_id:qids[0], user_id:uid2, answer:'A talent acquisition interview is a structured meeting to assess whether a candidate fits a role and company culture. It focuses on skills, experience, and cultural alignment.' },
      { question_id:qids[1]??qids[0], user_id:uid2, answer:'Talent acquisition is strategic — it builds long-term pipelines and workforce planning. Recruiting is tactical — filling open positions quickly.' },
      { question_id:qids[2]??qids[0], user_id:uid2, answer:'Strong communication, active listening, data analysis, proficiency in ATS tools, and ability to build relationships with both candidates and hiring managers.' },
      { question_id:qids[3]??qids[0], user_id:uid1, answer:'Reflect on the specific case, identify what broke down (timeline, assessment, or communication), and explain the corrective action you took.' },
      { question_id:qids[4]??qids[0], user_id:uid2, answer:'I look for relevant experience, employment gaps, career progression consistency, keyword alignment with the JD, and formatting quality.' },
    ])
    console.log(`✅  Q&A Answers:    ${n} inserted`)
  }

  // ── 11. CONTACT SUBMISSIONS ───────────────────────────────────────────────
  n = await ins('tbl_contactus', ['name','email','mobile','message'], [
    { name:'Ritika Sharma',   email:'ritika.sharma@gmail.com',   mobile:'9823001001', message:'I would like to know more about the Corporate Training programs. Please share the brochure.' },
    { name:'Nikhil Desai',    email:'nikhil.desai@gmail.com',    mobile:'9823001002', message:'What are the batch start dates for the Certification courses this month?' },
    { name:'Pooja Wagh',      email:'pooja.wagh@gmail.com',      mobile:'9823001003', message:'Can I get a scholarship for the Degree program? I am a fresh graduate.' },
    { name:'Arun Thosar',     email:'arun.thosar@gmail.com',     mobile:'9823001004', message:'We are a company of 50 employees. Do you offer bulk training packages?' },
    { name:'Shalini Gaikwad', email:'shalini.gaikwad@gmail.com', mobile:'9823001005', message:'I attended your free webinar last week. How do I enroll in the full course?' },
  ])
  console.log(`✅  Contacts:       ${n} inserted`)

  // ── 12. SUBSCRIBERS ───────────────────────────────────────────────────────
  n = await ins('subscribe_email', ['email','ip_address','status'], [
    { email:'newsletter1@gmail.com',       ip_address:'103.21.55.1',  status:true  },
    { email:'newsletter2@gmail.com',       ip_address:'103.21.55.2',  status:true  },
    { email:'newsletter3@gmail.com',       ip_address:'103.21.55.3',  status:true  },
    { email:'newsletter4@gmail.com',       ip_address:'103.21.55.4',  status:false },
    { email:'newsletter5@gmail.com',       ip_address:'103.21.55.5',  status:true  },
    { email:'hr.professional@outlook.com', ip_address:'103.21.55.6',  status:true  },
    { email:'talent.seeker@yahoo.com',     ip_address:'103.21.55.7',  status:true  },
    { email:'recruiter.india@gmail.com',   ip_address:'103.21.55.8',  status:true  },
    { email:'corporate.hr@gmail.com',      ip_address:'103.21.55.9',  status:false },
    { email:'degree.aspirant@gmail.com',   ip_address:'103.21.55.10', status:true  },
  ])
  console.log(`✅  Subscribers:    ${n} inserted`)

  // ── 13. TESTIMONIALS ──────────────────────────────────────────────────────
  n = await ins('testimonials', ['author','title','description','rating','status','updated_at'], [
    { author:'Priya Sharma', title:'Life-changing experience!',          description:'The Recruitment Institute completely transformed my career. I went from zero HR knowledge to landing a job at a top MNC within 3 months.',        rating:5, status:true,  updated_at:now },
    { author:'Rahul Verma',  title:'Best certification course in India', description:'I have done multiple online courses but nothing compares to the quality of content and mentorship here. The practical training is outstanding.',   rating:5, status:true,  updated_at:now },
    { author:'Anjali Singh', title:'Excellent faculty & support',        description:'The faculty is very supportive and always available for doubts. The placement assistance helped me get my first corporate HR role.',               rating:4, status:true,  updated_at:now },
    { author:'Deepak Mehta', title:'Good value for money',               description:'Compared to other institutes, the fee is very reasonable and the quality is top-notch. Highly recommend for freshers.',                          rating:4, status:true,  updated_at:now },
    { author:'Sneha Patel',  title:'Superb entrepreneurship program',    description:'I started my own HR consultancy 6 months after the Entrepreneur track. The program gave me confidence and practical tools to launch on Day 1.',   rating:5, status:true,  updated_at:now },
    { author:'Vivek Singh',  title:'Corporate batch was excellent',      description:'Our entire L&D team attended the corporate training. The trainer was energetic and the content was highly relevant to our industry.',            rating:5, status:true,  updated_at:now },
    { author:'Nisha Jain',   title:'Great online learning experience',   description:'Live sessions are well-structured and interactive. Even online, I felt like I was in a classroom. The study materials are very comprehensive.',    rating:4, status:false, updated_at:now },
    { author:'Karan Mehta',  title:'Would recommend to everyone',        description:'This institute genuinely cares about student outcomes. They followed up even 2 months after the course to check on my placement status.',         rating:5, status:true,  updated_at:now },
  ])
  console.log(`✅  Testimonials:   ${n} inserted`)

  // ── 14. SERVICES ──────────────────────────────────────────────────────────
  n = await ins('services', ['title','title_url','description','status','sort_order','updated_at'], [
    { title:'Recruitment Training',   title_url:'recruitment-training',   description:'Comprehensive training for aspiring recruiters. Learn sourcing, screening, and closing techniques from active industry professionals.',  status:true, sort_order:1, updated_at:now },
    { title:'Corporate HR Solutions', title_url:'corporate-hr-solutions', description:'End-to-end HR consulting for corporates — workforce planning, mass hiring campaigns, and L&D programs tailored to your team.',         status:true, sort_order:2, updated_at:now },
    { title:'Placement Assistance',   title_url:'placement-assistance',   description:'We connect trained candidates with top recruiters across India. Our placement cell has an 85%+ success rate since inception.',         status:true, sort_order:3, updated_at:now },
    { title:'Online Certification',   title_url:'online-certification',   description:'Flexible online certification courses that fit your schedule. Industry-recognized certificates to boost your resume instantly.',        status:true, sort_order:4, updated_at:now },
    { title:'HR Consulting',          title_url:'hr-consulting',          description:'Strategic HR consulting for startups and SMEs — hiring strategy, compensation benchmarking, and policy creation.',                    status:true, sort_order:5, updated_at:now },
    { title:'Interview Preparation',  title_url:'interview-preparation',  description:'Intensive interview prep workshops: mock interviews, body language coaching, and domain-specific question banks.',                    status:true, sort_order:6, updated_at:now },
  ])
  console.log(`✅  Services:       ${n} inserted`)

  // ── 15. ABOUT US — add more sections ──────────────────────────────────────
  await client.query(
    `UPDATE "about_us" SET "title"=$1, "title1"=$2 WHERE "about_us_id"=5`,
    ['Welcome to The Recruitment Institute', "India's Premier HR & Recruitment Training Institute"]
  )
  n = await ins('about_us', ['title','title1','description','updated_at'], [
    { title:'Our Mission', title1:'Empowering Every Talent', description:'Our mission is to democratize recruitment knowledge across India. We believe every individual deserves world-class training. With 10,000+ graduates, we are building the largest HR talent community in India.', updated_at:now },
    { title:'Why Choose Us?', title1:'10,000+ Placements | 98% Satisfaction', description:'Recruitment Institute stands apart because of our practitioner-led curriculum, industry partnerships, and lifetime placement support. Our trainers are active HR professionals — not just academics.', updated_at:now },
  ])
  console.log(`✅  About Us:       updated + ${n} new sections`)

  // ── 16. COURSE LEADS ──────────────────────────────────────────────────────
  n = await ins('course_leads', ['name','lname','email','contact','flag'], [
    { name:'Sachin', lname:'More',   email:'sachin.more@gmail.com',   contact:'9922001001', flag:'new'       },
    { name:'Dipali', lname:'Patil',  email:'dipali.patil@gmail.com',  contact:'9922001002', flag:'contacted' },
    { name:'Rajesh', lname:'Kumar',  email:'rajesh.kumar@gmail.com',  contact:'9922001003', flag:'enrolled'  },
    { name:'Sunita', lname:'Joshi',  email:'sunita.joshi@gmail.com',  contact:'9922001004', flag:'new'       },
    { name:'Mahesh', lname:'Singh',  email:'mahesh.singh@gmail.com',  contact:'9922001005', flag:'contacted' },
  ])
  console.log(`✅  Course Leads:   ${n} inserted`)

  // ── 17. FEES LEADS ────────────────────────────────────────────────────────
  n = await ins('fees_leads', ['name','lname','email','contact','flag'], [
    { name:'Amol',   lname:'Deshpande', email:'amol.deshpande@gmail.com',  contact:'9933001001', flag:'new'     },
    { name:'Kavita', lname:'Sharma',    email:'kavita.sharma2@gmail.com',  contact:'9933001002', flag:'paid'    },
    { name:'Nitin',  lname:'Kulkarni',  email:'nitin.kulkarni@gmail.com',  contact:'9933001003', flag:'pending' },
  ])
  console.log(`✅  Fees Leads:     ${n} inserted`)

  // ── FINAL COUNT ───────────────────────────────────────────────────────────
  console.log('\n📊  Final row counts:')
  const tables = [
    ['Students',        'login_student'],
    ['Memberships',     'login_membership'],
    ['Candidates',      'candidate_login'],
    ['Experts',         'expert'],
    ['Course Fees',     'fees'],
    ['Reviews',         'reviews'],
    ['FAQs',            'faq'],
    ['FAQ Categories',  'faq_category'],
    ['Knowledge Base',  'knowledge_items'],
    ['Q&A Answers',     'answers'],
    ['Contacts',        'tbl_contactus'],
    ['Subscribers',     'subscribe_email'],
    ['Testimonials',    'testimonials'],
    ['Services',        'services'],
    ['About Sections',  'about_us'],
    ['Course Leads',    'course_leads'],
    ['Fees Leads',      'fees_leads'],
    ['Courses',         'courses'],
    ['Course Categories','course_category'],
    ['Q&A Questions',   'questions'],
    ['Blog Posts',      'blog'],
  ]
  for (const [label, table] of tables) {
    const r = await client.query(`SELECT count(*) FROM "${table}"`)
    console.log(`   ${label.padEnd(20)} ${r.rows[0].count}`)
  }

  await client.end()
  console.log('\n✨  Seed complete!')
}

run().catch((e) => { console.error('❌  Seed failed:', e.message); process.exit(1) })
