const pool = require('../config/db');

// Tìm một user theo email.
// Hàm này được service đăng ký/đăng nhập dùng để kiểm tra email đã tồn tại
// hoặc lấy thông tin user trước khi so sánh mật khẩu.
async function findByEmail(email) {
    const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
    return result.rows[0] || null;
}

// Tạo user mới trong database.
// Service truyền vào mật khẩu đã hash sẵn, model chỉ chịu trách nhiệm insert dữ liệu
// và set các cột mặc định như is_active, created_at, updated_at.
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
