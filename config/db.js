const { Pool } = require('pg');

// Sử dụng session pooler (ví dụ: PgBouncer ở chế độ session)
const pool = new Pool({
  connectionString: process.env.DB_URI,
  // Có thể thêm các option pooler nếu cần
  // max: 20, // số connection tối đa
  // idleTimeoutMillis: 30000, // thời gian idle tối đa
  // connectionTimeoutMillis: 2000, // timeout khi kết nối
});

module.exports = pool;
