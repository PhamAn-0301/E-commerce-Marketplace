const express = require('express');
const router = express.Router();
const apiAuthController = require('../controllers/apiAuthController');

// Đăng ký API: POST /auth/register
router.post('/register', apiAuthController.registerApi);
// Đăng nhập: nếu là JSON thì là API, nếu là form thì là giao diện
router.post('/login', (req, res, next) => {
	if (req.is('application/json')) {
		return apiAuthController.loginApi(req, res, next);
	} else {
		return apiAuthController.loginFormHandler(req, res, next);
	}
});

module.exports = router;
