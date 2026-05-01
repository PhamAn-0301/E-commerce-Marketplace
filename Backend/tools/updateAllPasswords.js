require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function updatePasswords() {
    try {
        console.log("Đang kết nối đến Database...");
        
        // Lấy danh sách tất cả các user
        const result = await pool.query('SELECT id, password_hash FROM users');
        const users = result.rows;
        
        console.log(`Tìm thấy ${users.length} tài khoản trong database. Đang tiến hành kiểm tra và mã hóa...`);
        
        let countUpdated = 0;

        for (const user of users) {
            const currentPassword = user.password_hash;
            
            // Kiểm tra xem password đã là bcrypt hash chưa 
            // (hash của bcrypt có chiều dài 60 ký tự và bắt đầu bằng $2b$ hoặc $2a$)
            if (currentPassword && !currentPassword.startsWith('$2b$') && !currentPassword.startsWith('$2a$')) {
                // Mã hóa password hiện tại (ví dụ '123456') thành bcrypt hash
                const hashedPassword = await bcrypt.hash(currentPassword, 10);
                
                // Cập nhật lại vào database
                await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, user.id]);
                
                console.log(` - Đã mã hóa và cập nhật thành công cho User ID: ${user.id}`);
                countUpdated++;
            }
        }

        console.log(`\nHOÀN THÀNH! Đã cập nhật tổng cộng ${countUpdated} tài khoản.`);
    } catch (err) {
        console.error("Gặp lỗi trong quá trình thực thi:", err);
    } finally {
        // Đóng kết nối để script có thể kết thúc (thoát)
        await pool.end();
        console.log("Đã đóng kết nối database.");
    }
}

updatePasswords();
