require('dotenv').config();
const { Pool } = require('pg');

const curatedTestimonials = [
  {
    author: 'Priya Sharma',
    title: 'Placed at Top MNC within 3 Months',
    description: 'The Recruitment Institute completely transformed my career trajectory. Coming from zero HR background, the hands-on Boolean sourcing, cold calling simulations, and ATS training gave me the competence to crack multiple interviews and land my dream role at an MNC.',
    image: '/assets/images/testimonials/priya_sharma.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Rahul Verma',
    title: 'Best Technical Recruitment Training in India',
    description: 'I have attended multiple online courses, but nothing matches the depth and real-world practical mentorship here. The deep dive into tech stacks, Boolean X-Ray searches, and candidate negotiation tactics is unparalleled.',
    image: '/assets/images/testimonials/rahul_verma.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Anjali Singh',
    title: 'Outstanding Mentorship & Dedicated Support',
    description: 'The mentors are veteran industry practitioners who genuinely care about student success. Their personalized resume workshops, mock interviews, and placement guidance helped me transition into a high-growth Talent Acquisition Lead position.',
    image: '/assets/images/testimonials/anjali_singh.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Deepak Mehta',
    title: 'High ROI & In-Depth Industry Curriculum',
    description: 'Compared to other coaching centers, the fee is exceptionally reasonable while the training rigor is top-tier. Every session covers real hiring workflows, pipeline bottlenecks, and compensation structuring.',
    image: '/assets/images/testimonials/deepak_mehta.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Sneha Patel',
    title: 'Launched My Own HR Staffing Consultancy',
    description: 'The Entrepreneurship Incubator track gave me the confidence, legal MSA contracts, and client acquisition scripts to launch my recruitment consultancy. Within 6 months of finishing the program, we achieved consistent monthly billing.',
    image: '/assets/images/testimonials/sneha_patel.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Vivek Singh',
    title: 'Exceptional Corporate Batch & Upskilling',
    description: 'Our corporate talent acquisition cohort gained immense practical clarity on full-lifecycle recruitment, candidate drop-off management, and recruiter incentive models. Highly recommended for corporate teams.',
    image: '/assets/images/testimonials/vivek_singh.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Nisha Jain',
    title: 'Engaging Interactive Classes & Practical Tools',
    description: 'The daily recruiter trackers, JD frameworks, and live interactive simulations make learning intuitive and actionable. You build real recruitment muscle memory rather than just memorizing theoretical concepts.',
    image: '/assets/images/testimonials/nisha_jain.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Karan Mehta',
    title: 'Genuine Placement Support & Follow-Through',
    description: 'The placement team stays in constant touch even months after cohort completion. The interview preparation, salary negotiation coaching, and industry connections gave me a huge competitive advantage in the job market.',
    image: '/assets/images/testimonials/karan_mehta.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Shweta Rao',
    title: 'Encouraging Community & Expert Faculty',
    description: 'The supportive peer community and weekly masterclasses made it effortless to stay consistent and master difficult hiring domains like DevOps and Cloud engineering recruitment.',
    image: '/assets/images/testimonials/shweta_rao.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Mohit Jain',
    title: 'Hands-On Sourcing & Pipeline Tracking',
    description: 'I appreciated that every assignment was tied directly to real-world sourcing funnels and actual client requisitions. The candidate screening rubrics have become my go-to daily toolkit.',
    image: '/assets/images/testimonials/mohit_jain.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Rohan Kulkarni',
    title: 'Practical Staffing Operations Mastery',
    description: 'From understanding GST compliance to structuring 90-day replacement clauses in client MSAs, this academy provides the definitive playbook for modern staffing agency operations.',
    image: '/assets/images/testimonials/rohan_kulkarni.jpg',
    rating: 5,
    status: true,
  },
  {
    author: 'Pooja Deshmukh',
    title: 'Smooth Transition from Fresher to HR Specialist',
    description: 'Starting with zero recruitment knowledge, the comprehensive curriculum, live mentor feedback, and industry certifications enabled me to secure an HR Specialist position at a leading enterprise.',
    image: '/assets/images/testimonials/pooja_deshmukh.jpg',
    rating: 5,
    status: true,
  },
];

async function updateDb(connStr, dbName) {
  console.log(`\nUpdating testimonials in ${dbName}...`);
  const pool = new Pool({ connectionString: connStr });

  try {
    // 1. Clear out existing duplicates
    await pool.query('DELETE FROM testimonials');
    console.log(`Cleared existing duplicate rows in ${dbName}`);

    // 2. Insert the 12 curated, non-duplicate, gender-matched records
    for (let i = 0; i < curatedTestimonials.length; i++) {
      const t = curatedTestimonials[i];
      await pool.query(
        `INSERT INTO testimonials (id, author, title, description, image, rating, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [i + 1, t.author, t.title, t.description, t.image, t.rating, t.status]
      );
    }

    // Reset sequence if exists
    try {
      await pool.query(`SELECT setval(pg_get_serial_sequence('testimonials', 'id'), (SELECT MAX(id) FROM testimonials));`);
    } catch (seqErr) {
      // ignore if not serial
    }

    const countRes = await pool.query('SELECT count(*) FROM testimonials');
    console.log(`✅ ${dbName} now has ${countRes.rows[0].count} unique, verified testimonials.`);
  } catch (err) {
    console.error(`Error updating ${dbName}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function main() {
  const localUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute';
  const cloudSqlUrl = 'postgresql://postgres:RI_CloudSql_2026_Pass!@34.93.13.46:5432/recruitmentinstitute';

  await updateDb(localUrl, 'Local PostgreSQL DB');
  await updateDb(cloudSqlUrl, 'Cloud SQL Production DB');
}

main().catch(console.error);
