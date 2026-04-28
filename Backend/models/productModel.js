const db = require('../config/db');

const ProductModel = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM products WHERE status = ? ORDER BY id DESC', ['active']);
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },
};

module.exports = ProductModel;
