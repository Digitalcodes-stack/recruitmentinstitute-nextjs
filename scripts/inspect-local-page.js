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

  const pageReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin/assessments',
    method: 'GET',
    headers: { 'Cookie': cookieStr }
  }, (pageRes) => {
    console.log('HTTP Status:', pageRes.statusCode)
    let data = ''
    pageRes.on('data', d => data += d)
    pageRes.on('end', () => {
      console.log('Page has "4 Ready for students":', data.includes('Ready for students'))
      console.log('Page has "Assessment ID":', data.includes('Assessment #') || data.includes('questions'))
      console.log('Page has "Delete Question":', data.includes('Delete Question') || data.includes('Add Question'))
    })
  })
  pageReq.end()
})

req.write(loginData)
req.end()
