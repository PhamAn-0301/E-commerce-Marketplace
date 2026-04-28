const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const {
    validateProductListQuery,
    validateProductId,
} = require('../middlewares/productMiddleware');

// Public API: danh sách sản phẩm hiển thị ở trang chủ
// Request đi qua validateProductListQuery trước, sau đó mới vào controller.
router.get('/', validateProductListQuery, ProductController.getHomeProducts);

// Public API: chi tiết sản phẩm
// Request đi qua validateProductId để đảm bảo id hợp lệ trước khi query database.
router.get('/:id', validateProductId, ProductController.getById);

module.exports = router;
