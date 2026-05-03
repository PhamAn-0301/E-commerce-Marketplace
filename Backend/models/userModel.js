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
// Tìm user theo id (dùng cho profile, đổi mật khẩu).
async function findById(id) {
    const result = await pool.query('SELECT * FROM "users" WHERE id = $1', [id]);
    return result.rows[0] || null;
}

// Cập nhật thông tin cá nhân (tên, số điện thoại).
async function updateProfile(id, { full_name, phone }) {
    const result = await pool.query(
        'UPDATE "users" SET full_name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING id, full_name, email, phone, role',
        [full_name, phone, id]
    );
    return result.rows[0] || null;
}

// Cập nhật mật khẩu (đã hash sẵn từ service).
async function updatePassword(id, password_hash) {
    await pool.query(
        'UPDATE "users" SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [password_hash, id]
    );
}

module.exports = {
    findByEmail,
    createUser,
    findById,
    updateProfile,
    updatePassword
};
