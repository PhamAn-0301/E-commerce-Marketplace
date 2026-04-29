const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const {
    validateProductListQuery,
    validateProductId,
    validateProductSuggestionQuery,
} = require('../middlewares/productMiddleware');

// Public API: danh sách sản phẩm hiển thị ở trang chủ
// Request đi qua validateProductListQuery trước, sau đó mới vào controller.
// Ví dụ URL: GET /api/products?page=1&limit=20&search=bottle
router.get('/', validateProductListQuery, ProductController.getHomeProducts);

// Public API: gợi ý sản phẩm khi người dùng đang nhập từ khóa.
// Route này phải đặt trước "/:id" để Express không hiểu "suggestions" là id sản phẩm.
// Ví dụ URL: GET /api/products/suggestions?q=bot&limit=6
router.get('/suggestions', validateProductSuggestionQuery, ProductController.getSuggestions);

// Public API: chi tiết sản phẩm
// Request đi qua validateProductId để đảm bảo id hợp lệ trước khi query database.
router.get('/:id', validateProductId, ProductController.getById);

module.exports = router;
