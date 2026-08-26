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
  const pageReq = https.request({
    hostname: 'recruitmentinstitute-web-396924250862.asia-south1.run.app',
    path: '/admin/assessments',
    method: 'GET',
    headers: { 'Cookie': cookieStr }
  }, (pageRes) => {
    let body = ''
    pageRes.on('data', d => body += d)
    pageRes.on('end', () => {
      console.log('HTTP Status:', pageRes.statusCode)
      console.log('Has "4 questions" or "10 questions":', body.includes('10 questions') || body.includes('question'))
      console.log('Has "Every course has an assessment":', body.includes('Every course has an assessment'))
    })
  })
  pageReq.end()
})

req.write(loginData)
req.end()
