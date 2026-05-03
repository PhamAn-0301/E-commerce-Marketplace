const pool = require('../config/db');

// Tìm shop theo user_id (một seller chỉ có một shop).
async function findByUserId(userId) {
    const result = await pool.query(
        'SELECT id, user_id, shop_name, description, status, created_at FROM shops WHERE user_id = $1',
        [userId]
    );
    return result.rows[0] || null;
}

// Cập nhật thông tin shop (tên shop, mô tả).
async function updateShopInfo(shopId, { shop_name, description }) {
    const result = await pool.query(
        'UPDATE shops SET shop_name = $1, description = $2 WHERE id = $3 RETURNING id, user_id, shop_name, description, status',
        [shop_name, description, shopId]
    );
    return result.rows[0] || null;
}

module.exports = {
    findByUserId,
    updateShopInfo
};
