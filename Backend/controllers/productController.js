const ProductService = require('../services/productService');

const ProductController = {
  async getAll(req, res) {
    try {
      const products = await ProductService.getAllProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi lấy danh sách sản phẩm' });
    }
  },

  async getById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi lấy chi tiết sản phẩm' });
    }
  },
};

module.exports = ProductController;
