const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.nsbrgrxjbzwxrnfjbuxh:Baoan0902727331@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkWishlistSchema() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%wish%';
    `);
    console.log('Wishlist tables:', res.rows);

    for (const row of res.rows) {
      const colRes = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [row.table_name]);
      console.log(`Columns for ${row.table_name}:`, colRes.rows);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkWishlistSchema();
