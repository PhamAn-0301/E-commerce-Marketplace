// Import kết nối database Postgres
const pool = require('../config/db');


/**
 * Tìm user theo email
 * @param {string} email - Email cần tìm
 * @returns {object|null} - Trả về user nếu tìm thấy, ngược lại trả về null
 *
 * Hàm này dùng để kiểm tra email đã tồn tại trong database chưa.
 * Service sẽ gọi hàm này khi cần kiểm tra trùng email lúc đăng ký.
 */
async function findByEmail(email) {
    const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
    return result.rows[0] || null;
}


/**
 * Tạo user mới trong database
 * @param {object} user - Thông tin user gồm full_name, email, password_hash, phone, role
 *
 * Hàm này sẽ được service gọi khi đã validate xong và hash password thành công.
 * Chỉ thực hiện insert, không xử lý logic nghiệp vụ.
 */
async function createUser({ full_name, email, password_hash, phone, role }) {
    await pool.query(
        'INSERT INTO "users" (full_name, email, password_hash, phone, role, is_active, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,TRUE,NOW(),NOW())',
        [full_name, email, password_hash, phone, role]
    );
}


/**
 * Flow tổng thể:
 * - Controller nhận request đăng ký, gọi service.registerUser
 * - Service kiểm tra hợp lệ, gọi model.findByEmail để kiểm tra email
 * - Nếu chưa tồn tại, service hash password rồi gọi model.createUser để lưu user mới
 * - Model chỉ thao tác database, không xử lý logic nghiệp vụ
 */

module.exports = {
    findByEmail,
    createUser
};
