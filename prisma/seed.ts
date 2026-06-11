/**
 * Recruitment Institute — Database Seed
 * Inserts realistic sample data into all empty tables.
 * Safe to re-run: uses upsert / skipDuplicates where possible.
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Seeding database…\n')

  // ─── 1. STUDENTS ─────────────────────────────────────────────────────────
  const studentPw = await bcrypt.hash('Student@123', 10)
  await prisma.student.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Priya Sharma',   email: 'priya.sharma@gmail.com',   contact: '9876543210', password: studentPw, isActive: true },
      { name: 'Rahul Verma',    email: 'rahul.verma@gmail.com',    contact: '9876543211', password: studentPw, isActive: true },
      { name: 'Anjali Singh',   email: 'anjali.singh@gmail.com',   contact: '9876543212', password: studentPw, isActive: true },
      { name: 'Rohan Gupta',    email: 'rohan.gupta@gmail.com',    contact: '9876543213', password: studentPw, isActive: false },
      { name: 'Sneha Patel',    email: 'sneha.patel@gmail.com',    contact: '9876543214', password: studentPw, isActive: true },
      { name: 'Amit Joshi',     email: 'amit.joshi@gmail.com',     contact: '9876543215', password: studentPw, isActive: true },
      { name: 'Kavita Nair',    email: 'kavita.nair@gmail.com',    contact: '9876543216', password: studentPw, isActive: true },
      { name: 'Deepak Mehta',   email: 'deepak.mehta@gmail.com',   contact: '9876543217', password: studentPw, isActive: false },
    ],
  })
  console.log('✅  Students seeded')

  // ─── 2. MEMBERSHIPS ──────────────────────────────────────────────────────
  const memPw = await bcrypt.hash('Member@123', 10)
  await prisma.membership.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Vijay Reddy',      email: 'vijay.reddy@gmail.com',      contact: '9811111101', password: memPw, isActive: true },
      { name: 'Neha Kapoor',      email: 'neha.kapoor@gmail.com',      contact: '9811111102', password: memPw, isActive: true },
      { name: 'Sanjay Mishra',    email: 'sanjay.mishra@gmail.com',    contact: '9811111103', password: memPw, isActive: true },
      { name: 'Pooja Tiwari',     email: 'pooja.tiwari@gmail.com',     contact: '9811111104', password: memPw, isActive: false },
      { name: 'Arjun Bose',       email: 'arjun.bose@gmail.com',       contact: '9811111105', password: memPw, isActive: true },
    ],
  })
  console.log('✅  Memberships seeded')

  // ─── 3. CANDIDATES (extra) ───────────────────────────────────────────────
  const candPw = await bcrypt.hash('Cand@123', 10)
  await prisma.candidate.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Ravi Kumar',    email: 'ravi.kumar@gmail.com',    mobile: '9900000001', password: candPw, city: 'Mumbai',   state: 'Maharashtra', gender: 'Male',   courseSelect: 'Degree',        acceptSignin: 1 },
      { name: 'Meena Rao',     email: 'meena.rao@gmail.com',     mobile: '9900000002', password: candPw, city: 'Pune',     state: 'Maharashtra', gender: 'Female', courseSelect: 'Certification', acceptSignin: 0 },
      { name: 'Kiran Desai',   email: 'kiran.desai@gmail.com',   mobile: '9900000003', password: candPw, city: 'Delhi',    state: 'Delhi',       gender: 'Male',   courseSelect: 'Corporate',     acceptSignin: 1 },
      { name: 'Swati More',    email: 'swati.more@gmail.com',    mobile: '9900000004', password: candPw, city: 'Nagpur',   state: 'Maharashtra', gender: 'Female', courseSelect: 'Entrepreneur',  acceptSignin: 1 },
      { name: 'Ajay Patil',    email: 'ajay.patil@gmail.com',    mobile: '9900000005', password: candPw, city: 'Nashik',   state: 'Maharashtra', gender: 'Male',   courseSelect: 'Degree',        acceptSignin: 0 },
    ],
  })
  console.log('✅  Candidates seeded')

  // ─── 4. EXPERTS ──────────────────────────────────────────────────────────
  // categories: 1=Degree, 2=Certification, 3=Entrepreneur, 4=Corporate Traning
  await prisma.expert.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Dr. Anand Kulkarni',  profession: 'Senior HR Consultant',      categoryId: 1 },
      { title: 'Ms. Rekha Iyer',      profession: 'Talent Acquisition Expert',  categoryId: 1 },
      { title: 'Mr. Suresh Bansal',   profession: 'Certified Recruiter Trainer',categoryId: 2 },
      { title: 'Ms. Priti Shah',      profession: 'L&D Specialist',             categoryId: 2 },
      { title: 'Mr. Rohit Malhotra',  profession: 'Startup Mentor & Coach',     categoryId: 3 },
      { title: 'Ms. Divya Nambiar',   profession: 'Entrepreneur & HR Leader',   categoryId: 3 },
      { title: 'Mr. Vivek Srivastava','profession': 'Corporate Trainer',         categoryId: 4 },
      { title: 'Ms. Snehal Joshi',    profession: 'Organizational Psychologist', categoryId: 4 },
    ],
  })
  console.log('✅  Experts seeded')

  // ─── 5. COURSE FEES ───────────────────────────────────────────────────────
  await prisma.courseFee.createMany({
    skipDuplicates: true,
    data: [
      { courseName: 'MBA in Human Resource Management',     categoryId: 1, fees: 95000, discount: 10000, subtotal: 85000, finalTotal: 85000, couponCode: 'DEGREE10' },
      { courseName: 'BBA in Recruitment & HR',             categoryId: 1, fees: 65000, discount: 5000,  subtotal: 60000, finalTotal: 60000 },
      { courseName: 'PGDM Human Resources',                categoryId: 1, fees: 75000, discount: 7500,  subtotal: 67500, finalTotal: 67500, couponCode: 'PGDM10' },
      { courseName: 'Professional Recruitment Certification',categoryId: 2, fees: 18000, discount: 2000, subtotal: 16000, finalTotal: 16000, couponCode: 'CERT10' },
      { courseName: 'HR Analytics Certification',           categoryId: 2, fees: 12000, discount: 1500, subtotal: 10500, finalTotal: 10500 },
      { courseName: 'Talent Acquisition Certification',     categoryId: 2, fees: 15000, discount: 0,    subtotal: 15000, finalTotal: 15000 },
      { courseName: 'Entrepreneurship & HR Bootcamp',       categoryId: 3, fees: 25000, discount: 3000, subtotal: 22000, finalTotal: 22000, couponCode: 'ENTRO15' },
      { courseName: 'Business Leadership Program',          categoryId: 3, fees: 30000, discount: 5000, subtotal: 25000, finalTotal: 25000 },
      { courseName: 'Corporate Recruitment Training',       categoryId: 4, fees: 20000, discount: 2500, subtotal: 17500, finalTotal: 17500, couponCode: 'CORP10' },
      { courseName: 'Mass Hiring & Bulk Recruitment',       categoryId: 4, fees: 22000, discount: 2000, subtotal: 20000, finalTotal: 20000 },
    ],
  })
  console.log('✅  Course Fees seeded')

  // ─── 6. COURSE REVIEWS ────────────────────────────────────────────────────
  await prisma.courseReview.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Excellent HR curriculum',       description: 'Very in-depth degree program',   rating: 5, review: 'Best investment for my HR career',                  categoryId: 1 },
      { title: 'Practical & industry relevant', description: 'Loved the real-world case studies', rating: 4, review: 'Highly recommend to anyone targeting HR roles',  categoryId: 1 },
      { title: 'Fast-track certification',      description: 'Completed in just 3 months',     rating: 5, review: 'Got placed within a week of completing',             categoryId: 2 },
      { title: 'Good content, could be shorter',description: 'Some modules felt repetitive',   rating: 3, review: 'Overall good value for the fee',                    categoryId: 2 },
      { title: 'Changed my career path',        description: 'From employee to founder!',      rating: 5, review: 'The mentorship was outstanding',                    categoryId: 3 },
      { title: 'Great networking opportunities',description: 'Met great peers and mentors',    rating: 4, review: 'Would attend again',                                categoryId: 3 },
      { title: 'Perfect for corporate teams',   description: 'We enrolled 5 employees together',rating: 5, review: 'All of them upskilled significantly',              categoryId: 4 },
      { title: 'Trainer was very knowledgeable',description: 'Vivek sir is the best!',         rating: 5, review: 'Interactive sessions made learning fun',             categoryId: 4 },
      { title: 'Strong recruiter mindset shift', description: 'The course changed how I screen candidates', rating: 5, review: 'I now understand the full hiring funnel',               categoryId: 1 },
      { title: 'Helpful for freshers',           description: 'Perfect balance of theory and practice',      rating: 4, review: 'Great for starting an HR career with confidence',       categoryId: 2 },
      { title: 'Practical sales to HR transition',description: 'I changed careers after this program',         rating: 5, review: 'The entrepreneurship module was very actionable',     categoryId: 3 },
      { title: 'Useful for HR teams',            description: 'Our team adopted the training instantly',     rating: 5, review: 'Excellent for building internal hiring processes',     categoryId: 4 },
    ],
  })
  console.log('✅  Course Reviews seeded')

  // ─── 7. FAQS ─────────────────────────────────────────────────────────────
  await prisma.faq.createMany({
    skipDuplicates: true,
    data: [
      { question: 'What is the duration of the Degree program?',          answer: 'The degree program is typically 2–3 years depending on the course you select.',              categoryId: 1 },
      { question: 'Is the Degree program recognized by UGC?',             answer: 'Yes, our degree programs are offered in association with UGC-recognized universities.',      categoryId: 1 },
      { question: 'How do I enroll in a Certification course?',           answer: 'You can enroll online via our website or by visiting our nearest centre.',                   categoryId: 2 },
      { question: 'What certification do I receive after completion?',    answer: 'You receive an industry-recognised certificate signed by our expert panel.',                 categoryId: 2 },
      { question: 'Do I need work experience for the Entrepreneur track?',answer: 'No, this track is open to freshers and professionals alike.',                               categoryId: 3 },
      { question: 'Will I get startup mentoring?',                        answer: 'Yes, every student gets 1-on-1 mentoring sessions with a startup veteran.',                 categoryId: 3 },
      { question: 'Can companies enroll multiple employees?',             answer: 'Absolutely. We offer corporate batch pricing with dedicated trainers.',                      categoryId: 4 },
      { question: 'Is there a corporate package discount?',               answer: 'Yes, groups of 5 or more get up to 20% off on the standard fee.',                          categoryId: 4 },
      { question: 'Are classes online or offline?',                       answer: 'We offer both modes — online live sessions and in-person classroom training.',              categoryId: null },
      { question: 'What is the refund policy?',                           answer: 'Full refund within 7 days of enrollment. 50% refund up to 15 days. No refund thereafter.', categoryId: null },
      { question: 'Do you provide placement assistance?',                 answer: 'Yes. We offer resume support, mock interviews, and job referrals through our hiring network.', categoryId: 4 },
      { question: 'Will I get course material after enrollment?',         answer: 'Yes. Every learner gets structured study material, templates, and practice worksheets.',     categoryId: 2 },
      { question: 'Can I speak to a counsellor before joining?',          answer: 'Absolutely. Our counselling team helps you pick the right HR path before enrollment.',        categoryId: null },
      { question: 'Is the certificate industry recognised?',              answer: 'Yes. Certificates are designed to be shareable on LinkedIn and accepted by hiring partners.', categoryId: 5 },
    ],
  })
  console.log('✅  FAQs seeded')

  // ─── 8. FAQ CATEGORIES ───────────────────────────────────────────────────
  await prisma.faqCategory.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Admissions' },
      { title: 'Fees & Payments' },
      { title: 'Courses' },
      { title: 'Placements' },
      { title: 'Certifications' },
    ],
  })
  console.log('✅  FAQ Categories seeded')

  // ─── 9. KNOWLEDGE BASE ───────────────────────────────────────────────────
  await prisma.knowledgeItem.createMany({
    skipDuplicates: true,
    data: [
      { question: 'What is Boolean Search in recruitment?',         answer: 'Boolean search uses AND, OR, NOT operators to refine candidate searches on LinkedIn and job portals.',                addedBy: 'Admin', date: '2024-01-10' },
      { question: 'What is an ATS (Applicant Tracking System)?',   answer: 'ATS is software that automates the hiring process — parsing resumes, scheduling interviews, and tracking candidates.', addedBy: 'Admin', date: '2024-01-15' },
      { question: 'How do you calculate time-to-hire?',            answer: 'Time-to-hire = number of days from job opening to offer accepted. Industry average is 23–38 days.',                   addedBy: 'Admin', date: '2024-02-01' },
      { question: 'What is the STAR interview method?',            answer: 'STAR = Situation, Task, Action, Result. It structures behavioral interview questions for consistent evaluation.',       addedBy: 'Admin', date: '2024-02-10' },
      { question: 'What is employer branding?',                    answer: 'Employer branding is how a company markets itself to potential employees — culture, benefits, values, and reputation.',addedBy: 'Admin', date: '2024-03-01' },
      { question: 'What is the difference between CV and resume?', answer: 'A CV is a comprehensive career document (2+ pages). A resume is a concise 1-page summary tailored to a specific role.',addedBy: 'Admin', date: '2024-03-15' },
      { question: 'What is headhunting?',                          answer: 'Headhunting is proactively identifying and approaching high-calibre passive candidates who are not actively job-hunting.',addedBy: 'Admin', date: '2024-04-01' },
      { question: 'How to write an effective job description?',    answer: 'Include: job title, responsibilities, required qualifications, skills, compensation range, and company culture notes.',  addedBy: 'Admin', date: '2024-04-15' },
      { question: 'What is a sourcing pipeline?',                  answer: 'A sourcing pipeline is a structured list of candidates at different engagement stages, helping recruiters move faster and stay organized.', addedBy: 'Admin', date: '2024-05-01' },
      { question: 'Why are candidate personas useful?',            answer: 'Candidate personas clarify the kind of talent you need, making sourcing, screening, and communication more consistent.', addedBy: 'Admin', date: '2024-05-10' },
      { question: 'What is employer value proposition (EVP)?',     answer: 'EVP is the unique combination of compensation, growth, culture, and purpose that makes candidates choose your company.', addedBy: 'Admin', date: '2024-05-20' },
      { question: 'How do recruiters reduce time-to-hire?',         answer: 'By improving JD quality, pre-building talent pools, automating scheduling, and aligning interview feedback quickly.', addedBy: 'Admin', date: '2024-06-01' },
    ],
  })
  console.log('✅  Knowledge Base seeded')

  // ─── 10. Q&A ANSWERS (for existing questions) ────────────────────────────
  // existing question ids: 2,3,4,5,6 | user ids: 15,16,27,30,31
  const existingQs = await prisma.question.findMany({ select: { id: true } })
  const existingUsers = await prisma.communityUser.findMany({ select: { id: true } })
  if (existingQs.length > 0 && existingUsers.length >= 2) {
    const uid2 = existingUsers[1]?.id ?? existingUsers[0].id
    await prisma.answer.createMany({
      skipDuplicates: true,
      data: [
        { questionId: existingQs[0].id, userId: uid2, answer: 'A talent acquisition interview is a structured meeting to assess whether a candidate fits a specific role and company culture. It focuses on skills, experience, and cultural alignment.' },
        { questionId: existingQs[1]?.id ?? existingQs[0].id, userId: uid2, answer: 'Talent acquisition is strategic — it builds long-term pipelines and workforce planning. Recruiting is tactical — filling open positions quickly.' },
        { questionId: existingQs[2]?.id ?? existingQs[0].id, userId: uid2, answer: 'Strong communication, active listening, data analysis for sourcing metrics, proficiency in ATS tools, and the ability to build relationships with both candidates and hiring managers.' },
      ],
    })
    console.log('✅  Q&A Answers seeded')
  }

  // ─── 11. CONTACT SUBMISSIONS ─────────────────────────────────────────────
  await prisma.contactSubmission.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Ritika Sharma',  email: 'ritika.sharma@gmail.com',  mobile: '9823001001', message: 'I would like to know more about the Corporate Training programs. Please share the brochure.' },
      { name: 'Nikhil Desai',   email: 'nikhil.desai@gmail.com',   mobile: '9823001002', message: 'What are the batch start dates for the Certification courses this month?' },
      { name: 'Pooja Wagh',     email: 'pooja.wagh@gmail.com',     mobile: '9823001003', message: 'Can I get a scholarship for the Degree program? I am a fresh graduate.' },
      { name: 'Arun Thosar',    email: 'arun.thosar@gmail.com',    mobile: '9823001004', message: 'We are a company of 50 employees. Do you offer bulk training packages?' },
      { name: 'Shalini Gaikwad',email: 'shalini.gaikwad@gmail.com',mobile: '9823001005', message: 'I attended your free webinar last week. Loved it! How do I enroll in the full course?' },
    ],
  })
  console.log('✅  Contact Submissions seeded')

  // ─── 12. SUBSCRIBERS ──────────────────────────────────────────────────────
  await prisma.subscriber.createMany({
    skipDuplicates: true,
    data: [
      { email: 'newsletter1@gmail.com',  ipAddress: '103.21.55.1',  isActive: true },
      { email: 'newsletter2@gmail.com',  ipAddress: '103.21.55.2',  isActive: true },
      { email: 'newsletter3@gmail.com',  ipAddress: '103.21.55.3',  isActive: true },
      { email: 'newsletter4@gmail.com',  ipAddress: '103.21.55.4',  isActive: false },
      { email: 'newsletter5@gmail.com',  ipAddress: '103.21.55.5',  isActive: true },
      { email: 'hr.professional@outlook.com', ipAddress: '103.21.55.6', isActive: true },
      { email: 'talent.seeker@yahoo.com',     ipAddress: '103.21.55.7', isActive: true },
      { email: 'recruiter.india@gmail.com',   ipAddress: '103.21.55.8', isActive: true },
      { email: 'corporate.hr@gmail.com',      ipAddress: '103.21.55.9', isActive: false },
      { email: 'degree.aspirant@gmail.com',   ipAddress: '103.21.55.10',isActive: true },
    ],
  })
  console.log('✅  Subscribers seeded')

  // ─── 13. TESTIMONIALS ────────────────────────────────────────────────────
  await prisma.testimonial.createMany({
    skipDuplicates: true,
    data: [
      { author: 'Priya Sharma',    title: 'Life-changing experience!',          description: 'The Recruitment Institute completely transformed my career. I went from zero knowledge about HR to landing a job at a top MNC within 3 months of completing the course.', rating: 5, image: '/assets/images/team/style1/1.jpg', isActive: true },
      { author: 'Rahul Verma',     title: 'Best certification course in India', description: 'I have done multiple online courses but nothing comes close to the quality of content and mentorship here. The practical training is outstanding.', rating: 5, image: '/assets/images/team/style1/2.jpg', isActive: true },
      { author: 'Anjali Singh',    title: 'Excellent faculty & support',        description: 'The faculty is very supportive and always available for doubts. The placement assistance helped me get my first corporate HR role.', rating: 4, image: '/assets/images/team/style1/3.jpg', isActive: true },
      { author: 'Deepak Mehta',    title: 'Good value for money',               description: 'Compared to other institutes, the fee is very reasonable and the quality of education is top-notch. Highly recommend for freshers.', rating: 4, image: '/assets/images/team/style1/4.jpg', isActive: true },
      { author: 'Sneha Patel',     title: 'Superb entrepreneurship program',    description: 'I started my own HR consultancy 6 months after the Entrepreneur track. The program gave me confidence and practical tools to start on Day 1.', rating: 5, image: '/assets/images/team/style1/5.jpg', isActive: true },
      { author: 'Vivek Singh',     title: 'Corporate batch was excellent',      description: 'Our entire L&D team attended the corporate training. The trainer was energetic and the content was highly relevant to our industry.', rating: 5, image: '/assets/images/team/style1/6.jpg', isActive: true },
      { author: 'Nisha Jain',      title: 'Great online learning experience',   description: 'Live sessions are well-structured and interactive. Even online, I felt like I was in a classroom. The study materials are very comprehensive.', rating: 4, image: '/assets/images/team/style2/1.jpg', isActive: false },
      { author: 'Karan Mehta',     title: 'Would recommend to everyone',        description: 'This institute genuinely cares about student outcomes. They followed up even 2 months after the course to check on my placement status.', rating: 5, image: '/assets/images/team/style2/2.jpg', isActive: true },
      { author: 'Shweta Rao',      title: 'Supportive learning environment',     description: 'The counsellors, trainers, and community support made it easy to stay consistent and finish the program.', rating: 5, image: '/assets/images/team/style2/3.jpg', isActive: true },
      { author: 'Mohit Jain',      title: 'Strong practical focus',              description: 'I liked that every concept was tied to actual hiring workflows, not just theory.', rating: 5, image: '/assets/images/team/style2/4.jpg', isActive: true },
    ],
  })
  console.log('✅  Testimonials seeded')

  // ─── 14. SERVICES ────────────────────────────────────────────────────────
  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Recruitment Training',      slug: 'recruitment-training',    description: 'Comprehensive training for aspiring recruiters and HR professionals. Learn sourcing, screening, closing, and onboarding workflows.', image: '/assets/images/services/home6/icon/1.png', isActive: true, sortOrder: 1 },
      { title: 'Corporate HR Solutions',    slug: 'corporate-hr-solutions',  description: 'End-to-end HR consulting for corporates - from workforce planning to mass hiring campaigns and L&D programs.', image: '/assets/images/services/home6/icon/2.png', isActive: true, sortOrder: 2 },
      { title: 'Placement Assistance',      slug: 'placement-assistance',    description: 'We connect trained candidates with hiring partners across India. Our placement support is built around real job readiness.', image: '/assets/images/services/home6/icon/3.png', isActive: true, sortOrder: 3 },
      { title: 'Online Certification',      slug: 'online-certification',    description: 'Flexible online certification courses that fit your schedule. Industry-recognized certificates to boost your resume.', image: '/assets/images/services/home6/icon/4.png', isActive: true, sortOrder: 4 },
      { title: 'HR Consulting',             slug: 'hr-consulting',           description: 'Strategic HR consulting for startups and SMEs - hiring strategy, compensation benchmarking, and policy creation.', image: '/assets/images/about/icon/1.png', isActive: true, sortOrder: 5 },
      { title: 'Interview Preparation',     slug: 'interview-preparation',   description: 'Intensive interview preparation workshops covering mock interviews, body language, and domain-specific question banks.', image: '/assets/images/about/icon/2.png', isActive: true, sortOrder: 6 },
    ],
  })
  console.log('✅  Services seeded')

  // ─── 15. ABOUT US (update existing) ──────────────────────────────────────
  await prisma.aboutSection.updateMany({
    data: {
      title:    'Welcome to The Recruitment Institute',
      subtitle: 'India\'s Premier HR & Recruitment Training Institute',
    },
  })
  // Add a second section
  await prisma.aboutSection.createMany({
    skipDuplicates: false,
    data: [
      {
        title:       'Our Mission',
        subtitle:    'Empowering Every Talent',
        image:       '/assets/images/about/home11/about.png',
        description: 'Our mission is to democratize recruitment knowledge across India. We believe every individual deserves world-class training that transforms their career trajectory. With over 10,000 graduates and growing, we are building the largest HR talent community in India.',
      },
      {
        title:       'Why Choose Us?',
        subtitle:    '10,000+ Placements | 98% Satisfaction | 50+ Expert Trainers',
        image:       '/assets/images/about/home13/about.png',
        description: 'Recruitment Institute stands apart because of our practitioner-led curriculum, industry partnerships, and lifetime placement support. Our trainers are active HR professionals - not just academics.',
      },
      {
        title:       'Hands-On Learning',
        subtitle:    'Practice with Real Workflows',
        image:       '/assets/images/about/home5/about-main.png',
        description: 'Every learner gets practical exposure to sourcing, screening, interview preparation, and HR operations so the transition to work feels natural.',
      },
    ],
  })
  console.log('✅  About Us seeded')

  // ─── 16. COURSE LEADS ────────────────────────────────────────────────────
  await prisma.courseLead.createMany({
    skipDuplicates: true,
    data: [
      { firstName: 'Sachin',  lastName: 'More',   email: 'sachin.more@gmail.com',   contact: '9922001001', flag: 'new' },
      { firstName: 'Dipali',  lastName: 'Patil',  email: 'dipali.patil@gmail.com',  contact: '9922001002', flag: 'contacted' },
      { firstName: 'Rajesh',  lastName: 'Kumar',  email: 'rajesh.kumar@gmail.com',  contact: '9922001003', flag: 'enrolled' },
      { firstName: 'Sunita',  lastName: 'Joshi',  email: 'sunita.joshi@gmail.com',  contact: '9922001004', flag: 'new' },
      { firstName: 'Mahesh',  lastName: 'Singh',  email: 'mahesh.singh@gmail.com',  contact: '9922001005', flag: 'contacted' },
    ],
  })
  console.log('✅  Course Leads seeded')

  // ─── 17. FEES LEADS ──────────────────────────────────────────────────────
  await prisma.feesLead.createMany({
    skipDuplicates: true,
    data: [
      { firstName: 'Amol',    lastName: 'Deshpande', email: 'amol.deshpande@gmail.com', contact: '9933001001', flag: 'new' },
      { firstName: 'Kavita',  lastName: 'Sharma',    email: 'kavita.sharma@gmail.com',  contact: '9933001002', flag: 'paid' },
      { firstName: 'Nitin',   lastName: 'Kulkarni',  email: 'nitin.kulkarni@gmail.com', contact: '9933001003', flag: 'pending' },
    ],
  })
  console.log('✅  Fees Leads seeded')

  // ─── Final count ──────────────────────────────────────────────────────────
  console.log('\n📊  Final row counts:')
  const models = [
    ['Students',       await prisma.student.count()],
    ['Memberships',    await prisma.membership.count()],
    ['Candidates',     await prisma.candidate.count()],
    ['Experts',        await prisma.expert.count()],
    ['CourseFees',     await prisma.courseFee.count()],
    ['CourseReviews',  await prisma.courseReview.count()],
    ['FAQs',           await prisma.faq.count()],
    ['FaqCategories',  await prisma.faqCategory.count()],
    ['KnowledgeItems', await prisma.knowledgeItem.count()],
    ['Q&A Answers',    await prisma.answer.count()],
    ['Contacts',       await prisma.contactSubmission.count()],
    ['Subscribers',    await prisma.subscriber.count()],
    ['Testimonials',   await prisma.testimonial.count()],
    ['Services',       await prisma.service.count()],
    ['AboutSections',  await prisma.aboutSection.count()],
    ['CourseLeads',    await prisma.courseLead.count()],
    ['FeesLeads',      await prisma.feesLead.count()],
  ] as [string, number][]

  models.forEach(([name, count]) => console.log(`   ${name.padEnd(18)} ${count}`))
  console.log('\n✨  Seed complete!')
}

main()
  .catch((e) => { console.error('❌  Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
