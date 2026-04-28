const ProductModel = require('../models/productModel');

const ProductService = {
  async getAllProducts() {
    return await ProductModel.getAll();
  },
  async getProductById(id) {
    return await ProductModel.getById(id);
  },
};

module.exports = ProductService;
