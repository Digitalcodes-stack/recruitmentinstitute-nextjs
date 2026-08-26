const https = require('https')

const loginData = JSON.stringify({ email: 'admin@institute.com', password: 'Admin@123' })

const req = https.request({
  hostname: 'recruitmentinstitute-web-396924250862.asia-south1.run.app',
  path: '/api/auth/admin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  const cookieStr = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ')
  console.log('Login Status:', res.statusCode)

  // Generate assessment for courses 1, 2, 3, 4
  const courses = [
    { id: 1, name: 'Certification Courses Assessment' },
    { id: 2, name: 'Corporate Training Courses Assessment' },
    { id: 3, name: 'Degree Courses Assessment' },
    { id: 4, name: 'Entrepreneur Courses Assessment' }
  ]

  courses.forEach(c => {
    const genBody = JSON.stringify({
      course_id: c.id,
      name: c.name,
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
        console.log(`Course ${c.id} (${c.name}) Generate Status:`, genRes.statusCode, data)
      })
    })
    genReq.write(genBody)
    genReq.end()
  })
})

req.write(loginData)
req.end()
