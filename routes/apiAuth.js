const express = require('express');
const router = express.Router();
const apiAuthController = require('../controllers/apiAuthController');

// Đăng ký API: POST /auth/register
router.post('/auth/register', apiAuthController.registerApi);
// Đăng nhập API: POST /auth/login
router.post('/auth/login', apiAuthController.loginApi);

module.exports = router;
