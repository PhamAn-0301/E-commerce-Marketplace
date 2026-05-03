const pool = require('../config/db');

const CategoryModel = {
  /**
   * Lấy toàn bộ danh mục từ database
   */
  async getAllCategories() {
    const result = await pool.query(
      `SELECT id, name, parent_id FROM categories ORDER BY parent_id NULLS FIRST, id ASC`
    );
    return result.rows;
  },

  /**
   * Lấy id của một danh mục và các danh mục con của nó
   * @param {number|string} categoryId 
   * @returns {Array<number>} Mảng chứa các id
   */
  async getCategoryAndChildrenIds(categoryId) {
    if (!categoryId) return [];
    
    // Tìm các category có id = categoryId hoặc parent_id = categoryId
    const result = await pool.query(
      `SELECT id FROM categories WHERE id = $1 OR parent_id = $1`,
      [categoryId]
    );

    return result.rows.map(row => Number(row.id));
  }
};

module.exports = CategoryModel;
