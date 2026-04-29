
// Kết nối tới PostgreSQL
const pool = require('../config/db');
// Kết nối tới Meilisearch (search engine)
const meiliClient = require('../config/meilisearch');

// Tên index sản phẩm trên Meilisearch, lấy từ biến môi trường hoặc mặc định là 'products'
const PRODUCTS_INDEX = process.env.MEILI_PRODUCTS_INDEX || 'products';
// Trạng thái sản phẩm đang hoạt động
const ACTIVE_STATUS = 'active';

// Các trường sẽ lấy về khi search sản phẩm (Meilisearch)
const PRODUCT_SEARCH_FIELDS = [
  'id',
  'name',
  'description',
  'price',
  'status',
  'category_id',
  'thumbnail',
  'thumbnail_url',
  'image_url',
  'stock',
  'stock_quantity',
  'created_at',
];

// Các trường sẽ lấy về khi gợi ý sản phẩm (autocomplete)
const PRODUCT_SUGGESTION_FIELDS = [
  'id',
  'name',
  'price',
  'thumbnail',
  'thumbnail_url',
  'image_url',
];

/**
 * Tạo filter cho truy vấn Meilisearch, chỉ lấy sản phẩm active, có thể lọc theo category
 * @param {Object} param0
 * @returns {Array} Mảng filter cho Meilisearch
 */
function buildMeiliProductFilters({ categoryId } = {}) {
  const filters = [`status = ${ACTIVE_STATUS}`];

  if (categoryId) {
    filters.push(`category_id = ${categoryId}`);
  }

  return filters;
}

/**
 * Tạo điều kiện WHERE và giá trị cho truy vấn PostgreSQL
 * Hỗ trợ lọc theo search và category
 * @param {Object} param0
 * @returns {Object} { values, conditions }
 */
function buildPostgresProductWhere({ search, categoryId } = {}) {
  const values = [ACTIVE_STATUS];
  const conditions = ['status = $1'];

  if (search) {
    // Thêm điều kiện tìm kiếm theo tên hoặc mô tả (không phân biệt hoa thường)
    values.push(`%${search}%`);
    conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  if (categoryId) {
    values.push(categoryId);
    conditions.push(`category_id = $${values.length}`);
  }

  return { values, conditions };
}

/**
 * Chuyển đổi object sản phẩm thành object suggestion (dùng cho autocomplete)
 * @param {Object} product
 * @returns {Object} suggestion
 */
function toSuggestion(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    thumbnail: product.thumbnail,
    thumbnail_url: product.thumbnail_url,
    image_url: product.image_url,
  };
}

// Object chứa các hàm thao tác với dữ liệu sản phẩm
const ProductModel = {
  /**
   * Tìm kiếm sản phẩm bằng Meilisearch (dùng khi có search keyword)
   * @param {Object} param0 { search, limit, offset, categoryId }
   * @returns {Object} { products, total }
   */
  async searchProductsWithMeili({ search, limit, offset, categoryId }) {
    // Gọi Meilisearch để tìm kiếm sản phẩm
    const result = await meiliClient.index(PRODUCTS_INDEX).search(search, {
      limit,
      offset,
      filter: buildMeiliProductFilters({ categoryId }),
      attributesToRetrieve: PRODUCT_SEARCH_FIELDS,
    });

    return {
      products: result.hits, // Danh sách sản phẩm tìm được
      total: result.estimatedTotalHits || 0, // Tổng số sản phẩm tìm được
    };
  },

  /**
   * Gợi ý sản phẩm (autocomplete) bằng Meilisearch
   * @param {Object} param0 { keyword, limit }
   * @returns {Array} Danh sách suggestion
   */
  async getSearchSuggestionsWithMeili({ keyword, limit }) {
    // Gọi Meilisearch để lấy suggestion
    const result = await meiliClient.index(PRODUCTS_INDEX).search(keyword, {
      limit,
      filter: buildMeiliProductFilters(),
      attributesToRetrieve: PRODUCT_SUGGESTION_FIELDS,
    });

    // Chuyển đổi kết quả sang dạng suggestion
    return result.hits.map(toSuggestion);
  },

  /**
   * Lấy danh sách sản phẩm active từ PostgreSQL (dùng khi không có search keyword)
   * @param {Object} param0 { limit, offset, search, categoryId }
   * @returns {Array} Danh sách sản phẩm
   */
  async getActiveProductsFromDb({ limit, offset, search, categoryId }) {
    // Xây dựng điều kiện WHERE và giá trị truy vấn
    const { values, conditions } = buildPostgresProductWhere({ search, categoryId });

    // Thêm limit và offset vào values
    values.push(limit);
    const limitParam = values.length;
    values.push(offset);
    const offsetParam = values.length;

    // Truy vấn danh sách sản phẩm từ PostgreSQL
    const result = await pool.query(
      `SELECT *
       FROM products
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC, id DESC
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      values
    );

    return result.rows;
  },

  /**
   * Đếm tổng số sản phẩm active từ PostgreSQL (dùng cho phân trang)
   * @param {Object} param0 { search, categoryId }
   * @returns {number} Tổng số sản phẩm
   */
  async countActiveProductsFromDb({ search, categoryId }) {
    const { values, conditions } = buildPostgresProductWhere({ search, categoryId });

    // Truy vấn đếm tổng số sản phẩm
    const result = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM products
       WHERE ${conditions.join(' AND ')}`,
      values
    );

    return result.rows[0].total;
  },

  /**
   * Lấy chi tiết sản phẩm theo id từ PostgreSQL (database là nguồn dữ liệu thật)
   * @param {number|string} id
   * @returns {Object|null} Sản phẩm hoặc null nếu không tìm thấy
   */
  async getPublicById(id) {
    // Truy vấn chi tiết sản phẩm theo id và trạng thái active
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND status = $2',
      [id, ACTIVE_STATUS]
    );

    return result.rows[0] || null;
  },
};

// Export object ProductModel để các file khác import và sử dụng các hàm bên trong
module.exports = ProductModel;
