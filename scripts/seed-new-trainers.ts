import 'dotenv/config'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const localUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute'
const cloudSqlUrl = 'postgresql://postgres:RI_CloudSql_2026_Pass!@35.200.228.49:5432/recruitmentinstitute'

const newTrainers = [
  {
    name: 'Rahul Limaye',
    email: 'rahul.limaye@institute.com',
    phone: '9870001011',
    specialization: 'Business Growth & Transformation Strategy Consultant | Scaling Startups & Enterprises | Career Coach',
    bio: 'Business & Technology Consultant, Corporate Trainer and Business Growth Strategist with 30+ years of professional experience across Sales & BD, Recruitment, Technology, and Management Consulting.',
    image: '',
    profileJson: {
      designation: 'Business Growth & Transformation Strategy Consultant | Scaling Startups & Enterprises | Career Coach',
      companyEx: 'Business Growth & Transformation Strategy Consultant | Scaling Startups & Enterprises | Career Coach',
      experienceYears: 30,
      linkedinUrl: '',
      quote: 'Combining technology, business strategy and human psychology to catalyze growth and transformation.',
      bio: 'Business & Technology Consultant, Corporate Trainer and Business Growth Strategist with 30+ years of professional experience.',
      longBio: `Rahul Limaye is a Business & Technology Consultant, Corporate Trainer and Business Growth Strategist with 30+ years of professional experience across Sales & Business Development, Recruitment, Technology, Business Analysis, Product Management, Strategic Planning and Management Consulting.\n\nHe has worked across diverse industries including IT, Healthcare, Manufacturing, Retail, Supply Chain & Logistics, Banking & Finance, Recruitment, Travel & Tourism, BPO/KPO/RPO, Education, Construction and Agriculture & Food. His experience includes building business practices, developing client relationships, driving sales growth, improving processes and supporting organisations through technology adoption and business transformation.\n\nRahul brings particularly relevant experience in Recruitment & Staffing, including leadership roles in recruitment and staffing businesses. His professional journey includes experience with Persistent Systems, Creative Vision & Endeavour Systems and Talent Bricks HR Services, along with extensive business development and consulting experience.\n\nAs a trainer and business coach, Rahul focuses on helping professionals, recruiters, entrepreneurs and business leaders develop practical capabilities in business growth, recruitment, sales strategy, client acquisition, technology adoption, process optimisation and leadership.\n\nHis approach combines technology, business strategy and human psychology, reflected in his professional positioning as a "Smile Catalyst".`,
      specializationTags: [
        'Recruitment & Talent Acquisition',
        'Recruitment Business Development',
        'Staffing & Recruitment Agency Management',
        'Client Acquisition & Relationship Management',
        'B2B Sales & Business Development',
        'Sales Strategy & Revenue Growth',
        'Business Growth Strategy',
        'Market Research & Competitive Analysis',
        'Strategic Planning & Business Consulting',
        'Business Process Optimisation',
        'Technology Adoption & Digital Transformation',
        'Business Analysis & Product Management',
        'Leadership & Team Management',
        'Entrepreneurship & Business Building',
        'Career Development & Coaching',
        'Change Management & Performance Management',
      ],
      certifications: [
        'Business & Technology Consultant',
        'Corporate Trainer & Business Coach',
        'Recruitment & Staffing Professional',
        'Business Growth & Sales Strategist',
        'Management & Strategic Planning Consultant',
        'Career Development Coach',
      ],
      accreditationHighlight: {
        text: 'Professionally recognised by the International Career Counsellors’ Club.',
        link: 'https://www.iccclub.org/MemberDetail.php?id=ICMIEIN2401407',
        linkLabel: 'Verify Credential on ICC Club',
      },
      coursesTaught: [
        'HR Corporate Training Course',
        'Recruitment Business Accelerator',
        'End-to-End Recruitment Training',
        'AI for Recruitment',
      ],
      rating: 4.98,
      reviewsCount: 162,
      studentsMentored: 1350,
    },
  },
  {
    name: 'Tukuna Kumar Lenka',
    email: 'tukuna.lenka@institute.com',
    phone: '9870001012',
    specialization: 'Talent Acquisition & Recruitment Professional | Corporate Hiring & Sourcing Specialist | Recruitment Coach',
    bio: 'Talent Acquisition & Recruitment Professional with corporate hiring experience at Capgemini / Capgemini Engineering across IT & Technology hiring and talent sourcing.',
    image: '/assets/images/trainers/tukuna_kumar_lenka.jpg',
    profileJson: {
      designation: 'Talent Acquisition & Recruitment Professional | Corporate Hiring & Sourcing Specialist | Recruitment Coach',
      companyEx: 'Talent Acquisition & Recruitment Professional | Associated with Capgemini / Capgemini Engineering',
      experienceYears: 15,
      linkedinUrl: 'https://www.linkedin.com/in/tukunakumarlenka/',
      quote: 'Mastering end-to-end talent sourcing and recruiter productivity transforms candidate quality and hiring turnaround.',
      bio: 'Talent Acquisition & Recruitment Professional with corporate hiring experience at Capgemini / Capgemini Engineering across IT & Technology hiring.',
      longBio: `Talent Acquisition & Recruitment Professional with corporate hiring experience.\n\nAssociated with Capgemini / Capgemini Engineering in talent acquisition and recruitment activities.\n\nExperience in IT/Technology Recruitment and Talent Sourcing.\n\nHands-on exposure to end-to-end recruitment and candidate sourcing.\n\nExperience supporting hiring requirements across multiple technology roles and skill areas.\n\nPractical understanding of corporate recruitment processes, stakeholder coordination and hiring delivery.\n\nIndustry-oriented perspective on recruiter performance, candidate quality and hiring turnaround.`,
      specializationTags: [
        'Talent Acquisition & Recruitment',
        'IT & Technology Recruitment',
        'End-to-End Recruitment',
        'Candidate Sourcing & Screening',
        'LinkedIn Recruitment & Talent Sourcing',
        'Recruitment Pipeline Management',
        'Technical Hiring',
        'Candidate Engagement',
        'Interview Coordination',
        'Hiring Manager Coordination',
        'Recruitment Operations',
        'Corporate Recruitment Practices',
        'Recruitment Metrics & Delivery',
        'Recruiter Productivity & Performance',
      ],
      certifications: [
        'Corporate Talent Acquisition Professional',
        'Recruitment & Talent Sourcing Practitioner',
        'IT & Technology Recruitment Professional',
        'Corporate Hiring & Recruitment Specialist',
      ],
      coursesTaught: [
        'End-to-End Recruitment Training',
        'AI for Recruitment',
        'Corporate Recruitment Training',
        'Professional Recruitment Specialist',
      ],
      rating: 4.96,
      reviewsCount: 125,
      studentsMentored: 1100,
    },
  },
]

async function seedToDb(connectionString: string, label: string) {
  console.log(`Connecting to ${label}...`)
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 })
  const defaultPassword = await bcrypt.hash('Trainer@123', 10)

  try {
    for (const t of newTrainers) {
      // Check existing
      const existing = await pool.query(
        'SELECT id FROM trainers WHERE email = $1 OR name = $2',
        [t.email, t.name]
      )

      if (existing.rows.length > 0) {
        const id = existing.rows[0].id
        await pool.query(
          `UPDATE trainers 
           SET name = $1, specialization = $2, bio = $3, profile_json = $4::jsonb, 
               image = CASE WHEN $5 <> '' THEN $5 ELSE image END,
               status = true, updated_at = NOW()
           WHERE id = $6`,
          [t.name, t.specialization, t.bio, JSON.stringify(t.profileJson), t.image, id]
        )
        console.log(`[${label}] Updated ${t.name} (id: ${id})`)
      } else {
        const ins = await pool.query(
          `INSERT INTO trainers 
           (name, email, password, phone, specialization, bio, image, status, timezone, profile_json, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'Asia/Kolkata', $8::jsonb, NOW(), NOW())
           RETURNING id`,
          [t.name, t.email, defaultPassword, t.phone, t.specialization, t.bio, t.image, JSON.stringify(t.profileJson)]
        )
        console.log(`[${label}] Created ${t.name} (id: ${ins.rows[0].id})`)
      }
    }
  } catch (err: any) {
    console.error(`[${label}] Seed error:`, err.message)
  } finally {
    await pool.end()
  }
}

async function main() {
  await seedToDb(localUrl, 'Local Database')
  await seedToDb(cloudSqlUrl, 'Cloud SQL Production')
}

main().catch(console.error)
