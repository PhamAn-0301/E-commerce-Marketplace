const ProductService = require('../services/productService');

const ProductController = {
  // Controller cho API GET /api/products.
  // Middleware đã chuẩn hóa query vào req.productListQuery, controller chỉ gọi service
  // và trả JSON gồm message, products, pagination cho frontend.
  async getHomeProducts(req, res) {
    try {
      const result = await ProductService.getHomeProducts(req.productListQuery);
      res.json({
        message: 'Lấy danh sách sản phẩm trang chủ thành công',
        ...result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi lấy danh sách sản phẩm' });
    }
  },

  // Controller cho API GET /api/products/:id.
  // Middleware đã validate id vào req.productId, controller gọi service lấy chi tiết
  // và trả 404 nếu không tìm thấy sản phẩm active.
  async getById(req, res) {
    try {
      const product = await ProductService.getProductById(req.productId);
      if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
      res.json({
        message: 'Lấy chi tiết sản phẩm thành công',
        product,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi lấy chi tiết sản phẩm' });
    }
  },
};

module.exports = ProductController;
