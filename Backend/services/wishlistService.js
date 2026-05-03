const wishlistModel = require('../models/wishlistModel');

async function getWishlist(userId) {
    const wishlist = await wishlistModel.getOrCreateWishlist(userId);
    const items = await wishlistModel.getWishlistItems(wishlist.id);
    return items;
}

async function checkInWishlist(userId, productId, variantId) {
    if (!productId || !variantId) {
        throw new Error('Thiếu thông tin sản phẩm');
    }
    const wishlist = await wishlistModel.getOrCreateWishlist(userId);
    const item = await wishlistModel.checkItemInWishlist(wishlist.id, productId, variantId);
    return { in_wishlist: !!item };
}

async function toggleWishlist(userId, productId, variantId) {
    if (!productId || !variantId) {
        throw new Error('Thiếu thông tin sản phẩm');
    }
    const wishlist = await wishlistModel.getOrCreateWishlist(userId);
    
    // Check if already exists
    const existingItem = await wishlistModel.checkItemInWishlist(wishlist.id, productId, variantId);
    
    if (existingItem) {
        // Remove it
        await wishlistModel.removeItem(wishlist.id, productId, variantId);
        return { message: 'Đã bỏ yêu thích', in_wishlist: false };
    } else {
        // Add it
        await wishlistModel.addItem(wishlist.id, productId, variantId);
        return { message: 'Đã thêm vào danh sách yêu thích', in_wishlist: true };
    }
}

async function removeById(userId, wishlistItemId) {
    const wishlist = await wishlistModel.getOrCreateWishlist(userId);
    const removed = await wishlistModel.removeItemById(wishlist.id, wishlistItemId);
    if (!removed) {
        throw new Error('Không tìm thấy sản phẩm trong danh sách yêu thích');
    }
    return { message: 'Đã xóa khỏi danh sách yêu thích' };
}

module.exports = {
    getWishlist,
    checkInWishlist,
    toggleWishlist,
    removeById
};
