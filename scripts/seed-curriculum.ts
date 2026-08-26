import { prisma } from '../lib/prisma'

interface CurriculumModule {
  title: string
  description?: string
  chapters: {
    title: string
    topics: string[]
  }[]
}

const SYLLABUS_MAP: Record<number, CurriculumModule[]> = {
  // Course ID 22: HR Corporate Training Course (/hr-corporate-training-course)
  22: [
    {
      title: 'Module 1: Recruitment Process Audit & Benchmarking',
      description: 'Assess current hiring workflows, identify bottlenecks, and implement best-practice frameworks.',
      chapters: [
        {
          title: 'Recruitment Process Audit & Workflow Analysis',
          topics: [
            'Mapping your existing end-to-end recruitment workflow',
            'Identifying inefficiencies, delays, and compliance gaps',
            'Benchmarking against industry best practices',
            'Creating a recruitment process improvement roadmap',
            'Stakeholder alignment and change management basics',
            'Defining SLAs and service-level agreements for hiring',
          ],
        },
      ],
    },
    {
      title: 'Module 2: Advanced Sourcing & Talent Pipeline',
      description: 'Master Boolean search, talent mapping, LinkedIn Recruiter, employee referrals, and campus pipelines.',
      chapters: [
        {
          title: 'Advanced Talent Sourcing Strategies',
          topics: [
            'Boolean search strings, X-ray techniques, and talent mapping',
            'Maximising LinkedIn Recruiter and sourcing platforms',
            'Building proactive talent pools and talent communities',
            'Campus hiring, employee referral programme design',
            'Diversity and inclusive sourcing strategies',
            'Passive candidate engagement and nurture campaigns',
          ],
        },
      ],
    },
    {
      title: 'Module 3: Structured Interviewing & Selection',
      description: 'Competency-based and situational interviewing for consistent, bias-free assessments.',
      chapters: [
        {
          title: 'Interview Design & Candidate Evaluation',
          topics: [
            'Competency-based and behavioural interview frameworks',
            'Designing structured interview scorecards',
            'Unconscious bias awareness and mitigation',
            'Panel interview coordination and calibration',
            'Assessment centre design for volume hiring',
            'Decision-making and offer recommendation best practices',
          ],
        },
      ],
    },
    {
      title: 'Module 4: ATS Optimisation & Recruitment Technology',
      description: 'Maximise ROI on ATS, configure workflows, automate follow-ups, and reduce time-to-fill.',
      chapters: [
        {
          title: 'Recruitment Technology & ATS Systems',
          topics: [
            'ATS configuration: job requisition and workflow setup',
            'Candidate disposition, tagging, and pipeline management',
            'Automating interview scheduling and communication',
            'Integrating job boards, LinkedIn, and careers page',
            'AI sourcing tools: overview and practical use',
            'Data hygiene and candidate privacy compliance (GDPR / DPDP)',
          ],
        },
      ],
    },
    {
      title: 'Module 5: Employer Branding & Candidate Experience',
      description: 'Develop an employer value proposition, careers page, and social strategy to attract top talent.',
      chapters: [
        {
          title: 'Employer Branding & Candidate Engagement',
          topics: [
            'Defining your Employer Value Proposition (EVP)',
            'Careers page audit and optimisation checklist',
            'Social media employer branding playbook',
            'Glassdoor / AmbitionBox reputation management',
            'Candidate communication templates and feedback loops',
            'Measuring Net Promoter Score (NPS) for candidates',
          ],
        },
      ],
    },
    {
      title: 'Module 6: Recruitment Metrics, Analytics & Reporting',
      description: 'Track quality-of-hire, cost-per-hire, offer acceptance rate, and build leadership dashboards.',
      chapters: [
        {
          title: 'Hiring Metrics, Dashboards & ROI',
          topics: [
            'Key recruitment KPIs: time-to-fill, cost-per-hire, quality-of-hire',
            'Offer acceptance rate analysis and improvement strategies',
            'Building a recruitment dashboard for leadership reporting',
            'Cost-benefit analysis of hiring channels and agency spend',
            'Candidate quality metrics and retention tracking',
            'Continuous improvement cycles and executive presentations',
          ],
        },
      ],
    },
  ],

  // Course ID 2: Degree Courses / Master End-to-End Recruitment All Domains (/end-to-end-recruitment-training)
  2: [
    {
      title: 'Week 1–2: Recruitment Fundamentals & Job Analysis',
      description: 'Job analysis, role intake meetings, recruiter responsibilities, and hiring lifecycle.',
      chapters: [
        {
          title: 'Foundations & Job Analysis',
          topics: [
            'Job analysis & role intake meetings',
            'Writing clear and compelling job profiles',
            'Understanding the end-to-end hiring lifecycle',
            'Key recruitment terminology and frameworks',
            'Navigating multiple applicant sourcing channels',
            'Recruiter roles, skills, and daily responsibilities',
          ],
        },
      ],
    },
    {
      title: 'Week 3–4: Sourcing Strategies & Boolean Search',
      description: 'Google X-ray, Boolean strings, LinkedIn Recruiter filters, and talent pipelines.',
      chapters: [
        {
          title: 'Candidate Sourcing & Search Techniques',
          topics: [
            'Google X-ray and advanced Boolean search strings',
            'Advanced LinkedIn Recruiter filters and InMail',
            'Targeting and engaging passive candidates',
            'Job board strategies (Naukri, Indeed, LinkedIn)',
            'Building and maintaining talent pipelines',
            'Social media sourcing (Facebook, Twitter, GitHub)',
          ],
        },
      ],
    },
    {
      title: 'Week 5–6: Screening, Interviews & Candidate Assessment',
      description: 'Competency-based interviews, automated screening, interview structures, and evaluation frameworks.',
      chapters: [
        {
          title: 'Screening & Interview Execution',
          topics: [
            'Competency-based and behavioural interview techniques',
            'Vetting resumes at scale with automated tools',
            'Phone, video, and in-person interview structures',
            'Conducting initial screening calls professionally',
            'Decision-making and candidate evaluation frameworks',
            'Candidate communication and workflow management',
          ],
        },
      ],
    },
    {
      title: 'Week 7–8: Domain Specialisation (IT / Non-IT / BFSI / Healthcare)',
      description: 'Domain-specific staffing models across IT, BFSI, Healthcare, Pharma, Manufacturing, and FMCG.',
      chapters: [
        {
          title: 'Domain Hiring Specialisation',
          topics: [
            'IT sourcing terminology and technical assessment',
            'BFSI sector staffing models and role structures',
            'Pharma / Healthcare credential verification',
            'Manufacturing & FMCG role requirements',
            'Finance certifications and competitive strategies',
            'Domain-specific talent attraction techniques',
          ],
        },
      ],
    },
    {
      title: 'Week 9–10: Offer Management, Onboarding & Employer Branding',
      description: 'Offer negotiation, counteroffers, candidate onboarding checklists, and employer branding.',
      chapters: [
        {
          title: 'Offers, Onboarding & Brand Strategy',
          topics: [
            'Drafting and structuring competitive job offers',
            'Counter-offer negotiation techniques',
            'Candidate onboarding checklists and workflows',
            'Building a strong employer brand',
            'Job description optimisation and content marketing',
            'Legal and ethical recruitment considerations',
          ],
        },
      ],
    },
    {
      title: 'Week 11–12: Metrics, ATS Tools, Practical Project & Placement Prep',
      description: 'ATS platform operations, hiring metrics, live sourcing capstone project, and placement registration.',
      chapters: [
        {
          title: 'Metrics, Live Capstone Project & Placement',
          topics: [
            'Modern ATS platform overview and operations',
            'KPI trackers, dashboards, and hiring metrics',
            'Complete end-to-end recruitment plan development',
            'Live candidate sourcing and screening project',
            'Mock interviews and final hiring rationale',
            'Resume optimisation and placement registration',
          ],
        },
      ],
    },
  ],

  // Course ID 19: Certification Courses / HR Courses for Beginners (/hr-courses-for-beginners)
  19: [
    {
      title: 'Module 1: Introduction to Recruitment',
      description: 'Definition, purpose, hiring lifecycle overview, and recruitment terminology.',
      chapters: [
        {
          title: 'Recruitment Basics & Terminology',
          topics: [
            'Definition and purpose of recruitment',
            'The role of recruitment in organisational success',
            'Overview of the end-to-end recruitment process',
            'Common recruitment terms, jargon, and job specifications',
            'Differentiating between recruitment and selection',
            'Current trends and challenges in hiring',
          ],
        },
      ],
    },
    {
      title: 'Module 2: Sourcing Candidates',
      description: 'Candidate sourcing methods, job boards (Naukri, Indeed), and social hiring on LinkedIn.',
      chapters: [
        {
          title: 'Candidate Sourcing & Job Portals',
          topics: [
            'Identifying where to find potential candidates',
            'Strategies for attracting quality candidates',
            'Importance of a strong employer brand',
            'Using job boards (Naukri, Indeed) effectively',
            'Leveraging LinkedIn, Facebook, and Twitter for hiring',
            'Tips for engaging with candidates online',
          ],
        },
      ],
    },
    {
      title: 'Module 3: Screening and Interviewing',
      description: 'Resume screening techniques, red flags, structured interview questions, and evaluation.',
      chapters: [
        {
          title: 'Screening & Interviewing Essentials',
          topics: [
            'Methods for initial resume and application screening',
            'Identifying key qualifications and red flags',
            'Tools and software for efficient screening',
            'Preparing for and structuring interviews',
            'Different types of interview questions and their purposes',
            'Techniques for evaluating candidates\' responses',
          ],
        },
      ],
    },
    {
      title: 'Module 4: Job Offers and Onboarding',
      description: 'Job offer components, salary negotiation, structured onboarding, and culture integration.',
      chapters: [
        {
          title: 'Offer Negotiation & Onboarding Process',
          topics: [
            'Components of a job offer salary, benefits, start date',
            'Communicating job offers effectively',
            'Handling negotiations and counteroffers',
            'Importance of a structured onboarding process',
            'Steps to successfully onboard new hires',
            'Integrating new employees into company culture',
          ],
        },
      ],
    },
  ],

  // Course ID 21: Entrepreneur Courses / HR Entrepreneurship Program (/hr-entrepreneurship-program)
  21: [
    {
      title: 'Module 1–2: Entrepreneurship Foundations & Market Research',
      description: 'Agency business model, industry trends, niche evaluation, and market feasibility.',
      chapters: [
        {
          title: 'Recruitment Agency Foundations',
          topics: [
            'Overview of industry trends and competitive landscape',
            'Analyzing talent demand across sectors',
            'Spotting market gaps and unmet hiring needs',
            'Evaluating niches and specialization areas',
            'Market research and feasibility studies',
            'Setting vision, mission, and business goals',
          ],
        },
      ],
    },
    {
      title: 'Module 3–4: Business Planning, Legal Setup & Pricing',
      description: 'Proprietorship vs LLC, GST registration, retainer pricing, and office infrastructure.',
      chapters: [
        {
          title: 'Legal Setup, Pricing & Infrastructure',
          topics: [
            'Sole proprietorship vs LLC vs corporation structures',
            'Business registration and documentation steps',
            'Tax registration & GST filings',
            'Structuring commission and retainer packages',
            'Essential tools, technologies, and office setup',
            'Administrative processes and systems',
          ],
        },
      ],
    },
    {
      title: 'Module 5–6: Client Acquisition, B2B Sales & Marketing',
      description: 'Cold outreach templates, LinkedIn client acquisition, retainer billing, and closing deals.',
      chapters: [
        {
          title: 'B2B Sales & Client Acquisition',
          topics: [
            'Cold emailing templates that convert',
            'LinkedIn outreach and social media strategy',
            'Finding and closing high-value corporate clients',
            'Content marketing, SEO, and online advertising',
            'Negotiating billing rates and terms of business',
            'Building a referral and partnership network',
          ],
        },
      ],
    },
    {
      title: 'Module 7–8: Agency Operations, Team Management & Scaling',
      description: 'Hiring recruiter teams, daily KPI trackers, agency ATS selection, and RPO scaling.',
      chapters: [
        {
          title: 'Operations, Recruiter KPIs & Scaling',
          topics: [
            'Recruiting and onboarding associate screeners',
            'Setting up daily target trackers and KPIs',
            'Performance reviews, incentives, and rewards',
            'Agency ATS platform selection and automation',
            'Contract staffing and executive search expansion',
            'Scaling revenue with retainer and RPO models',
          ],
        },
      ],
    },
  ],
}

async function seedCurriculum() {
  console.log('🔄 Seeding full frontend-matching curriculums into LMS modules, chapters, and topics...')

  for (const [courseIdStr, modules] of Object.entries(SYLLABUS_MAP)) {
    const courseId = Number(courseIdStr)
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      console.log(`⚠️ Course ID ${courseId} not found in database, skipping.`)
      continue
    }

    console.log(`\n📚 Processing Course ID ${courseId}: "${course.title}" with ${modules.length} modules...`)

    // Delete existing old dummy modules for this course
    await prisma.module.deleteMany({ where: { courseId } })

    // Create new rich modules, chapters, and topics
    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      const mod = modules[mIdx]
      const createdModule = await prisma.module.create({
        data: {
          courseId,
          title: mod.title,
          description: mod.description || null,
          sortOrder: mIdx + 1,
        },
      })

      for (let cIdx = 0; cIdx < mod.chapters.length; cIdx++) {
        const chap = mod.chapters[cIdx]
        const createdChapter = await prisma.chapter.create({
          data: {
            moduleId: createdModule.id,
            title: chap.title,
            sortOrder: cIdx + 1,
          },
        })

        for (let tIdx = 0; tIdx < chap.topics.length; tIdx++) {
          const topicTitle = chap.topics[tIdx]
          await prisma.topic.create({
            data: {
              chapterId: createdChapter.id,
              title: topicTitle,
              sortOrder: tIdx + 1,
            },
          })
        }
      }
      console.log(`  ✅ Created: ${mod.title} (${mod.chapters.reduce((sum, ch) => sum + ch.topics.length, 0)} topics)`)
    }
  }

  console.log('\n🎉 Successfully updated all course curriculums in database!')
}

seedCurriculum()
  .catch((e) => {
    console.error('Error seeding curriculum:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
