export interface RecruitmentTemplate {
  id: string
  title: string
  slug: string
  category: 'Calculators' | 'Templates' | 'Practical Tools'
  format: 'Word & Google Docs' | 'Excel Spreadsheet' | 'PDF Checklist' | 'Email Swipe File' | 'Legal Contract' | 'Interactive Tool'
  summary: string
  highlights: string[]
  tags: string[]
  downloadFileName?: string
  fullContent: string
  emailSubject: string
  whatsappSnippet: string
}

export const RECRUITMENT_TEMPLATES: RecruitmentTemplate[] = [
  {
    id: 'tmpl-01',
    title: 'Standard Offer Letter & Candidate Pre-Joining Kit',
    slug: 'offer-letter-prejoining-kit',
    category: 'Templates',
    format: 'Word & Google Docs',
    summary: 'Comprehensive corporate offer letter with CTC breakdown annexure (Basic, HRA, PF, Gratuity), probation clauses, confidentiality NDA, and a pre-joining engagement checklist.',
    highlights: [
      'Complete CTC Annexure calculation table (Gross vs Net)',
      '90-day probation & 30-day notice period clauses',
      'Confidentiality, IPR & Non-Solicitation standard terms',
      'Pre-joining candidate engagement touchpoints checklist'
    ],
    tags: ['Offer Letter', 'HR Operations', 'Candidate Joining', 'CTC Annexure'],
    downloadFileName: 'RecruitmentInstitute_Standard_Offer_Letter_Kit.docx',
    emailSubject: 'Enclosed: Standard Offer Letter & Candidate Pre-Joining Kit — Recruitment Institute',
    whatsappSnippet: 'Here is your Standard Offer Letter & Pre-Joining Kit from Recruitment Institute.',
    fullContent: `================================================================================
RECRUITMENT INSTITUTE — CORPORATE OFFER LETTER & CANDIDATE PRE-JOINING KIT
================================================================================

[Date]
[Candidate Name]
[Address]
[Contact Number]
[Email Address]

SUBJECT: OFFER OF EMPLOYMENT — [DESIGNATION]

Dear [Candidate Name],

On behalf of [Company Name], we are delighted to offer you the position of [Job Title] within our [Department Name] team, based at our [City / Office Location] office.

We were thoroughly impressed by your domain expertise, problem-solving skills, and alignment with our organizational values during the interview rounds.

Key details of your employment are summarized below:

1. DESIGNATION & REPORTING
- Position: [Job Title]
- Department: [Department Name]
- Reporting To: [Reporting Manager Name & Designation]
- Employment Type: Full-Time, Permanent
- Proposed Date of Joining: [Date of Joining]

2. COMPENSATION & BENEFITS
Your Total Annual Cost to Company (CTC) will be INR [Amount in Figures]/- (Rupees [Amount in Words] Only). A detailed breakdown of your monthly salary components and statutory deductions is specified in Annexure-A attached hereto.

3. PROBATION & CONFIRMATION
You will be on probation for an initial period of [3 / 6] months from your date of joining. Upon successful completion of probation and performance appraisal, your employment will be formally confirmed in writing.

4. NOTICE PERIOD
During probation, either party may terminate the employment by giving [15 / 30] days' written notice or salary in lieu thereof. Post-confirmation, the notice period shall be [60 / 90] days.

5. CODE OF CONDUCT & NON-SOLICITATION
During your tenure and for a period of 12 months post-cessation, you shall not directly or indirectly solicit any clients, vendors, or employees of the company.

--------------------------------------------------------------------------------
ANNEXURE-A: CTC STRUCTURE (COMPENSATION BREAKDOWN)
--------------------------------------------------------------------------------
Components                     Monthly (INR)      Annual (INR)
--------------------------------------------------------------------------------
A. Fixed Components:
- Basic Salary (40-50% of CTC)  [Amount]           [Amount]
- House Rent Allowance (HRA)    [Amount]           [Amount]
- Special / Flexible Allowance  [Amount]           [Amount]
- Conveyance Allowance          [Amount]           [Amount]
Gross Salary (A)                [Amount]           [Amount]

B. Retirals & Statutory:
- Employer PF Contribution      [Amount]           [Amount]
- Statutory Gratuity Provision  [Amount]           [Amount]
Total Retirals (B)              [Amount]           [Amount]

Total CTC (A + B)               [Amount]           [Amount]

Deductions (Employee PF, PT, TDS): As per applicable statutory norms.

--------------------------------------------------------------------------------
PRE-JOINING CANDIDATE DROP-OFF PREVENTION CHECKLIST (FOR RECRUITERS)
--------------------------------------------------------------------------------
[ ] Day 1: Send congratulations call + formal offer letter within 24 hours.
[ ] Day 3: Verify signed offer acceptance & resignation proof from previous employer.
[ ] Day 7: Connect candidate with future team buddy / reporting manager for coffee chat.
[ ] Day 14: Send welcome gift hamper / company swag kit to candidate's home.
[ ] Day 21: Check-in on notice period handover progress & counter-offer status.
[ ] Day 28: Share Day 1 onboarding itinerary, IT setup instructions, and office dress code.
[ ] Day 30: Personal welcome call at 9:00 AM on Day 1.

Warm regards,

[Authorized Signatory Name]
Head of Talent Acquisition & HR
[Company Name]`
  },
  {
    id: 'tmpl-02',
    title: 'Candidate Rejection & Nurture Email Swipe File (8 Templates)',
    slug: 'candidate-email-swipe-file',
    category: 'Templates',
    format: 'Email Swipe File',
    summary: '8 battle-tested, warm, and respectful email scripts covering resume rejection, post-interview feedback, offer letter counter-negotiation, and talent pool re-engagement.',
    highlights: [
      'Protects employer brand & prevents negative Glassdoor reviews',
      'Constructive feedback rejection script for final round candidates',
      'Silver medalist talent pool nurture email sequence',
      'Salary expectation mismatch bridge template'
    ],
    tags: ['Email Templates', 'Candidate Experience', 'Employer Brand', 'Outreach'],
    downloadFileName: 'RecruitmentInstitute_Candidate_Email_Swipe_File.docx',
    emailSubject: 'Enclosed: Candidate Rejection & Nurture Email Swipe File — Recruitment Institute',
    whatsappSnippet: 'Here is the 8-Template Candidate Email Swipe File from Recruitment Institute.',
    fullContent: `================================================================================
CANDIDATE REJECTION & TALENT NURTURE EMAIL SWIPE FILE (8 TEMPLATES)
================================================================================

TEMPLATE 1: RESUME SCREENING REJECTION (WARM & RESPECTFUL)
Subject: Update on your application for [Job Title] at [Company Name]

Hi [Candidate First Name],

Thank you so much for taking the time to apply for the [Job Title] role at [Company Name]. 

We reviewed your background and resume with our hiring team. While your qualifications and experience are impressive, we have decided to proceed with candidates whose skill sets more closely match the specific technical requirements for this immediate opening.

We truly appreciate your interest in [Company Name]. We will keep your profile in our active talent network and reach out proactively if a relevant opportunity opens up in the future.

Wishing you every success in your ongoing job search.

Warm regards,
[Recruiter Name]
Talent Acquisition Team, [Company Name]

--------------------------------------------------------------------------------
TEMPLATE 2: POST-INTERVIEW REJECTION WITH CONSTRUCTIVE APPRECIATION
Subject: Your interview for [Job Title] at [Company Name]

Hi [Candidate First Name],

Thank you for investing your time and energy to meet with [Interviewer Names] for the [Job Title] position. We truly enjoyed learning about your background, particularly your work on [Specific project mentioned during interview].

This was an exceptionally competitive cohort, and while your domain strengths stood out, the panel decided to move forward with a candidate who has deeper hands-on expertise in [Specific Skill, e.g. large-scale microservices architecture].

We were genuinely impressed by your communication and culture fit. If you are open to it, we would love to stay connected on LinkedIn and consider you for upcoming senior openings next quarter.

Best regards,
[Recruiter Name]

--------------------------------------------------------------------------------
TEMPLATE 3: THE "SILVER MEDALIST" TALENT POOL NURTURE SCRIPT
Subject: Staying connected — [Company Name] Talent Community

Hi [Candidate First Name],

I wanted to follow up on our recent interview process for [Job Title]. While we ended up hiring another finalist for this exact position, you were one of our top 2 candidates and our leadership team was incredibly impressed by you.

We are growing rapidly and anticipate opening similar senior roles over the next 3 to 6 months. With your permission, I would like to keep your contact details handy so you have first priority when our next headcount is approved.

Let's also connect on LinkedIn: [Your LinkedIn Profile URL].

Thank you once again for your professionalism throughout.

Warmly,
[Recruiter Name]

--------------------------------------------------------------------------------
TEMPLATE 4: CANDIDATE GHOSTING REACTIVATION / NUDGE
Subject: Quick check-in regarding [Job Title] at [Company Name]

Hi [Candidate First Name],

I hope you are having a productive week!

I know how busy things can get, so I wanted to gently follow up on my previous note regarding the [Job Title] opportunity at [Company Name].

Our hiring manager is very keen to discuss your experience with [Key Tech Stack / Skill]. If you are still exploring new career opportunities, could you let me know if a quick 10-minute call this Thursday or Friday works for your schedule?

If the timing isn't right, no problem at all — please feel free to let me know!

Best regards,
[Recruiter Name]

--------------------------------------------------------------------------------
TEMPLATE 5: OFFER LETTER ROLLOUT & CONGRATULATIONS
Subject: Offer of Employment: [Job Title] at [Company Name] 🎉

Hi [Candidate First Name],

We have some fantastic news! Following your interview rounds, our leadership team is thrilled to formally extend an offer for the position of [Job Title] at [Company Name].

We believe your experience with [Key Competency] and your energy will make a tremendous impact on our upcoming milestones.

Please find attached your formal Offer Letter along with the detailed compensation annexure (Annexure-A). Kindly review, sign, and share a scanned copy with us by [Due Date, e.g., Friday at 5:00 PM].

If you have any questions about the salary structure, benefits, or your joining date, please feel free to call me directly at [Phone Number].

Congratulations once again — we cannot wait to welcome you to the team!

Warm regards,
[Recruiter Name]`
  },
  {
    id: 'tmpl-03',
    title: 'Agency Master Service Agreement (MSA) & SLA Contract Draft',
    slug: 'agency-msa-sla-contract-sample',
    category: 'Templates',
    format: 'Legal Contract',
    summary: 'A vetted recruitment agreement draft covering candidate ownership periods, 90-day replacement policy, credit payment terms (30/45 days), GST statutory clauses, and non-solicitation for Indian recruitment firms.',
    highlights: [
      'Standard 8.33% to 15% agency commission structures',
      '6-month candidate CV ownership protection clause',
      '90-day replacement guarantee & credit note terms',
      'Vetted for Indian Contract Act & GST statutory compliance'
    ],
    tags: ['Legal Contract', 'Staffing Agency', 'MSA', 'Recruitment Business'],
    downloadFileName: 'RecruitmentInstitute_Agency_MSA_Contract_Sample.docx',
    emailSubject: 'Enclosed: Recruitment Agency Master Service Agreement (MSA) — Recruitment Institute',
    whatsappSnippet: 'Here is the Agency Master Service Agreement (MSA) contract draft from Recruitment Institute.',
    fullContent: `================================================================================
MASTER RECRUITMENT SERVICES AGREEMENT (MSA & SLA)
================================================================================

This Master Services Agreement ("Agreement") is made and entered into on this [Date] day of [Month], [Year] ("Effective Date") by and between:

FIRST PARTY: [Agency Name / Staffing Firm Name], a recruitment firm having its principal place of business at [Agency Address] (hereinafter referred to as the "Agency / Service Provider");

AND

SECOND PARTY: [Client Company Name], a company incorporated under the Companies Act with its registered office at [Client Address] (hereinafter referred to as the "Client / Company").

1. SCOPE OF SERVICES
The Agency agrees to act as a talent search partner to source, screen, and present qualified candidates for vacancies communicated by the Client.

2. PROFESSIONAL PLACEMENT FEES
2.1 For each candidate successfully placed by the Agency and hired by the Client, the Client shall pay a professional recruitment fee computed as:
    - Junior / Mid-Level Positions: [8.33%] of Annual Fixed CTC
    - Senior / Niche Positions: [10.0% to 12.5%] of Annual Fixed CTC
    - Leadership / Executive Search: [15.0%] of Annual Fixed CTC
2.2 The term "Annual CTC" includes basic pay, allowances, and guaranteed fixed bonuses. Variable incentives, stock options, and retention bonuses are excluded.
2.3 GST @ 18% (or prevailing rate) shall be charged extra on all invoiced fees.

3. INVOICING & PAYMENT TERMS
3.1 The Agency shall raise an invoice on the date of candidate joining.
3.2 The Client agrees to clear all invoices within [30 / 45] calendar days from the invoice date. Late payments beyond 45 days shall attract interest @ 1.5% per month.

4. CANDIDATE OWNERSHIP (VALIDITY PERIOD)
4.1 Any candidate profile / CV submitted by the Agency shall remain the exclusive property of the Agency for a period of six (6) months from the date of submission.
4.2 If the Client hires any candidate submitted by the Agency within this 6-month period for any role whatsoever, the full placement fee shall become immediately payable.

5. REPLACEMENT POLICY (90-DAY GUARANTEE)
5.1 If a candidate voluntarily resigns or is terminated for misconduct within ninety (90) days from joining:
    a) The Agency shall provide one (1) free replacement candidate for the same role and CTC band within 45 days.
    b) If the Agency is unable to provide a suitable replacement within 45 days, the Agency shall issue a Credit Note for the full invoiced amount, adjustable against future hiring mandates.
5.2 Replacement guarantee is strictly conditional upon the Client having cleared the original invoice within the stipulated 30-day payment term.

6. NON-SOLICITATION & CONFIDENTIALITY
Neither party shall directly or indirectly solicit for employment any employee of the other party during the term of this Agreement and for twelve (12) months thereafter.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement by their duly authorized representatives:

For [Agency Name]:                   For [Client Company Name]:
Signature: _______________________    Signature: _______________________
Name: [Agency Founder / Director]     Name: [Authorized HR / Director]
Date: [Date]                          Date: [Date]`
  },
  {
    id: 'tmpl-04',
    title: 'Master Job Description (JD) Pack — 50+ Roles (Tech & Non-Tech)',
    slug: 'master-jd-templates',
    category: 'Templates',
    format: 'Word & Google Docs',
    summary: 'Standardized job description templates for high-demand IT, Non-IT, and Corporate roles with skill rubrics, key result areas (KRAs), experience bands, and compensation ranges.',
    highlights: [
      'Tech: Full Stack Java, Python, React, DevOps, AWS Cloud Architect, Data Engineer',
      'Non-Tech: HR Generalist, Talent Acquisition Specialist, IT Recruiter, Business Development',
      'SEO-optimized bullet points ready for Naukri, LinkedIn Jobs, and Indeed',
      'Detailed screening criteria & mandatory must-have questions'
    ],
    tags: ['Job Descriptions', 'JD Templates', 'Sourcing', 'Hiring'],
    downloadFileName: 'RecruitmentInstitute_Master_JD_Pack_50_Roles.docx',
    emailSubject: 'Enclosed: Master Job Description (JD) Pack (50+ Roles) — Recruitment Institute',
    whatsappSnippet: 'Here is the Master Job Description (JD) Pack with 50+ roles from Recruitment Institute.',
    fullContent: `================================================================================
MASTER JOB DESCRIPTION (JD) TEMPLATES PACK — TOP ROLES
================================================================================

ROLE 1: SENIOR FULL STACK DEVELOPER (JAVA + REACT)
- Designation: Senior Software Engineer / Lead Developer
- Experience: 4 - 8 Years
- Location: Pune / Bengaluru / Hybrid
- Employment Type: Full-Time

ROLE SUMMARY:
We are seeking an experienced Senior Full Stack Engineer to architect, build, and deploy mission-critical, high-throughput cloud applications. You will collaborate with product designers, DevOps leads, and QA architects to deliver high-quality code.

KEY RESPONSIBILITIES:
- Design and implement resilient RESTful microservices using Java 17+, Spring Boot, and Hibernate.
- Develop responsive, accessible, and high-performance front-end interfaces using React 18+, Next.js, and TypeScript.
- Design database schemas and optimize query execution on PostgreSQL and Redis cache layers.
- Build automated unit and integration tests using JUnit, Mockito, and Jest (>80% code coverage).
- Deploy containerized services on Kubernetes / Docker using GitLab CI/CD pipelines on AWS.

MANDATORY TECHNICAL REQUIREMENTS:
- 4+ years of core Java / Spring Boot development experience.
- 3+ years of modern React.js with Redux Toolkit / React Query and Tailwind CSS.
- Strong SQL proficiency (PostgreSQL / MySQL) with query optimization & indexing knowledge.
- Hands-on experience with Docker, CI/CD, and Git workflow.

SCREENING KNOCKOUT QUESTIONS FOR RECRUITERS:
1. "What is your current hands-on ratio between Front-end (React) and Back-end (Spring Boot)?"
2. "Explain how you handle state management and caching across microservices."
3. "What is your official notice period and current / expected CTC?"

--------------------------------------------------------------------------------
ROLE 2: TALENT ACQUISITION SPECIALIST (IT RECRUITER)
- Designation: IT Recruiter / Talent Acquisition Executive
- Experience: 2 - 5 Years
- Industry: Staffing & Recruiting / Corporate TA

ROLE SUMMARY:
Join our fast-paced hiring team to drive 360-degree technical recruitment across Java, Cloud, DevOps, and Data Science domains. You will be responsible for sourcing, screening, candidate engagement, and client stakeholder management.

KEY RESPONSIBILITIES:
- Source high-quality passive candidate profiles using LinkedIn Recruiter, Naukri, GitHub, and Boolean X-Ray searches.
- Conduct thorough initial telephonic screens assessing candidate CTC, notice period, tech competency, and culture alignment.
- Schedule and coordinate technical interviews with internal hiring managers or client panels.
- Build and maintain candidate pipelines for continuous fulfillment of monthly hiring targets (4-6 joinees/month).
- Extend formal job offers, handle counter-offer negotiations, and conduct regular pre-joining check-ins to prevent drop-offs.

MUST-HAVE COMPETENCIES:
- Solid grasp of IT terminologies (frontend, backend, cloud, frameworks, architectures).
- Expert level Boolean search syntax skills on Google and job boards.
- Proven track record of closing 4+ IT positions per month.`
  },
  {
    id: 'tmpl-05',
    title: 'Boolean Search String Generator & Recruiter Cheat Sheet',
    slug: 'boolean-search-cheat-sheet',
    category: 'Practical Tools',
    format: 'PDF Checklist',
    summary: 'A definitive reference guide for Boolean search syntax, Google X-Ray operators, and ready-to-paste search strings for LinkedIn, GitHub, Behance, and Indian job boards.',
    highlights: [
      'Master operators: AND, OR, NOT, Quotation Marks, Parentheses',
      'Google X-Ray strings to bypass LinkedIn Commercial Use Limits',
      'Direct GitHub, StackOverflow, and Behance sourcing syntax',
      'City-wise & Notice Period filter strings for Naukri and Monster'
    ],
    tags: ['Boolean Search', 'Sourcing', 'LinkedIn X-Ray', 'Headhunting'],
    downloadFileName: 'RecruitmentInstitute_Boolean_Search_CheatSheet.pdf',
    emailSubject: 'Enclosed: Boolean Search String Cheat Sheet — Recruitment Institute',
    whatsappSnippet: 'Here is your Boolean Search String Generator & Cheat Sheet from Recruitment Institute.',
    fullContent: `================================================================================
BOOLEAN SEARCH STRING CHEAT SHEET & GOOGLE X-RAY OPERATORS
================================================================================

1. CORE OPERATORS RULES
- AND: Both keywords must appear. Example: "Java" AND "Spring Boot"
- OR: Either keyword can appear. Example: ("React" OR "ReactJS" OR "React.js")
- NOT / (-): Excludes keywords. Example: "Java" NOT "JavaScript" (or "Java" -JavaScript)
- QUOTES (" "): Exact phrase matching. Example: "Talent Acquisition Specialist"
- PARENTHESES ( ): Groups related terms logically. Example: (Python OR Django) AND (AWS OR Docker)

--------------------------------------------------------------------------------
2. GOOGLE X-RAY SEARCH STRINGS (BYPASS LINKEDIN LIMITS)
Run these directly in Google Search bar:

A. Full Stack Java Developers in Pune / Bengaluru:
site:linkedin.com/in ("Java" OR "Spring Boot") AND ("React" OR "ReactJS") AND ("Pune" OR "Bangalore" OR "Bengaluru") -intitle:jobs -intitle:profiles

B. DevOps & Kubernetes Engineers with immediate notice:
site:linkedin.com/in ("DevOps" OR "SRE") AND ("Kubernetes" OR "K8s") AND ("AWS" OR "Azure") AND ("immediate" OR "15 days" OR "serving notice")

C. Senior IT Recruiters in India:
site:linkedin.com/in ("IT Recruiter" OR "Technical Recruiter") AND ("Boolean" OR "Headhunting") AND ("India" OR "Mumbai" OR "Hyderabad")

--------------------------------------------------------------------------------
3. GITHUB SOURCING STRINGS
Find active open-source contributors with verified email addresses:

site:github.com "joined on" ("location * Pune" OR "location * Bangalore") "followers" ("react" OR "python")

--------------------------------------------------------------------------------
4. NAUKRI RESUME DATABASE OPTIMIZATION STRINGS
Paste in Naukri IT Search bar:

Keywords: (Java OR "Spring Boot" OR Spring) AND (React OR ReactJS OR Angular) AND (Postgres OR MySQL OR Oracle)
Experience: 3 to 6 Years
Location: Pune, Mumbai
Notice Period: 0 - 15 Days, 1 Month (Exclude 90 Days)`
  },
  {
    id: 'tmpl-06',
    title: 'Daily Recruiter Productivity & Calling Tracker (Excel/Sheets)',
    slug: 'recruiter-productivity-calling-tracker',
    category: 'Practical Tools',
    format: 'Excel Spreadsheet',
    summary: 'A structured daily recruiter tracker framework tracking calls made, connected conversations, CVs sourced, submittals, interviews scheduled, and joining pipeline.',
    highlights: [
      'Daily 50-60 call target tracking with conversion ratios',
      'Pipeline status visualization (Sourced -> Screened -> Offered)',
      'Automated formulas for submittal-to-interview percentage',
      'Ideal for staffing agency owners & corporate TA leads'
    ],
    tags: ['Recruiter Tracker', 'KPIs', 'Productivity', 'Daily Reporting'],
    downloadFileName: 'RecruitmentInstitute_Daily_Recruiter_Tracker.xlsx',
    emailSubject: 'Enclosed: Daily Recruiter Productivity Tracker — Recruitment Institute',
    whatsappSnippet: 'Here is your Daily Recruiter Productivity & Calling Tracker from Recruitment Institute.',
    fullContent: `================================================================================
DAILY RECRUITER PRODUCTIVITY & CALLING TRACKER FRAMEWORK
================================================================================

DAILY KPI TARGET BENCHMARKS FOR INDIAN IT RECRUITERS:
- Dials / Outreach Calls: 50 - 60 per day
- Connected Candidate Conversations: 18 - 25 per day
- Screened Profiles Sourced: 8 - 12 per day
- CV Submissions to Hiring Manager/Client: 3 - 5 per day
- First-Round Interviews Scheduled: 1 - 2 per day
- Monthly Joining Target: 3 - 5 joinees

SPREADSHEET COLUMNS STRUCTURE:
1. Date (DD/MM/YYYY)
2. Candidate Full Name
3. Contact Number & Email ID
4. Sourced From (Naukri / LinkedIn / Reference / Database)
5. Current Company & Designation
6. Total Experience (Years) / Relevant Experience
7. Current CTC (LPA) / In-Hand Monthly
8. Expected CTC (LPA) / Negotiation Flexibility
9. Notice Period (Days) / Official Last Working Day (LWD)
10. Preferred Location / Relocation Willingness
11. Technical Screening Score (1 to 5)
12. Status: [Connected / Not Reachable / Screened / Submitted / L1 Scheduled / Offer Extended / Joined / Dropped]
13. Remarks & Next Action Item

WEEKLY SUMMARY DASHBOARD FORMULAS:
- Call Connectivity Rate = (Total Connected Calls / Total Dials) * 100 [Target: >35%]
- Screening Conversion Rate = (Screened Profiles / Connected Calls) * 100 [Target: >40%]
- Submission to Interview Ratio = (L1 Scheduled / Profiles Submitted) * 100 [Target: >50%]
- Offer to Joiner Ratio = (Actual Joiners / Offers Rolled Out) * 100 [Target: >80%]`
  },
  {
    id: 'tmpl-07',
    title: 'Recruitment Agency Startup Blueprint & 30-Day Launch Checklist',
    slug: 'agency-startup-blueprint-checklist',
    category: 'Practical Tools',
    format: 'PDF Checklist',
    summary: 'A step-by-step roadmap for starting a profitable recruitment and staffing agency in India covering legal registration, portal packages, client outreach script, and ATS setup.',
    highlights: [
      'Legal & Tax Setup: Private Limited vs LLP vs Sole Prop, GST, MSME, Professional Tax',
      'Portal & Tech Stack: Naukri RESDEX negotiation, LinkedIn Recruiter, Free ATS tools',
      'Cold Client Outreach Framework & Cold Email Templates (High reply rate)',
      'First 90-Day Cash Flow & Revenue Projection Model'
    ],
    tags: ['Staffing Agency', 'Startup', 'Entrepreneurship', 'Business Blueprint'],
    downloadFileName: 'RecruitmentInstitute_Agency_Startup_Blueprint.pdf',
    emailSubject: 'Enclosed: Recruitment Agency Startup Blueprint — Recruitment Institute',
    whatsappSnippet: 'Here is your Recruitment Agency Startup Blueprint from Recruitment Institute.',
    fullContent: `================================================================================
RECRUITMENT AGENCY STARTUP BLUEPRINT — 30-DAY LAUNCH CHECKLIST
================================================================================

PHASE 1: ENTITY SETUP & STATUTORY COMPLIANCE (DAYS 1 - 7)
[ ] 1. Choose Business Structure:
    - Recommended for beginners: Sole Proprietorship / LLP (Low compliance cost).
    - Recommended for scaling: Private Limited Company (Easier for enterprise client MSAs).
[ ] 2. GST Registration: Mandatory for billing corporate clients.
[ ] 3. MSME / Udyam Registration (Free on Govt portal, provides banking benefits).
[ ] 4. Open Current Account with a leading commercial bank (HDFC / ICICI / Kotak).
[ ] 5. Obtain Professional Tax (PT) Registration & Shops & Establishment Act license.

PHASE 2: BRANDING, TECH STACK & ASSETS (DAYS 8 - 14)
[ ] 6. Buy Domain (.com / .in) and setup Google Workspace business email (e.g. founder@agency.com).
[ ] 7. Create sleek 1-page agency website highlighting your niche domain (IT / Healthcare / Finance).
[ ] 8. Procure Resume Database: Negotiate 3-month startup package on Naukri RESDEX.
[ ] 9. Setup Free ATS / CRM: Zoho Recruit (Free tier) or Recruit CR to organize candidate CVs.
[ ] 10. Prepare standard Agency Master Service Agreement (MSA) and Company Profile Pitch Deck.

PHASE 3: CLIENT ACQUISITION & OUTREACH (DAYS 15 - 25)
[ ] 11. Build a target list of 200 HR Heads / VP Talent Acquisition at funded startups & mid-sized IT firms.
[ ] 12. Launch cold outreach sequence (Email + LinkedIn connection + Follow-up call).
[ ] 13. Offer a "No-Risk Contingency" pilot: "Pay 8.33% only after candidate joins successfully with 90-day replacement."
[ ] 14. Sign your first 3 client MSAs and receive open job requisitions.

PHASE 4: SOURCING, CLOSURES & FIRST REVENUE (DAYS 26 - 30)
[ ] 15. Source 5 stellar candidate profiles per job opening using Boolean searches.
[ ] 16. Conduct 1st round screening calls and submit profiles within 48 hours of mandate receipt.
[ ] 17. Facilitate client interviews, offer rollout, and secure candidate joining.
[ ] 18. Issue first invoice + celebrate your first placement revenue! 🎉`
  },
  {
    id: 'tmpl-08',
    title: 'Candidate Sourcing & Screening Funnel Tracker',
    slug: 'sourcing-screening-funnel-tracker',
    category: 'Practical Tools',
    format: 'Excel Spreadsheet',
    summary: 'A metric-driven recruitment funnel tracker to identify stage-by-stage drop-offs from sourcing to screening, technical round, client interview, offer rollout, and joining.',
    highlights: [
      'Visual bottleneck detection: pinpoint where candidates fall off',
      'Benchmarked conversion percentages across IT hiring stages',
      'Time-to-hire & Time-to-fill metric calculations',
      'Client reporting format for monthly hiring reviews'
    ],
    tags: ['Funnel Tracker', 'Sourcing Analytics', 'Recruitment Metrics', 'Time to Hire'],
    downloadFileName: 'RecruitmentInstitute_Sourcing_Funnel_Tracker.xlsx',
    emailSubject: 'Enclosed: Candidate Sourcing & Funnel Tracker — Recruitment Institute',
    whatsappSnippet: 'Here is your Sourcing & Screening Funnel Tracker from Recruitment Institute.',
    fullContent: `================================================================================
CANDIDATE SOURCING & SCREENING FUNNEL TRACKER
================================================================================

INDUSTRY RECRUITMENT FUNNEL STAGES & HEALTHY BENCHMARKS:

Stage 1: Profiles Identified & Sourced: 100 Profiles (100%)
Stage 2: Reached Out & Contacted: 70 Candidates (70%)
Stage 3: Screened & Interested: 30 Candidates (30%)
Stage 4: Submitted to Hiring Manager / Client: 10 Profiles (10%)
Stage 5: Shortlisted for Technical Interview: 5 Candidates (5%)
Stage 6: Final Leadership Round: 2 Candidates (2%)
Stage 7: Offer Extended: 1.2 Candidates
Stage 8: Offer Accepted & Successfully Joined: 1 Candidate (1% overall yield)

COMMON LEAKAGES & FIXES:
- Drop between Stage 2 and Stage 3: Low compensation or unappealing JD. Review market salary band.
- Drop between Stage 4 and Stage 5: Recruiter not properly understanding tech stack requirements.
- Drop between Stage 7 and Stage 8: Counter-offer from current employer or delayed onboarding.

FORMULAS:
- Sourcing Conversion Rate = (Screened / Sourced) * 100
- Shortlist Ratio = (Shortlisted / Submitted) * 100 [Target: >50%]
- Offer Acceptance Rate = (Offers Accepted / Offers Rolled Out) * 100 [Target: >85%]`
  },
  {
    id: 'tmpl-09',
    title: 'Structured Competency Interview Scorecards & Rubrics',
    slug: 'interview-scorecards-rubrics',
    category: 'Templates',
    format: 'Excel Spreadsheet',
    summary: 'Objective 5-point evaluation scorecards mapped to communication, problem solving, culture fit, and domain skills to eliminate interviewer bias.',
    highlights: [
      'Eliminates subjective hiring manager biases',
      'Automated weighted score calculations',
      'Compliant with modern corporate HR audit standards',
      'Covers Behavioral STAR methodology evaluation questions'
    ],
    tags: ['Interview Scorecard', 'Evaluation Rubric', 'Competency Assessment', 'HR Audit'],
    downloadFileName: 'RecruitmentInstitute_Interview_Scorecard_Kit.xlsx',
    emailSubject: 'Enclosed: Structured Competency Interview Scorecards — Recruitment Institute',
    whatsappSnippet: 'Here is your Interview Scorecard & Rubrics Kit from Recruitment Institute.',
    fullContent: `================================================================================
STRUCTURED COMPETENCY INTERVIEW SCORECARDS & EVALUATION RUBRICS
================================================================================

SCORING SCALE (1 to 5):
1 - Unsatisfactory (Does not meet minimum requirements)
2 - Below Expectations (Significant gaps identified)
3 - Meets Expectations (Capable, meets role criteria)
4 - Exceeds Expectations (Strong competency demonstrated)
5 - Outstanding (Industry top percentile, role model)

EVALUATION COMPETENCY DIMENSIONS:

1. CORE DOMAIN TECHNICAL COMPETENCY (Weight: 35%)
- Depth of hands-on knowledge in core tech stack / function
- Architectural understanding and best practices
- Problem decomposition and solution design
Question: "Describe a complex technical challenge you solved recently. Walk us through your design choices."

2. PROBLEM SOLVING & ANALYTICAL THINKING (Weight: 25%)
- Logic structuring under ambiguous requirements
- Data-driven decision making
Question: "Tell us about a time when a critical project was falling behind deadline. How did you prioritize?"

3. COLLABORATION & STAKEHOLDER COMMUNICATION (Weight: 20%)
- Clarity of explanation without excessive jargon
- Conflict resolution and cross-functional team dynamics
Question: "Describe an instance where you disagreed with a manager or client requirement. How did you resolve it?"

4. CULTURE FIT & OWNERSHIP MINDSET (Weight: 20%)
- Adaptability, speed of execution, continuous learning
Question: "What new domain or skill have you picked up independently in the last 6 months?"

DECISION THRESHOLDS:
- Total Weighted Score >= 4.0: STRONG HIRE
- Total Weighted Score 3.2 - 3.9: HIRE (Subject to reference check)
- Total Weighted Score < 3.2: DO NOT HIRE / REJECT`
  },
  {
    id: 'tmpl-10',
    title: 'Cost-Per-Hire & Sourcing ROI Calculator (Excel Model)',
    slug: 'cost-per-hire-calculator',
    category: 'Calculators',
    format: 'Excel Spreadsheet',
    summary: 'Comprehensive spreadsheet model to calculate in-house recruitment team costs vs external recruitment agency fees, advertising costs, and time-to-fill losses.',
    highlights: [
      'Breakeven analysis for internal talent acquisition teams',
      'Job portal subscription ROI vs agency placement commission',
      'Includes hidden onboarding & vacancy loss calculations',
      'Pre-built formulas ready to present to CFO & HR Directors'
    ],
    tags: ['Cost Per Hire', 'ROI Calculator', 'Finance', 'Budgeting'],
    downloadFileName: 'RecruitmentInstitute_Cost_Per_Hire_Calculator.xlsx',
    emailSubject: 'Enclosed: Cost-Per-Hire & Sourcing ROI Calculator — Recruitment Institute',
    whatsappSnippet: 'Here is your Cost-Per-Hire & Sourcing ROI Calculator from Recruitment Institute.',
    fullContent: `================================================================================
COST-PER-HIRE & SOURCING ROI CALCULATOR (EXCEL MODEL)
================================================================================

FORMULA DEFINITION:
Cost Per Hire (CPH) = (Internal Recruitment Costs + External Recruitment Costs) / Total Number of Hires

INTERNAL COSTS (A):
- Recruiter Base Salaries + Bonuses: [Amount in INR]
- Talent Acquisition Manager Overhead: [Amount in INR]
- Referral Program Payouts: [Amount in INR]
- Interview Panel Time Cost (Hourly salary * interview hours): [Amount in INR]

EXTERNAL COSTS (B):
- Job Board Subscriptions (Naukri RESDEX, LinkedIn Recruiter, Indeed): [Amount in INR]
- External Staffing Agency Commissions paid: [Amount in INR]
- Background Verification (BGV) Agency Fees: [Amount in INR]
- Assessment Platform Licenses (HackerEarth / Mercer): [Amount in INR]
- Recruitment Advertising & Branding Campaigns: [Amount in INR]

BENCHMARK RANGES FOR INDIA:
- Freshers / Junior Hiring: ₹15,000 - ₹35,000 per hire
- Mid-Level IT Roles: ₹45,000 - ₹95,000 per hire
- Senior / Leadership Roles: ₹1,50,000 - ₹3,50,000 per hire

AGENCY VS IN-HOUSE BREAKEVEN MATRIX:
If your company hires fewer than 3 niche roles per quarter, outsourcing to a contingency agency on 8.33% fee is 42% more cost-effective than maintaining dedicated full-time recruiters and expensive portal licenses.`
  },
  {
    id: 'tmpl-11',
    title: 'Recruiter Incentive & Target Bonus Calculator (Excel Model)',
    slug: 'recruiter-incentive-calculator',
    category: 'Calculators',
    format: 'Excel Spreadsheet',
    summary: 'A structured incentive calculator for recruitment agencies and corporate TA teams featuring slab multipliers, billing splits, and quarterly overachievement kickers.',
    highlights: [
      'Standard 5% to 15% recruiter billing splits on collection',
      'Threshold minimum billing requirements before incentive kickers',
      'Quarterly performance bonuses for team leads and recruiters',
      'Pre-formatted formulas for monthly payroll computation'
    ],
    tags: ['Recruiter Incentives', 'Bonus Calculator', 'Staffing Agency', 'Payroll'],
    downloadFileName: 'RecruitmentInstitute_Recruiter_Incentive_Calculator.xlsx',
    emailSubject: 'Enclosed: Recruiter Incentive & Target Bonus Calculator — Recruitment Institute',
    whatsappSnippet: 'Here is your Recruiter Incentive & Bonus Calculator from Recruitment Institute.',
    fullContent: `================================================================================
RECRUITER INCENTIVE & TARGET BONUS CALCULATOR
================================================================================

STANDARD AGENCY INCENTIVE SLAB STRUCTURE (BASED ON NET REVENUE COLLECTED):

Threshold Rule: Recruiter must bill at least 3X their monthly CTC before incentive kicks in.
Example: If Recruiter Monthly CTC is ₹30,000, monthly billing threshold is ₹90,000.

MONTHLY INCENTIVE SLABS:
- Slab 1 (Billing ₹1,00,000 to ₹2,50,000): 5% of net collected revenue
- Slab 2 (Billing ₹2,50,001 to ₹5,00,000): 7.5% of net collected revenue
- Slab 3 (Billing ₹5,00,001 to ₹7,50,000): 10% of net collected revenue
- Slab 4 (Billing ₹7,50,001 & Above): 12.5% to 15% of net collected revenue

QUARTERLY KICKER BONUSES:
- Achieve 100% of Quarterly Target: Flat ₹15,000 bonus
- Achieve 120%+ of Quarterly Target: Flat ₹35,000 bonus + Trophy + Extra Leave Day

EXAMPLE CALCULATION:
- Candidate Placed: Senior Java Lead (CTC ₹24,00,000 @ 8.33% Fee)
- Gross Fee Invoiced: ₹2,00,000
- Recruiter Base Tier (7.5%): ₹15,000 incentive on this single closure!
- Paid on: 10th of following month post client fee collection.`
  }
]
