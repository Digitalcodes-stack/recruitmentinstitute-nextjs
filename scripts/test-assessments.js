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
  if (cookies) {
    const cookieStr = cookies.map(c => c.split(';')[0]).join('; ')
    const pageReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/admin/assessments',
      method: 'GET',
      headers: {
        'Cookie': cookieStr
      }
    }, (pageRes) => {
      console.log('/admin/assessments HTTP Status:', pageRes.statusCode)
      let body = ''
      pageRes.on('data', d => body += d)
      pageRes.on('end', () => {
        console.log('Page contains "Course Assessments":', body.includes('Course Assessments'))
        console.log('Page contains "Assessment Question Bank":', body.includes('Assessment Question Bank'))
      })
    })
    pageReq.end()
  }
})

req.write(loginData)
req.end()
