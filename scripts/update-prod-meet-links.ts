import { Pool } from 'pg'

function generateMeetLink(sessionId: number, batchId: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const hash = (sessionId * 9301 + batchId * 49297 + 233280) % 100000000
  let code = ''
  let num = hash
  for (let i = 0; i < 10; i++) {
    code += chars[num % chars.length]
    num = Math.floor(num / chars.length) + (i + 1) * 7
  }
  const p1 = code.slice(0, 3)
  const p2 = code.slice(3, 7)
  const p3 = code.slice(7, 10)
  return `https://meet.google.com/${p1}-${p2}-${p3}`
}

async function updateDb(connectionString: string, name: string) {
  console.log(`Connecting to ${name}...`)
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 })
  try {
    const res = await pool.query('SELECT id, title, meet_link, batch_id FROM sessions')
    console.log(`Found ${res.rows.length} sessions in ${name}.`)

    let updated = 0
    for (const s of res.rows) {
      if (!s.meet_link || s.meet_link.includes('sample-link') || !s.meet_link.startsWith('http')) {
        const link = generateMeetLink(s.id, s.batch_id || 1)
        await pool.query('UPDATE sessions SET meet_link = $1 WHERE id = $2', [link, s.id])
        updated++
      }
    }
    console.log(`Successfully updated ${updated} sessions in ${name}!`)
  } catch (err: any) {
    console.error(`Error updating ${name}:`, err.message)
  } finally {
    await pool.end()
  }
}

async function main() {
  const localDb = 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute'
  const prodDb = 'postgresql://postgres:RI_CloudSql_2026_Pass!@35.200.228.49:5432/recruitmentinstitute'

  await updateDb(localDb, 'Local Database')
  await updateDb(prodDb, 'Production Cloud SQL')
}

main()
