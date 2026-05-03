const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

// Tất cả thao tác giỏ hàng đều yêu cầu đăng nhập
router.use(authenticateJWT);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update/:itemId', cartController.updateCartItem);
router.delete('/remove/:itemId', cartController.removeCartItem);

module.exports = router;
