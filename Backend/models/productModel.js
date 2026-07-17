
// Kết nối tới PostgreSQL
const pool = require('../config/db');
// Kết nối tới Meilisearch (search engine)
const meiliClient = require('../config/meilisearch');

// Tên index sản phẩm trên Meilisearch, lấy từ biến môi trường hoặc mặc định là 'products'
const PRODUCTS_INDEX = process.env.MEILI_PRODUCTS_INDEX || 'products';
// Trạng thái sản phẩm đang hoạt động
const ACTIVE_STATUS = 'active';

// Các trường sẽ lấy về khi search sản phẩm (Meilisearch) - dùng cho listing
const PRODUCT_SEARCH_FIELDS = [
  'id',
  'name',
  'short_des',
  'min_price',
  'status',
  'category_id',
  'shop_id',
  'shop_name',
  'thumbnails',
  'total_stock',
  'created_at',
];

// Các trường sẽ lấy về khi gợi ý sản phẩm (autocomplete)
const PRODUCT_SUGGESTION_FIELDS = [
  'id',
  'name',
  'min_price',
  'thumbnails',
];

/**
 * Tạo filter cho truy vấn Meilisearch, chỉ lấy sản phẩm active, có thể lọc theo category
 * @param {Object} param0
 * @returns {Array} Mảng filter cho Meilisearch
 */
function buildMeiliProductFilters({ categoryIds } = {}) {
  const filters = [`status = ${ACTIVE_STATUS}`];

  if (categoryIds && categoryIds.length > 0) {
    filters.push(`category_id IN [${categoryIds.join(', ')}]`);
  }

  return filters;
}

/**
 * Tạo điều kiện WHERE và giá trị cho truy vấn PostgreSQL
 * Hỗ trợ lọc theo search và category
 * @param {Object} param0
 * @returns {Object} { values, conditions }
 */
function buildPostgresProductWhere({ search, categoryIds } = {}) {
  const values = [ACTIVE_STATUS];
  const conditions = ['p.status = $1'];

  if (search) {
    // Thêm điều kiện tìm kiếm theo tên hoặc mô tả (không phân biệt hoa thường)
    values.push(`%${search}%`);
    const searchParam = `$${values.length}`;
    conditions.push(`(p.name ILIKE ${searchParam} OR p.short_des ILIKE ${searchParam} OR p.full_des ILIKE ${searchParam})`);
  }

  if (categoryIds && categoryIds.length > 0) {
    values.push(categoryIds);
    conditions.push(`p.category_id = ANY($${values.length}::bigint[])`);
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
    min_price: product.min_price,
    thumbnails: product.thumbnails,
  };
}

// Object chứa các hàm thao tác với dữ liệu sản phẩm
const ProductModel = {
  /**
   * Tìm kiếm sản phẩm bằng Meilisearch (dùng khi có search keyword)
   * @param {Object} param0 { search, limit, offset, categoryId }
   * @returns {Object} { products, total }
   */
  async searchProductsWithMeili({ search, limit, offset, categoryIds }) {
    // Gọi Meilisearch để tìm kiếm sản phẩm
    const result = await meiliClient.index(PRODUCTS_INDEX).search(search, {
      limit,
      offset,
      filter: buildMeiliProductFilters({ categoryIds }),
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
   * JOIN với bảng shops để lấy shop_name hiển thị trên card
   * @param {Object} param0 { limit, offset, search, categoryId }
   * @returns {Array} Danh sách sản phẩm
   */
  async getActiveProductsFromDb({ limit, offset, search, categoryIds }) {
    // Xây dựng điều kiện WHERE và giá trị truy vấn
    const { values, conditions } = buildPostgresProductWhere({ search, categoryIds });

    // Thêm limit và offset vào values
    values.push(limit);
    const limitParam = values.length;
    values.push(offset);
    const offsetParam = values.length;

    // Truy vấn danh sách sản phẩm từ PostgreSQL, JOIN shops để lấy shop_name
    const result = await pool.query(
      `SELECT p.id, p.name, p.short_des, p.min_price, p.thumbnails,
              p.total_stock, p.status, p.category_id, p.shop_id, p.created_at,
              s.shop_name
       FROM products p
       LEFT JOIN shops s ON p.shop_id = s.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.created_at DESC, p.id DESC
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
  async countActiveProductsFromDb({ search, categoryIds }) {
    const { values, conditions } = buildPostgresProductWhere({ search, categoryIds });

    // Truy vấn đếm tổng số sản phẩm
    const result = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM products p
       WHERE ${conditions.join(' AND ')}`,
      values
    );

    return result.rows[0].total;
  },

  /**
   * Lấy chi tiết sản phẩm theo id từ PostgreSQL
   * JOIN shops để lấy thông tin shop, JOIN categories để lấy tên danh mục
   * @param {number|string} id
   * @returns {Object|null} Sản phẩm hoặc null nếu không tìm thấy
   */
  async getPublicById(id) {
    // Query 1: Lấy thông tin sản phẩm + shop + category
    const productResult = await pool.query(
      `SELECT p.*,
              s.shop_name, s.description AS shop_description,
              c.name AS category_name
       FROM products p
       LEFT JOIN shops s ON p.shop_id = s.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.status = $2`,
      [id, ACTIVE_STATUS]
    );

    const product = productResult.rows[0];
    if (!product) return null;

    // Query 2: Lấy danh sách biến thể (variants) của sản phẩm
    const variantsResult = await pool.query(
      `SELECT id, product_id, name, attribute, price, stock
       FROM product_variants
       WHERE product_id = $1
       ORDER BY id ASC`,
      [id]
    );

    // Gộp variants vào object product
    product.variants = variantsResult.rows;

    return product;
  },

  /**
   * Lấy gợi ý sản phẩm (autocomplete) từ PostgreSQL (dùng làm fallback khi Meilisearch lỗi)
   * @param {Object} param0 { keyword, limit }
   * @returns {Array} Danh sách suggestion
   */
  async getSearchSuggestionsFromDb({ keyword, limit }) {
    const result = await pool.query(
      `SELECT id, name, min_price, thumbnails
       FROM products
       WHERE status = $1 AND name ILIKE $2
       LIMIT $3`,
      [ACTIVE_STATUS, `%${keyword}%`, limit]
    );

    return result.rows.map(toSuggestion);
  },
};

// Export object ProductModel để các file khác import và sử dụng các hàm bên trong
module.exports = ProductModel;
