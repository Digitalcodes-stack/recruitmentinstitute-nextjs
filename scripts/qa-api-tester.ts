import 'dotenv/config'

const BASE = 'http://localhost:3000'

interface TestResult {
  id: string
  module: string
  testCase: string
  passed: boolean
  status: number
  error?: string
  details?: any
}

const results: TestResult[] = []

async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  let data: any = null
  const text = await res.text()
  try {
    data = JSON.parse(text)
  } catch {
    data = text.slice(0, 300)
  }
  return { res, status: res.status, data, headers: res.headers }
}

async function runQATests() {
  console.log('=== STARTING QA API AUTOMATION SUITE ===\n')

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & ACCESS CONTROL
  // -------------------------------------------------------------
  console.log('--- 1. Testing Authentication ---')

  // 1.1 Admin Login with valid credentials
  const adminLogin = await request('/api/auth/admin', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@recruitmentinstitute.com', password: 'Admin@123' }),
  })
  const adminCookie = adminLogin.res.headers.get('set-cookie') || ''
  results.push({
    id: 'AUTH-01',
    module: 'Authentication',
    testCase: 'Admin Login with valid credentials',
    passed: adminLogin.status === 200 && adminLogin.data?.success === true,
    status: adminLogin.status,
    details: adminLogin.data,
  })

  // 1.2 Admin Login with invalid credentials
  const adminInvalid = await request('/api/auth/admin', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@recruitmentinstitute.com', password: 'WrongPassword' }),
  })
  results.push({
    id: 'AUTH-02',
    module: 'Authentication',
    testCase: 'Admin Login rejection with invalid credentials',
    passed: adminInvalid.status === 401,
    status: adminInvalid.status,
    details: adminInvalid.data,
  })

  // 1.3 Legacy MD5 Admin Login check
  const legacyAdminLogin = await request('/api/auth/admin', {
    method: 'POST',
    body: JSON.stringify({ email: 'vishal@montekservices.in', password: 'password' }),
  })
  results.push({
    id: 'AUTH-03',
    module: 'Authentication',
    testCase: 'Legacy MD5 Admin accounts cannot authenticate (bcrypt mismatch)',
    passed: legacyAdminLogin.status === 401, // Expected to fail due to bcrypt vs md5
    status: legacyAdminLogin.status,
    details: legacyAdminLogin.data,
  })

  // 1.4 Trainer Login with valid credentials
  const trainerLogin = await request('/api/auth/trainer/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'brahmita.nayak@institute.com', password: 'Trainer@123' }),
  })
  const trainerCookie = trainerLogin.res.headers.get('set-cookie') || ''
  results.push({
    id: 'AUTH-04',
    module: 'Authentication',
    testCase: 'Trainer Login with valid credentials',
    passed: trainerLogin.status === 200 && trainerLogin.data?.success === true,
    status: trainerLogin.status,
    details: trainerLogin.data,
  })

  // 1.5 Student Login with valid credentials
  const studentLogin = await request('/api/auth/student/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya.sharma@gmail.com', password: 'Student@123' }),
  })
  const studentCookie = studentLogin.res.headers.get('set-cookie') || ''
  results.push({
    id: 'AUTH-05',
    module: 'Authentication',
    testCase: 'Student Login with valid credentials',
    passed: studentLogin.status === 200 && studentLogin.data?.success === true,
    status: studentLogin.status,
    details: studentLogin.data,
  })

  // 1.6 Student Registration (Duplicate check)
  const studentDupReg = await request('/api/auth/student/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      password: 'NewPassword123',
    }),
  })
  results.push({
    id: 'AUTH-06',
    module: 'Authentication',
    testCase: 'Student Registration prevents duplicate email',
    passed: studentDupReg.status === 409,
    status: studentDupReg.status,
    details: studentDupReg.data,
  })

  // 1.7 Forgot Password API with unknown email
  const forgotUnknown = await request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: 'nonexistentuser99999@test.com' }),
  })
  results.push({
    id: 'AUTH-07',
    module: 'Authentication',
    testCase: 'Forgot Password with non-existent email',
    passed: forgotUnknown.status === 200 || forgotUnknown.status === 404,
    status: forgotUnknown.status,
    details: forgotUnknown.data,
  })

  // 1.8 Reset Password API with invalid token
  const resetInvalid = await request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token: 'fake-token-12345', password: 'NewPassword@123' }),
  })
  results.push({
    id: 'AUTH-08',
    module: 'Authentication',
    testCase: 'Reset Password rejects invalid token',
    passed: resetInvalid.status === 400 || resetInvalid.status === 404,
    status: resetInvalid.status,
    details: resetInvalid.data,
  })

  // -------------------------------------------------------------
  // 2. UNAUTHORIZED ACCESS PROTECTION (RBAC)
  // -------------------------------------------------------------
  console.log('--- 2. Testing Access Control & RBAC ---')

  // 2.1 Unauthenticated access to Admin API
  const unauthAdminApi = await request('/api/admin/courses')
  results.push({
    id: 'RBAC-01',
    module: 'Access Control',
    testCase: 'Unauthenticated access to /api/admin/courses blocked',
    passed: unauthAdminApi.status === 401,
    status: unauthAdminApi.status,
    details: unauthAdminApi.data,
  })

  // 2.2 Student token accessing Admin API
  const studentToAdminApi = await request('/api/admin/courses', {
    headers: { Cookie: studentCookie },
  })
  results.push({
    id: 'RBAC-02',
    module: 'Access Control',
    testCase: 'Student role blocked from accessing /api/admin/courses',
    passed: studentToAdminApi.status === 401 || studentToAdminApi.status === 403,
    status: studentToAdminApi.status,
    details: studentToAdminApi.data,
  })

  // 2.3 Trainer token accessing Admin API
  const trainerToAdminApi = await request('/api/admin/courses', {
    headers: { Cookie: trainerCookie },
  })
  results.push({
    id: 'RBAC-03',
    module: 'Access Control',
    testCase: 'Trainer role blocked from accessing /api/admin/courses',
    passed: trainerToAdminApi.status === 401 || trainerToAdminApi.status === 403,
    status: trainerToAdminApi.status,
    details: trainerToAdminApi.data,
  })

  // 2.4 Unauthenticated access to Trainer API
  const unauthTrainerApi = await request('/api/trainer/batches')
  results.push({
    id: 'RBAC-04',
    module: 'Access Control',
    testCase: 'Unauthenticated access to /api/trainer/batches blocked',
    passed: unauthTrainerApi.status === 401,
    status: unauthTrainerApi.status,
    details: unauthTrainerApi.data,
  })

  // 2.5 Student accessing Trainer API
  const studentToTrainerApi = await request('/api/trainer/batches', {
    headers: { Cookie: studentCookie },
  })
  results.push({
    id: 'RBAC-05',
    module: 'Access Control',
    testCase: 'Student accessing /api/trainer/batches blocked',
    passed: studentToTrainerApi.status === 401 || studentToTrainerApi.status === 403,
    status: studentToTrainerApi.status,
    details: studentToTrainerApi.data,
  })

  // -------------------------------------------------------------
  // 3. ADMIN FUNCTIONALITY
  // -------------------------------------------------------------
  console.log('--- 3. Testing Admin Functionality ---')

  // 3.1 Admin Dashboard stats
  const adminStats = await request('/api/admin/stats', {
    headers: { Cookie: adminCookie },
  })
  results.push({
    id: 'ADM-01',
    module: 'Admin',
    testCase: 'Admin can fetch /api/admin/stats',
    passed: adminStats.status === 200,
    status: adminStats.status,
    details: typeof adminStats.data === 'object' ? Object.keys(adminStats.data) : adminStats.data,
  })

  // 3.2 Admin Courses List
  const adminCourses = await request('/api/admin/courses', {
    headers: { Cookie: adminCookie },
  })
  results.push({
    id: 'ADM-02',
    module: 'Admin',
    testCase: 'Admin can list courses via /api/admin/courses',
    passed: adminCourses.status === 200,
    status: adminCourses.status,
    details: Array.isArray(adminCourses.data) ? `Found ${adminCourses.data.length} courses` : adminCourses.data,
  })

  // 3.3 Admin Categories
  const adminCategories = await request('/api/admin/categories', {
    headers: { Cookie: adminCookie },
  })
  results.push({
    id: 'ADM-03',
    module: 'Admin',
    testCase: 'Admin can fetch categories via /api/admin/categories',
    passed: adminCategories.status === 200,
    status: adminCategories.status,
    details: Array.isArray(adminCategories.data) ? `Found ${adminCategories.data.length} categories` : adminCategories.data,
  })

  // 3.4 Admin Batches List
  const adminBatches = await request('/api/admin/batches', {
    headers: { Cookie: adminCookie },
  })
  results.push({
    id: 'ADM-04',
    module: 'Admin',
    testCase: 'Admin can list batches via /api/admin/batches',
    passed: adminBatches.status === 200,
    status: adminBatches.status,
    details: Array.isArray(adminBatches.data) ? `Found ${adminBatches.data.length} batches` : adminBatches.data,
  })

  // 3.5 Admin Generate Next Batch API
  const genNextBatch = await request('/api/admin/batches/generate-next', {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: JSON.stringify({}),
  })
  results.push({
    id: 'ADM-05',
    module: 'Admin',
    testCase: 'Admin Generate Next Batch API endpoint',
    passed: genNextBatch.status === 200 || genNextBatch.status === 201,
    status: genNextBatch.status,
    details: genNextBatch.data,
  })

  // 3.6 Admin Students List
  const adminStudents = await request('/api/admin/students', {
    headers: { Cookie: adminCookie },
  })
  results.push({
    id: 'ADM-06',
    module: 'Admin',
    testCase: 'Admin can list students via /api/admin/students',
    passed: adminStudents.status === 200,
    status: adminStudents.status,
    details: Array.isArray(adminStudents.data) ? `Found ${adminStudents.data.length} students` : adminStudents.data,
  })

  // 3.7 Admin Trainers List
  const adminTrainers = await request('/api/admin/trainers', {
    headers: { Cookie: adminCookie },
  })
  results.push({
    id: 'ADM-07',
    module: 'Admin',
    testCase: 'Admin can list trainers via /api/admin/trainers',
    passed: adminTrainers.status === 200,
    status: adminTrainers.status,
    details: Array.isArray(adminTrainers.data) ? `Found ${adminTrainers.data.length} trainers` : adminTrainers.data,
  })

  // -------------------------------------------------------------
  // 4. TRAINER FUNCTIONALITY
  // -------------------------------------------------------------
  console.log('--- 4. Testing Trainer Functionality ---')

  // 4.1 Trainer Batches List (Trainer ID 7 - Brahmita)
  const trainerBatches = await request('/api/trainer/batches', {
    headers: { Cookie: trainerCookie },
  })
  results.push({
    id: 'TRN-01',
    module: 'Trainer',
    testCase: 'Trainer can list their assigned batches via /api/trainer/batches',
    passed: trainerBatches.status === 200,
    status: trainerBatches.status,
    details: Array.isArray(trainerBatches.data) ? `Found ${trainerBatches.data.length} batches` : trainerBatches.data,
  })

  // 4.2 Trainer Sessions List
  const trainerSessions = await request('/api/trainer/sessions', {
    headers: { Cookie: trainerCookie },
  })
  results.push({
    id: 'TRN-02',
    module: 'Trainer',
    testCase: 'Trainer can list sessions via /api/trainer/sessions',
    passed: trainerSessions.status === 200,
    status: trainerSessions.status,
    details: Array.isArray(trainerSessions.data) ? `Found ${trainerSessions.data.length} sessions` : trainerSessions.data,
  })

  // 4.3 Trainer Syllabus PDF endpoint
  // Check if session exists
  let firstSessionId = 1
  if (Array.isArray(trainerSessions.data) && trainerSessions.data.length > 0) {
    firstSessionId = trainerSessions.data[0].id
  }
  const trainerPdf = await request(`/api/trainer/sessions/${firstSessionId}/syllabus-pdf`, {
    headers: { Cookie: trainerCookie },
  })
  results.push({
    id: 'TRN-03',
    module: 'Trainer',
    testCase: `Trainer can generate/download Syllabus PDF for session ${firstSessionId}`,
    passed: trainerPdf.status === 200,
    status: trainerPdf.status,
    details: trainerPdf.headers.get('content-type'),
  })

  // 4.4 Trainer Attendance Marking API
  const attendanceCheck = await request(`/api/trainer/sessions/${firstSessionId}/attendance`, {
    headers: { Cookie: trainerCookie },
  })
  results.push({
    id: 'TRN-04',
    module: 'Trainer',
    testCase: `Trainer can view/get session ${firstSessionId} attendance list`,
    passed: attendanceCheck.status === 200,
    status: attendanceCheck.status,
    details: attendanceCheck.data,
  })

  // -------------------------------------------------------------
  // 5. STUDENT FUNCTIONALITY
  // -------------------------------------------------------------
  console.log('--- 5. Testing Student Functionality ---')

  // 5.1 Student Profile
  const studentProfile = await request('/api/auth/me', {
    headers: { Cookie: studentCookie },
  })
  results.push({
    id: 'STU-01',
    module: 'Student',
    testCase: 'Student can fetch own session/profile via /api/auth/me',
    passed: studentProfile.status === 200,
    status: studentProfile.status,
    details: studentProfile.data,
  })

  // 5.2 Student Profile assessments / courses
  const studentAssessments = await request('/api/student/assessments', {
    headers: { Cookie: studentCookie },
  })
  results.push({
    id: 'STU-02',
    module: 'Student',
    testCase: 'Student assessments endpoint /api/student/assessments',
    passed: studentAssessments.status === 200,
    status: studentAssessments.status,
    details: studentAssessments.data,
  })

  // -------------------------------------------------------------
  // 6. REQUEST A CALL / VOICE AGENT
  // -------------------------------------------------------------
  console.log('--- 6. Testing Request a Call / AI Desk ---')

  // 6.1 Request a Call API validation (Empty body)
  const emptyCallReq = await request('/api/request-call', {
    method: 'POST',
    body: JSON.stringify({}),
  })
  results.push({
    id: 'VOICE-01',
    module: 'Request a Call',
    testCase: 'Request a call rejects empty request body with 400',
    passed: emptyCallReq.status === 400,
    status: emptyCallReq.status,
    details: emptyCallReq.data,
  })

  // 6.2 Request a call with valid format
  const validCallReq = await request('/api/request-call', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'QA Automated Tester',
      phone: '9876543210',
      preferredLanguage: 'English',
      sourcePage: '/ai-for-recruitment',
    }),
  })
  results.push({
    id: 'VOICE-02',
    module: 'Request a Call',
    testCase: 'Request a call initiates successfully or returns structured response',
    passed: validCallReq.status === 200 || validCallReq.status === 201,
    status: validCallReq.status,
    details: validCallReq.data,
  })

  // -------------------------------------------------------------
  // 7. PUBLIC PAGES AVAILABILITY
  // -------------------------------------------------------------
  console.log('--- 7. Testing Public Pages Availability ---')
  const pagesToTest = [
    '/',
    '/ai-for-recruitment',
    '/recruitment-business-accelerator',
    '/courses',
    '/about',
    '/contact',
    '/trainers',
    '/fees',
    '/blogs',
    '/knowledge',
    '/community',
    '/student-login',
    '/candidate-login',
    '/membership-login',
    '/sitemap.xml',
    '/sitemap-blogs.xml',
    '/robots.txt',
  ]

  for (const p of pagesToTest) {
    const pageRes = await request(p)
    results.push({
      id: `PAGE-${p.replace(/[^a-zA-Z0-9]/g, '_')}`,
      module: 'Public Pages',
      testCase: `Route ${p} returns HTTP 200`,
      passed: pageRes.status === 200,
      status: pageRes.status,
      details: pageRes.status === 200 ? 'OK' : `Returned status ${pageRes.status}`,
    })
  }

  console.log('\n=== TEST RESULTS SUMMARY ===\n')
  let passedCount = 0
  let failedCount = 0
  for (const r of results) {
    const mark = r.passed ? '✓ PASS' : '✗ FAIL'
    if (r.passed) passedCount++
    else failedCount++
    console.log(`[${mark}] ${r.id}: ${r.testCase} (${r.status})`)
    if (!r.passed) {
      console.log('   Details:', r.details)
    }
  }
  console.log(`\nTotal: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`)
}

runQATests()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Fatal error in QA tests:', e)
    process.exit(1)
  })
