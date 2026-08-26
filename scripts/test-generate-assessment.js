const { signToken } = require('./lib-auth-helper')
const https = require('https')

const token = signToken({
  sub: '11',
  userId: 11,
  id: 11,
  email: 'admin@institute.com',
  name: 'Institute Admin',
  type: 'admin',
  role: 'SUPER_ADMIN'
})

const body = JSON.stringify({
  course_id: 1,
  name: 'Certification Courses Assessment',
  question_types: ['mcq'],
  question_count: 10
})

const req = https.request({
  hostname: 'recruitmentinstitute-api-396924250862.asia-south1.run.app',
  path: '/api/v1/assessment/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  console.log('FastAPI Generate Status:', res.statusCode)
  let data = ''
  res.on('data', d => data += d)
  res.on('end', () => {
    console.log('FastAPI Generate Response:', data)
  })
})

req.on('error', (e) => console.error('Request error:', e))
req.write(body)
req.end()
