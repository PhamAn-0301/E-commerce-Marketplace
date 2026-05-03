const pool = require('../config/db');

async function getOrCreateWishlist(userId) {
    let result = await pool.query('SELECT id FROM wishlists WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
        result = await pool.query(
            'INSERT INTO wishlists (user_id, created_at) VALUES ($1, NOW()) RETURNING id',
            [userId]
        );
    }
    return result.rows[0];
}

async function getWishlistItems(wishlistId) {
    const query = `
        SELECT 
            wi.id as wishlist_item_id,
            p.id as product_id,
            p.name as product_name,
            p.thumbnails,
            pv.id as variant_id,
            pv.name as variant_name,
            pv.price,
            s.shop_name
        FROM wishlist_items wi
        JOIN products p ON wi.product_id = p.id
        JOIN product_variants pv ON wi.variant_id = pv.id
        JOIN shops s ON p.shop_id = s.id
        WHERE wi.wishlist_id = $1
        ORDER BY wi.id DESC
    `;
    const result = await pool.query(query, [wishlistId]);
    return result.rows;
}

async function checkItemInWishlist(wishlistId, productId, variantId) {
    const result = await pool.query(
        'SELECT id FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2 AND variant_id = $3',
        [wishlistId, productId, variantId]
    );
    return result.rows[0] || null;
}

async function addItem(wishlistId, productId, variantId) {
    const result = await pool.query(
        'INSERT INTO wishlist_items (wishlist_id, product_id, variant_id) VALUES ($1, $2, $3) RETURNING id',
        [wishlistId, productId, variantId]
    );
    return result.rows[0];
}

async function removeItem(wishlistId, productId, variantId) {
    const result = await pool.query(
        'DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2 AND variant_id = $3 RETURNING id',
        [wishlistId, productId, variantId]
    );
    return result.rows[0] || null;
}

async function removeItemById(wishlistId, wishlistItemId) {
    const result = await pool.query(
        'DELETE FROM wishlist_items WHERE id = $1 AND wishlist_id = $2 RETURNING id',
        [wishlistItemId, wishlistId]
    );
    return result.rows[0] || null;
}

module.exports = {
    getOrCreateWishlist,
    getWishlistItems,
    checkItemInWishlist,
    addItem,
    removeItem,
    removeItemById
};
