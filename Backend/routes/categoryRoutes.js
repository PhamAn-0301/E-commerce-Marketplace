const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// Lấy danh sách toàn bộ danh mục (dạng cây)
router.get('/', CategoryController.getAllCategories);

module.exports = router;
