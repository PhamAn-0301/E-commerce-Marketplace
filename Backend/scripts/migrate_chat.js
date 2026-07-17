require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigration() {
    console.log('--- Bắt đầu chạy Script khởi tạo bảng Chat ---');
    
    // Đường dẫn tới file SQL
    const sqlPath = path.join(__dirname, 'create_chat_tables.sql');
    
    try {
        // Đọc nội dung file SQL
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Đang kết nối tới Database và thực thi SQL...');
        // Thực thi SQL query
        await pool.query(sql);
        
        console.log(' Chúc mừng! Khởi tạo các bảng chat_rooms và chat_messages thành công.');
    } catch (error) {
        console.error(' Có lỗi xảy ra trong quá trình chạy script SQL:', error.message);
    } finally {
        // Đóng kết nối database pool
        await pool.end();
        console.log('--- Hoàn thành quá trình chạy migration ---');
    }
}

runMigration();
