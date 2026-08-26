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
  console.log('Login Status:', res.statusCode)
  const cookies = res.headers['set-cookie']
  if (!cookies) {
    console.log('No cookie received!')
    return
  }
  const cookieStr = cookies.map(c => c.split(';')[0]).join('; ')
  console.log('Cookie:', cookieStr)

  // Test loading /admin/assessments
  const pageReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin/assessments',
    method: 'GET',
    headers: { 'Cookie': cookieStr }
  }, (pageRes) => {
    console.log('Local /admin/assessments Status:', pageRes.statusCode)
    let pageBody = ''
    pageRes.on('data', d => pageBody += d)
    pageRes.on('end', () => {
      console.log('Page has "Every course has an assessment":', pageBody.includes('Every course has an assessment'))
      console.log('Page has "questions":', pageBody.includes('questions'))
    })
  })
  pageReq.end()
})

req.write(loginData)
req.end()
