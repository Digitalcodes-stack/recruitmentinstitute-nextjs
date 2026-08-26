const jwt = require('jsonwebtoken')
const https = require('https')

const secretsToTest = [
  'dev-secret-key-for-local-development-only-change-in-prod',
  'dev-secret-key-for-local-development-only-change-in-prod\n',
  'dev-secret-key-for-local-development-only-change-in-prod\r\n',
  'Zblcrmn2sqdUoEkDgQz61eIpNV5G3YMH',
  'Zblcrmn2sqdUoEkDgQz61eIpNV5G3YMH\n',
  'Zblcrmn2sqdUoEkDgQz61eIpNV5G3YMH\r\n',
  'dev-service-key-for-internal-api-only',
  'dev-service-key-for-internal-api-only\n',
  'dev-service-key-for-internal-api-only\r\n',
]

async function testSecret(secretName, secret) {
  const payload = {
    userId: 11,
    email: 'admin@institute.com',
    name: 'Institute Admin',
    role: 'SUPER_ADMIN',
    type: 'admin'
  }

  const token = jwt.sign(payload, secret, { expiresIn: '7d', algorithm: 'HS256' })

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'recruitmentinstitute-api-396924250862.asia-south1.run.app',
      path: '/api/v1/assessment/by-course/1',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = ''
      res.on('data', d => data += d)
      res.on('end', () => {
        console.log(`Secret [${JSON.stringify(secretName)}] -> Status: ${res.statusCode}, Body: ${data.slice(0, 80)}`)
        resolve()
      })
    })
    req.end()
  })
}

async function run() {
  for (const s of secretsToTest) {
    await testSecret(s, s)
  }
}

run()
