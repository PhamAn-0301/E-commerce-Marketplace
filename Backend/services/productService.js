const ProductModel = require('../models/productModel');

const ProductService = {
  // Xử lý nghiệp vụ lấy sản phẩm trang chủ.
  // Service chuyển page/limit thành offset, gọi model lấy danh sách và đếm tổng song song,
  // sau đó gom lại thành dữ liệu products + pagination cho controller trả về API.
  async getHomeProducts({ page, limit, search, categoryId }) {
    const offset = (page - 1) * limit;
    const [products, total] = await Promise.all([
      ProductModel.getHomeProducts({ limit, offset, search, categoryId }),
      ProductModel.countHomeProducts({ search, categoryId }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Xử lý nghiệp vụ lấy chi tiết sản phẩm theo id đã được middleware validate.
  // Service tách controller khỏi logic truy vấn trực tiếp xuống database.
  async getProductById(id) {
    return await ProductModel.getPublicById(id);
  },
};

module.exports = ProductService;
