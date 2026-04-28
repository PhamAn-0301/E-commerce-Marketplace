const pool = require('../config/db');

const ProductModel = {
  // Lấy danh sách sản phẩm đang active để hiển thị ở trang chủ.
  // Hỗ trợ phân trang bằng limit/offset và lọc tùy chọn theo search, categoryId.
  // Query dùng parameter $1, $2... để tránh SQL injection.
  async getHomeProducts({ limit, offset, search, categoryId }) {
    const values = ['active'];
    const conditions = ['status = $1'];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }

    if (categoryId) {
      values.push(categoryId);
      conditions.push(`category_id = $${values.length}`);
    }

    values.push(limit);
    const limitParam = values.length;
    values.push(offset);
    const offsetParam = values.length;

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

  // Đếm tổng số sản phẩm đang active theo cùng bộ lọc với getHomeProducts.
  // Kết quả này dùng để frontend biết tổng số trang và tổng số sản phẩm.
  async countHomeProducts({ search, categoryId }) {
    const values = ['active'];
    const conditions = ['status = $1'];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }

    if (categoryId) {
      values.push(categoryId);
      conditions.push(`category_id = $${values.length}`);
    }

    const result = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM products
       WHERE ${conditions.join(' AND ')}`,
      values
    );

    return result.rows[0].total;
  },

  // Lấy chi tiết một sản phẩm công khai theo id.
  // Chỉ trả sản phẩm có status active để người dùng không xem được sản phẩm bị ẩn.
  async getPublicById(id) {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND status = $2',
      [id, 'active']
    );

    return result.rows[0] || null;
  },
};

module.exports = ProductModel;
