import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const prodDbUrl = 'postgresql://postgres:RI_CloudSql_2026_Pass!@35.200.228.49:5432/recruitmentinstitute'

async function main() {
  console.log('Connecting to Cloud SQL database...')
  const pool = new Pool({ connectionString: prodDbUrl, connectionTimeoutMillis: 15000 })

  try {
    console.log('Ensuring schema updates...')
    await pool.query(`ALTER TABLE trainers ADD COLUMN IF NOT EXISTS timezone VARCHAR(255) DEFAULT 'Asia/Kolkata';`)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trainer_availability (
        id SERIAL PRIMARY KEY,
        trainer_id INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        start_time VARCHAR(255) NOT NULL,
        end_time VARCHAR(255) NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await pool.query(`CREATE INDEX IF NOT EXISTS trainer_availability_trainer_id_idx ON trainer_availability(trainer_id);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS trainer_availability_day_of_week_idx ON trainer_availability(day_of_week);`)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
        certificate_no VARCHAR(255) NOT NULL UNIQUE,
        student_name VARCHAR(255) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        final_score DECIMAL(5, 2),
        issued_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        pdf_url TEXT
      );
    `)
    console.log('Schema tables verified.')

    const password = await bcrypt.hash('Trainer@123', 10)

    const trainers = [
      {
        name: 'Priya Sharma',
        email: 'trainerpriya@recruitmentinstitute.com',
        phone: '9876543210',
        specialization: 'HR',
        bio: 'Experienced recruitment and HR practitioner at Recruitment Institute.',
        image: '/assets/images/trainers/priyanka_kulkarni.jpg',
      },
      {
        name: 'Suresh Bansal',
        email: 'suresh.bansal@institute.com',
        phone: '9870001001',
        specialization: 'Talent Sourcing',
        bio: 'Expert sourcing specialist.',
        image: '/assets/images/trainers/amit_deshmukh.jpg',
      },
      {
        name: 'Priti Shah',
        email: 'priti.shah@institute.com',
        phone: '9870001002',
        specialization: 'Corporate HR',
        bio: 'Corporate HR consultant.',
        image: '/assets/images/trainers/ananya_roy.jpg',
      },
      {
        name: 'Rohit Malhotra',
        email: 'rohit.malhotra@institute.com',
        phone: '9870001003',
        specialization: 'Executive Search',
        bio: 'Executive search specialist.',
        image: '/assets/images/trainers/vikram_joshi.jpg',
      },
      {
        name: 'Vivek Srivastava',
        email: 'vivek.srivastava@institute.com',
        phone: '9870001004',
        specialization: 'Tech Recruitment',
        bio: 'Tech recruitment lead.',
        image: '/assets/images/trainers/rajesh_sharma.jpg',
      },
      {
        name: 'Brahmita Nayak',
        email: 'brahmita.nayak@institute.com',
        phone: '9870001005',
        specialization: 'HR & Soft Skills',
        bio: 'HR and soft-skills trainer with 15+ years of experience, having trained 1000+ professionals across recruitment and corporate HR programs.',
        image: '/assets/images/trainers/brahmita_mam.jpg',
      },
      {
        name: 'Shesha Shhiv Mohanty',
        email: 'shesha.mohanty@institute.com',
        phone: '9870001006',
        specialization: 'AI Transformation & Recruitment',
        bio: 'AI transformation and recruitment trainer with 15+ years of experience, having trained 1000+ professionals across HR tech and talent acquisition.',
        image: '/assets/images/trainers/shesha_sir.jpg',
      },
    ]

    const FULL_DAY_WEEKEND = [0, 6].map((dayOfWeek) => ({ dayOfWeek, startTime: '09:00', endTime: '18:00' }))
    const WEEKDAY_EVENING = [1, 2, 3, 4, 5].map((dayOfWeek) => ({ dayOfWeek, startTime: '19:00', endTime: '23:00' }))
    const AVAILABILITY = [...FULL_DAY_WEEKEND, ...WEEKDAY_EVENING]

    for (const t of trainers) {
      const exists = await pool.query('SELECT id FROM trainers WHERE email = $1', [t.email])
      let trainerId: number
      if (exists.rows.length > 0) {
        trainerId = exists.rows[0].id
        await pool.query(
          `UPDATE trainers SET name = $1, phone = $2, specialization = $3, bio = $4, image = $5, status = true WHERE id = $6`,
          [t.name, t.phone, t.specialization, t.bio, t.image, trainerId]
        )
      } else {
        const ins = await pool.query(
          `INSERT INTO trainers (name, email, password, phone, specialization, bio, image, status, timezone, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'Asia/Kolkata', NOW(), NOW()) RETURNING id`,
          [t.name, t.email, password, t.phone, t.specialization, t.bio, t.image]
        )
        trainerId = ins.rows[0].id
      }

      // Add availability for Brahmita and Shesha
      if (t.name === 'Brahmita Nayak' || t.name === 'Shesha Shhiv Mohanty') {
        await pool.query('DELETE FROM trainer_availability WHERE trainer_id = $1', [trainerId])
        for (const slot of AVAILABILITY) {
          await pool.query(
            `INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [trainerId, slot.dayOfWeek, slot.startTime, slot.endTime]
          )
        }
      }

      console.log(`Synced trainer: ${t.name} (id ${trainerId})`)
    }

    const total = await pool.query('SELECT count(*) FROM trainers WHERE status = true')
    console.log(`Successfully synced! Total active trainers in Cloud SQL: ${total.rows[0].count}`)
  } catch (err: any) {
    console.error('Error syncing Cloud SQL:', err.message)
  } finally {
    await pool.end()
  }
}

main()
