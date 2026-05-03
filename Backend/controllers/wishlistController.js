const wishlistService = require('../services/wishlistService');

async function getWishlist(req, res) {
    try {
        const userId = req.user.id;
        const items = await wishlistService.getWishlist(userId);
        res.json({ items });
    } catch (err) {
        console.error('Lỗi lấy wishlist:', err);
        res.status(500).json({ error: 'Lỗi lấy danh sách yêu thích' });
    }
}

async function checkWishlist(req, res) {
    try {
        const userId = req.user.id;
        const { productId, variantId } = req.params;
        const result = await wishlistService.checkInWishlist(userId, productId, variantId);
        res.json(result);
    } catch (err) {
        if (err.message === 'Thiếu thông tin sản phẩm') {
            return res.status(400).json({ error: err.message });
        }
        console.error('Lỗi check wishlist:', err);
        res.status(500).json({ error: 'Lỗi kiểm tra danh sách yêu thích' });
    }
}

async function toggleWishlist(req, res) {
    try {
        const userId = req.user.id;
        const { product_id, variant_id } = req.body;
        const result = await wishlistService.toggleWishlist(userId, product_id, variant_id);
        res.json(result);
    } catch (err) {
        if (err.message === 'Thiếu thông tin sản phẩm') {
            return res.status(400).json({ error: err.message });
        }
        console.error('Lỗi toggle wishlist:', err);
        res.status(500).json({ error: 'Lỗi cập nhật danh sách yêu thích' });
    }
}

async function removeWishlistItem(req, res) {
    try {
        const userId = req.user.id;
        const itemId = req.params.itemId;
        const result = await wishlistService.removeById(userId, itemId);
        res.json(result);
    } catch (err) {
        if (err.message === 'Không tìm thấy sản phẩm trong danh sách yêu thích') {
            return res.status(404).json({ error: err.message });
        }
        console.error('Lỗi xóa wishlist item:', err);
        res.status(500).json({ error: 'Lỗi xóa sản phẩm' });
    }
}

module.exports = {
    getWishlist,
    checkWishlist,
    toggleWishlist,
    removeWishlistItem
};
