const ProductModel = require('../models/productModel');

function getOffset(page, limit) {
  return (page - 1) * limit;
}

function createPagination({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

const ProductService = {
  // Luồng chính của GET /api/products.
  // Có search: dùng Meilisearch để lấy kết quả liên quan.
  // Không search: dùng PostgreSQL để lấy danh sách mặc định mới nhất.
  async getHomeProducts({ page, limit, search, categoryId }) {
    const offset = getOffset(page, limit);

    if (search) {
      const result = await ProductModel.searchProductsWithMeili({
        search,
        limit,
        offset,
        categoryId,
      });

      return {
        products: result.products,
        pagination: createPagination({ page, limit, total: result.total }),
      };
    }

    const [products, total] = await Promise.all([
      ProductModel.getActiveProductsFromDb({ limit, offset, search, categoryId }),
      ProductModel.countActiveProductsFromDb({ search, categoryId }),
    ]);

    return {
      products,
      pagination: createPagination({ page, limit, total }),
    };
  },

  // Luồng GET /api/products/:id.
  // Luôn lấy từ PostgreSQL để đảm bảo chi tiết là dữ liệu thật mới nhất.
  async getProductById(id) {
    return await ProductModel.getPublicById(id);
  },

  // Luồng GET /api/products/suggestions?q=...
  // Dùng Meilisearch cho autocomplete, nhưng bỏ qua keyword quá ngắn.
  async getProductSuggestions({ keyword, limit }) {
    if (!keyword || keyword.length < 2) {
      return [];
    }

    return await ProductModel.getSearchSuggestionsWithMeili({ keyword, limit });
  },
};

module.exports = ProductService;
