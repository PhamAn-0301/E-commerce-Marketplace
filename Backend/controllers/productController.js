const ProductService = require('../services/productService');

const ProductController = {
  // Controller cho API GET /api/products.
  // Middleware đã chuẩn hóa query vào req.productListQuery, controller chỉ gọi service
  // và trả JSON gồm message, products, pagination cho frontend.
  async getHomeProducts(req, res) {
    try {
      // req.productListQuery được tạo ở validateProductListQuery.
      // Controller không đọc req.query trực tiếp để đảm bảo dữ liệu đã được validate.
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

  // Controller cho API GET /api/products/suggestions?q=...
  // API này phục vụ autocomplete trên frontend khi người dùng đang gõ từ khóa.
  async getSuggestions(req, res) {
    try {
      // req.productSuggestionQuery được tạo ở validateProductSuggestionQuery,
      // gồm keyword lấy từ q và limit giới hạn số gợi ý trả về.
      const suggestions = await ProductService.getProductSuggestions(req.productSuggestionQuery);
      res.json({
        message: 'Lấy gợi ý sản phẩm thành công',
        suggestions,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi lấy gợi ý sản phẩm' });
    }
  },
};

module.exports = ProductController;
