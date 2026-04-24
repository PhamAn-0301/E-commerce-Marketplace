const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Hiển thị form đăng ký
router.get('/register', authController.showRegisterForm);
// Xử lý đăng ký
router.post('/register', authController.registerUser);

module.exports = router;
