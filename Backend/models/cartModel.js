const pool = require('../config/db');

// Lấy hoặc tạo giỏ hàng cho user
async function getOrCreateCart(userId) {
    // Tìm giỏ hàng hiện tại
    let result = await pool.query('SELECT id, user_id FROM carts WHERE user_id = $1', [userId]);
    let cart = result.rows[0];

    // Nếu chưa có, tạo mới
    if (!cart) {
        result = await pool.query(
            'INSERT INTO carts (user_id, created_at) VALUES ($1, NOW()) RETURNING id, user_id',
            [userId]
        );
        cart = result.rows[0];
    }
    return cart;
}

// Lấy danh sách sản phẩm trong giỏ hàng (JOIN với products, product_variants, shops)
async function getCartItems(cartId) {
    const query = `
        SELECT 
            ci.id as cart_item_id, 
            ci.quantity,
            p.id as product_id, 
            p.name as product_name, 
            p.thumbnails,
            pv.id as variant_id, 
            pv.name as variant_name, 
            pv.price, 
            pv.stock,
            s.id as shop_id,
            s.shop_name
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN product_variants pv ON ci.variant_id = pv.id
        JOIN shops s ON p.shop_id = s.id
        WHERE ci.cart_id = $1
        ORDER BY s.shop_name ASC, p.name ASC
    `;
    const result = await pool.query(query, [cartId]);
    return result.rows;
}

// Thêm sản phẩm vào giỏ hàng (hoặc cộng dồn số lượng nếu đã có)
async function addItemToCart(cartId, productId, variantId, quantity) {
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const checkResult = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
        [cartId, variantId]
    );

    if (checkResult.rows.length > 0) {
        // Đã có -> cộng dồn
        const existingItem = checkResult.rows[0];
        const newQuantity = existingItem.quantity + quantity;
        const updateResult = await pool.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
            [newQuantity, existingItem.id]
        );
        return updateResult.rows[0];
    } else {
        // Chưa có -> thêm mới
        const insertResult = await pool.query(
            'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
            [cartId, productId, variantId, quantity]
        );
        return insertResult.rows[0];
    }
}

// Cập nhật số lượng của 1 mục trong giỏ
async function updateItemQuantity(cartItemId, cartId, quantity) {
    // Phải kiểm tra cartId để đảm bảo user chỉ sửa được item của mình
    const result = await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3 RETURNING *',
        [quantity, cartItemId, cartId]
    );
    return result.rows[0] || null;
}

// Xóa 1 mục khỏi giỏ
async function removeItemFromCart(cartItemId, cartId) {
    const result = await pool.query(
        'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id',
        [cartItemId, cartId]
    );
    return result.rows[0] || null;
}

module.exports = {
    getOrCreateCart,
    getCartItems,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart
};
