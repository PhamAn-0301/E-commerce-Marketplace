const cartModel = require('../models/cartModel');

async function getCart(userId) {
    const cart = await cartModel.getOrCreateCart(userId);
    const items = await cartModel.getCartItems(cart.id);
    return {
        cart_id: cart.id,
        items: items
    };
}

async function addToCart(userId, product_id, variant_id, quantity) {
    if (!product_id || !variant_id || !quantity) {
        throw new Error('Thiếu thông tin sản phẩm hoặc số lượng');
    }

    if (quantity > 20) {
        throw new Error('Không thể mua quá 20 sản phẩm cùng lúc');
    }

    const cart = await cartModel.getOrCreateCart(userId);
    await cartModel.addItemToCart(cart.id, product_id, variant_id, quantity);
    return { message: 'Đã thêm vào giỏ hàng thành công!' };
}

async function updateCartItem(userId, cartItemId, quantity) {
    if (!quantity || quantity < 1) {
        throw new Error('Số lượng không hợp lệ');
    }
    if (quantity > 20) {
        throw new Error('Không thể mua quá 20 sản phẩm');
    }

    const cart = await cartModel.getOrCreateCart(userId);
    const updated = await cartModel.updateItemQuantity(cartItemId, cart.id, quantity);
    
    if (!updated) {
        throw new Error('Không tìm thấy sản phẩm trong giỏ');
    }

    return { message: 'Đã cập nhật số lượng', item: updated };
}

async function removeCartItem(userId, cartItemId) {
    const cart = await cartModel.getOrCreateCart(userId);
    const removed = await cartModel.removeItemFromCart(cartItemId, cart.id);
    
    if (!removed) {
        throw new Error('Không tìm thấy sản phẩm trong giỏ');
    }

    return { message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
}

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem
};
