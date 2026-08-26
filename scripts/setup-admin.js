require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const dbUrl = process.argv[2] || process.env.DATABASE_URL

console.log('Connecting to database:', dbUrl.replace(/:[^:@]+@/, ':****@'))
const pool = new Pool({ connectionString: dbUrl })

async function setupAdmin() {
  const hash = await bcrypt.hash('Admin@123', 12)

  // Upsert admin@institute.com
  const res1 = await pool.query(
    `INSERT INTO user_admin (name, email, password, role, status, updated_at)
     VALUES ('Institute Admin', 'admin@institute.com', $1, 'SUPER_ADMIN', true, NOW())
     ON CONFLICT (email) 
     DO UPDATE SET password = $1, status = true, role = 'SUPER_ADMIN', updated_at = NOW()
     RETURNING id, name, email, role, status;`,
    [hash]
  )
  console.log('Upserted:', res1.rows[0])

  // Upsert admin@recruitmentinstitute.com
  const res2 = await pool.query(
    `INSERT INTO user_admin (name, email, password, role, status, updated_at)
     VALUES ('Super Administrator', 'admin@recruitmentinstitute.com', $1, 'SUPER_ADMIN', true, NOW())
     ON CONFLICT (email) 
     DO UPDATE SET password = $1, status = true, role = 'SUPER_ADMIN', updated_at = NOW()
     RETURNING id, name, email, role, status;`,
    [hash]
  )
  console.log('Upserted:', res2.rows[0])

  // Also update test@gmail.com
  const res3 = await pool.query(
    `UPDATE user_admin SET password = $1, status = true, role = 'SUPER_ADMIN', updated_at = NOW()
     WHERE email = 'test@gmail.com'
     RETURNING id, name, email, role, status;`,
    [hash]
  )
  console.log('Updated test@gmail.com:', res3.rows[0])

  await pool.end()
}

setupAdmin().catch(console.error)
