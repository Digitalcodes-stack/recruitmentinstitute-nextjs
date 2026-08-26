const http = require('http')

const loginData = JSON.stringify({ email: 'admin@institute.com', password: 'Admin@123' })

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/admin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  const cookieStr = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ')
  console.log('Local login cookie received:', !!cookieStr)

  const genBody = JSON.stringify({
    course_id: 2,
    name: 'Corporate Training Courses Assessment',
    question_types: ['mcq'],
    question_count: 10
  })

  const genReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/assessment/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieStr,
      'Content-Length': Buffer.byteLength(genBody)
    }
  }, (genRes) => {
    console.log('Local /api/admin/assessment/generate Status:', genRes.statusCode)
    let data = ''
    genRes.on('data', d => data += d)
    genRes.on('end', () => {
      console.log('Generate Result:', data)
    })
  })

  genReq.write(genBody)
  genReq.end()
})

req.write(loginData)
req.end()
