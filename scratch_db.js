const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.nsbrgrxjbzwxrnfjbuxh:Baoan0902727331@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log('Users columns:', res.rows);

    const res2 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'shops'
      ORDER BY ordinal_position;
    `);
    console.log('Shops columns:', res2.rows);

    const res3 = await pool.query(`SELECT id, email, role, full_name, phone FROM users LIMIT 3`);
    console.log('Sample users:', res3.rows);

    const res4 = await pool.query(`SELECT * FROM shops LIMIT 2`);
    console.log('Sample shops:', res4.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkSchema();
