const express = require('express');
const router = express.Router();
const apiAuthController = require('../controllers/apiAuthController');

// Đăng ký API
router.post('/register', apiAuthController.registerApi);
// Đăng nhập API
router.post('/login', apiAuthController.loginApi);

module.exports = router;
