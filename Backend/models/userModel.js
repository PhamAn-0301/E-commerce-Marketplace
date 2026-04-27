const pool = require('../config/db');

async function findByEmail(email) {
    const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
    return result.rows[0] || null;
}

async function createUser({ full_name, email, password_hash, phone, role }) {
    await pool.query(
        'INSERT INTO "users" (full_name, email, password_hash, phone, role, is_active, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,TRUE,NOW(),NOW())',
        [full_name, email, password_hash, phone, role]
    );
}

module.exports = {
    findByEmail,
    createUser
};
