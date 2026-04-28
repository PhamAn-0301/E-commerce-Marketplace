const express = require('express');
const router = express.Router();
const apiAuthController = require('../controllers/apiAuthController');

// Đăng ký API
// Route nhận thông tin user mới và chuyển qua controller đăng ký.
router.post('/register', apiAuthController.registerApi);
// Đăng nhập API
// Route nhận email/password và chuyển qua controller đăng nhập.
router.post('/login', apiAuthController.loginApi);

module.exports = router;
