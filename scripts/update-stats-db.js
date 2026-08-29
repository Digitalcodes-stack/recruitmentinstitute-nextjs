const { Pool } = require('pg');

const localUrl = 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute';
const prodUrl = 'postgresql://postgres:RI_CloudSql_2026_Pass!@35.200.228.49:5432/recruitmentinstitute';

const newStats = [
  { icon: 'users', value: '5,000+', label: 'Students Trained', iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
  { icon: 'trending', value: '95%', label: 'Placement Rate', iconBg: '#F0FDF4', iconColor: '#16A34A' },
  { icon: 'award', value: '25+ Yrs', label: 'Of Excellence', iconBg: '#FFFBEB', iconColor: '#D97706' },
  { icon: 'book', value: '6', label: 'Expert Courses', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
];

async function updateDb(url, name) {
  console.log(`Connecting to ${name}...`);
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 8000 });
  try {
    const jsonStr = JSON.stringify(newStats);
    await pool.query(
      `INSERT INTO site_settings (id, site_name, stats_json, updated_at)
       VALUES (1, 'Recruitment Institute', $1::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET stats_json = $1::jsonb, updated_at = NOW()`,
      [jsonStr]
    );
    console.log(`✅ ${name} site_settings updated successfully with 25+ Yrs!`);
  } catch (err) {
    console.warn(`⚠️ Error updating ${name}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function main() {
  await updateDb(localUrl, 'Local PostgreSQL');
  await updateDb(prodUrl, 'Cloud SQL Production');
}

main().catch(console.error);
