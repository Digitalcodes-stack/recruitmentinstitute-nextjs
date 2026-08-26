const http = require('https')

async function testLive() {
  const loginData = JSON.stringify({ email: 'admin@institute.com', password: 'Admin@123' })
  
  const req = http.request({
    hostname: 'recruitmentinstitute-web-396924250862.asia-south1.run.app',
    path: '/api/auth/admin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, (res) => {
    console.log('Login HTTP Status:', res.statusCode)
    const cookies = res.headers['set-cookie']
    console.log('Set-Cookie received:', !!cookies)

    let body = ''
    res.on('data', (d) => body += d)
    res.on('end', () => {
      console.log('Login Response:', body)
      if (cookies) {
        const cookieStr = cookies.map(c => c.split(';')[0]).join('; ')
        const statsReq = http.request({
          hostname: 'recruitmentinstitute-web-396924250862.asia-south1.run.app',
          path: '/api/admin/stats',
          method: 'GET',
          headers: {
            'Cookie': cookieStr
          }
        }, (statsRes) => {
          console.log('Stats HTTP Status:', statsRes.statusCode)
          let statsBody = ''
          statsRes.on('data', (d) => statsBody += d)
          statsRes.on('end', () => {
            console.log('Stats Success:', JSON.parse(statsBody).success)
            console.log('Stats KPIs:', JSON.stringify(JSON.parse(statsBody).data?.kpis, null, 2))
          })
        })
        statsReq.end()
      }
    })
  })

  req.write(loginData)
  req.end()
}

testLive()
