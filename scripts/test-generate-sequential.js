const https = require('https')

const loginData = JSON.stringify({ email: 'admin@institute.com', password: 'Admin@123' })

function generateCourse(cookieStr, course) {
  return new Promise((resolve) => {
    const genBody = JSON.stringify({
      course_id: course.id,
      name: course.name,
      question_types: ['mcq'],
      question_count: 10
    })

    const genReq = https.request({
      hostname: 'recruitmentinstitute-web-396924250862.asia-south1.run.app',
      path: '/api/admin/assessment/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStr,
        'Content-Length': Buffer.byteLength(genBody)
      }
    }, (genRes) => {
      let data = ''
      genRes.on('data', d => data += d)
      genRes.on('end', () => {
        console.log(`Course ${course.id} (${course.name}) Status:`, genRes.statusCode, data)
        resolve()
      })
    })
    genReq.write(genBody)
    genReq.end()
  })
}

async function run() {
  const req = https.request({
    hostname: 'recruitmentinstitute-web-396924250862.asia-south1.run.app',
    path: '/api/auth/admin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, async (res) => {
    const cookieStr = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ')
    console.log('Login Status:', res.statusCode)

    const courses = [
      { id: 1, name: 'Certification Courses Assessment' },
      { id: 2, name: 'Corporate Training Courses Assessment' },
      { id: 4, name: 'Entrepreneur Courses Assessment' }
    ]

    for (const c of courses) {
      console.log(`Starting generation for Course ${c.id}...`)
      await generateCourse(cookieStr, c)
    }
    console.log('All assessments generated!')
  })

  req.write(loginData)
  req.end()
}

run()
