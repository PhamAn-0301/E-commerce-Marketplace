const cartService = require('../services/cartService');

// GET /api/cart
// Lấy toàn bộ giỏ hàng của user hiện tại
async function getCart(req, res) {
    try {
        const userId = req.user.id;
        const result = await cartService.getCart(userId);
        res.json(result);
    } catch (err) {
        console.error('Lỗi lấy giỏ hàng:', err);
        res.status(500).json({ error: 'Không thể lấy giỏ hàng' });
    }
}

// POST /api/cart/add
// Thêm sản phẩm vào giỏ
async function addToCart(req, res) {
    try {
        const userId = req.user.id;
        const { product_id, variant_id, quantity } = req.body;

        const result = await cartService.addToCart(userId, product_id, variant_id, quantity);
        res.json(result);
    } catch (err) {
        if (err.message === 'Thiếu thông tin sản phẩm hoặc số lượng' || err.message === 'Không thể mua quá 20 sản phẩm cùng lúc') {
            return res.status(400).json({ error: err.message });
        }
        console.error('Lỗi thêm giỏ hàng:', err);
        res.status(500).json({ error: 'Không thể thêm vào giỏ hàng' });
    }
}

// PUT /api/cart/update/:itemId
// Cập nhật số lượng
async function updateCartItem(req, res) {
    try {
        const userId = req.user.id;
        const cartItemId = req.params.itemId;
        const { quantity } = req.body;

        const result = await cartService.updateCartItem(userId, cartItemId, quantity);
        res.json(result);
    } catch (err) {
        if (err.message === 'Số lượng không hợp lệ' || err.message === 'Không thể mua quá 20 sản phẩm') {
            return res.status(400).json({ error: err.message });
        }
        if (err.message === 'Không tìm thấy sản phẩm trong giỏ') {
            return res.status(404).json({ error: err.message });
        }
        console.error('Lỗi cập nhật giỏ hàng:', err);
        res.status(500).json({ error: 'Không thể cập nhật giỏ hàng' });
    }
}

// DELETE /api/cart/remove/:itemId
// Xóa sản phẩm khỏi giỏ
async function removeCartItem(req, res) {
    try {
        const userId = req.user.id;
        const cartItemId = req.params.itemId;

        const result = await cartService.removeCartItem(userId, cartItemId);
        res.json(result);
    } catch (err) {
        if (err.message === 'Không tìm thấy sản phẩm trong giỏ') {
            return res.status(404).json({ error: err.message });
        }
        console.error('Lỗi xóa sản phẩm giỏ hàng:', err);
        res.status(500).json({ error: 'Không thể xóa sản phẩm' });
    }
}

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem
};
