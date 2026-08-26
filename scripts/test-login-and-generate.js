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
  console.log('Login Status:', res.statusCode)
  const cookies = res.headers['set-cookie']
  if (cookies) {
    const cookieStr = cookies.map(c => c.split(';')[0]).join('; ')
    console.log('Got cookie:', cookieStr)

    const genBody = JSON.stringify({
      course_id: 1,
      name: 'Certification Courses Assessment',
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
      console.log('/api/admin/assessment/generate Status:', genRes.statusCode)
      let data = ''
      genRes.on('data', d => data += d)
      genRes.on('end', () => {
        console.log('Generate Response:', data)
      })
    })

    genReq.write(genBody)
    genReq.end()
  }
})

req.write(loginData)
req.end()
