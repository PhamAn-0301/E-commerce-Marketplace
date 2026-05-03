const CategoryModel = require('../models/categoryModel');

const CategoryController = {
  async getAllCategories(req, res) {
    try {
      const categories = await CategoryModel.getAllCategories();
      
      // Xây dựng cấu trúc cây danh mục
      const categoryMap = new Map();
      const tree = [];

      // Khởi tạo map
      categories.forEach(cat => {
        categoryMap.set(Number(cat.id), {
          id: Number(cat.id),
          name: cat.name,
          children: []
        });
      });

      // Phân bổ danh mục con vào danh mục cha
      categories.forEach(cat => {
        const node = categoryMap.get(Number(cat.id));
        if (cat.parent_id) {
          const parentId = Number(cat.parent_id);
          const parentNode = categoryMap.get(parentId);
          if (parentNode) {
            parentNode.children.push(node);
          }
        } else {
          // Danh mục gốc
          tree.push(node);
        }
      });

      res.json({
        message: 'Lấy danh sách danh mục thành công',
        categories: tree
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi lấy danh sách danh mục' });
    }
  }
};

module.exports = CategoryController;
